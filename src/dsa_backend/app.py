import json
import os
import re

import google.generativeai as genai
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# 初始化配置
genai.configure(api_key=os.environ.get('GOOGLE_API_KEY', 'GOOGLE_API_KEY'))

load_dotenv()
base_dir = os.path.dirname(__file__)  # 指向 src/dsa_backend
config_path = os.path.join(base_dir, 'solar_config')
with open(os.path.join(config_path, 'modules.json'), encoding='utf-8') as f:
    modules = json.load(f)
with open(os.path.join(config_path, 'formulas.json'), encoding='utf-8') as f:
    formulas = json.load(f)
with open(os.path.join(config_path, 'city_to_kwh_day.json'), encoding='utf-8') as f:
    city_to_kwh_day = json.load(f)
with open(os.path.join(config_path, 'fit_rate_table.json'), encoding='utf-8') as f:
    fit_rate_table = json.load(f)
with open(os.path.join(config_path, 'region_bonus.json'), encoding='utf-8') as f:
    region_bonus = json.load(f)


def get_fit_rate(capacity_kw, efficiency_level, city):
    base_rate = None
    for tier in fit_rate_table:
        max_kw = tier['max_kw'] if tier['max_kw'] is not None else float('inf')
        if tier['min_kw'] <= capacity_kw < max_kw:
            if efficiency_level in ['非常高效', '高效']:
                base_rate = tier['high_eff']
            else:
                base_rate = tier['standard']
            break
    if base_rate is None:
        base_rate = 3.5
    bonus_ratio = region_bonus.get(city, 0)
    return round(base_rate * (1 + bonus_ratio), 4)


# JSON 解析工具
def parse_llm_output(text):
    try:
        return json.loads(text)
    except:
        match = re.search(r'```json\\n(.*?)```', text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(1))
            except:
                pass
        match = re.search(r'```(.*?)```', text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(1))
            except:
                pass
        match = re.search(r'{.*}', text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(0))
            except:
                pass
    return {'final_recommendation': '', 'score': 0, 'explanation_text': '解析失敗'}


# 呼叫 Gemini 產生建議
def generate_llm_outputs(summary):
    prompt = f"""
你是一位太陽能投資顧問。以下是客戶的模擬數據摘要：

{summary}

請根據以上內容提供：
1. final_recommendation（推薦安裝/保守觀望）
2. score（0~1，代表推薦程度）
3. explanation_text（一句話說明評估理由）

請以 JSON 格式輸出，如：
{{
  "final_recommendation": "...",
  "score": 0.78,
  "explanation_text": "..."
}}
"""
    model = genai.GenerativeModel('gemini-2.0-flash')
    response = model.generate_content(prompt)
    return parse_llm_output(response.text)


@app.route('/api/recommend', methods=['POST'])
def recommend():
    data = request.json
    roof_area_m2 = data['roof_area_m2']
    coverage_rate = data['coverage_rate']
    address = data['address']

    recommendations = []
    for mod in modules:
        local_vars = {
            **data,
            **mod,
            'roof_area_m2': roof_area_m2,
            'coverage_rate': coverage_rate,
            'address': address,
            'city_to_kwh_day': city_to_kwh_day,
            'get_fit_rate': lambda cap, eff: get_fit_rate(cap, eff, address),
        }

        try:
            for field, expr in formulas.items():
                if field in ['final_recommendation', 'score', 'explanation_text']:
                    continue
                local_vars[field] = eval(expr, {}, local_vars)
        except Exception as e:
            return jsonify({'error': f'公式計算錯誤: {str(e)}'}), 500

        recommendation = {
            'module_name': mod['module_name'],
            'brand': mod['brand'],
            'type': mod['type'],
            'efficiency_percent': mod['efficiency_percent'],
            'efficiency_level': mod['efficiency_level'],
            'capacity_kw': round(local_vars['capacity_kw'], 2),
            'daily_kwh_per_kw': round(local_vars['daily_kwh_per_kw'], 2),
            'annual_generation_kwh': int(local_vars['annual_generation_kwh']),
            'fit_rate_total': round(local_vars['fit_rate_total'], 4),
            'annual_revenue_ntd': int(local_vars['annual_revenue_ntd']),
            'install_cost_ntd': int(local_vars['install_cost_ntd']),
            'payback_years': round(local_vars['payback_years'], 1),
            'environmental_benefit': local_vars['environmental_benefit'],
            'investment_projection_20yr': [
                {'year': y, 'value': round(-local_vars['install_cost_ntd'] + local_vars['annual_revenue_ntd'] * y)}
                for y in range(1, 21)
            ],
        }

        recommendations.append(recommendation)

    return jsonify({'recommendations': recommendations})


@app.route('/api/llm_decision', methods=['POST'])
def llm_decision():
    data = request.json
    required_fields = [
        'module_name',
        'efficiency_percent',
        'efficiency_level',
        'capacity_kw',
        'address',
        'annual_generation_kwh',
        'install_cost_ntd',
        'annual_revenue_ntd',
        'payback_years',
    ]
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing field: {field}'}), 400

    summary = f"""
模組名稱：{data['module_name']}
模組效率：{data['efficiency_percent']}%
模組等級：{data['efficiency_level']}
裝置容量：{round(data['capacity_kw'], 2)} 瓩
地點：{data['address']}
年發電量：約 {int(data['annual_generation_kwh'])} 度
建置成本：約 {int(data['install_cost_ntd'])} 元
年收入：約 {int(data['annual_revenue_ntd'])} 元
回本年限：約 {round(data['payback_years'], 1)} 年
"""

    result = generate_llm_outputs(summary)
    return jsonify(result)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
