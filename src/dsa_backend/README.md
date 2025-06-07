## 🔧 安裝與啟動

### 1. 建立虛擬環境（推薦使用 Python 3.12）

```bash
python3.12 -m venv caca
source caca/bin/activate
```

### 2. 安裝依賴套件

```bash
pip install -r requirements.txt
```

### 3. 設定環境變數（OpenAI API Key）

你可以將以下內容加入 `.env` 檔案，或手動 export：

```bash
export OPENAI_API_KEY=your_openai_api_key
```

### 4. 啟動 Flask API

```bash
python app.py
```

伺服器將在 `http://localhost:5001` 運行。

---

## 🔹 1. `POST /api/recommend`

### 📥 請求格式（JSON）

| 欄位名稱            | 類型     | 說明            | 範例值     |
| --------------- | ------ | ------------- | ------- |
| `roof_area_m2`  | float  | 屋頂面積（單位：平方公尺） | `100`   |
| `coverage_rate` | float  | 可用面積比例（0\~1）  | `0.75`  |
| `orientation`   | string | 屋頂朝向          | `"南"`   |
| `house_type`    | string | 建物類型          | `"透天"`  |
| `roof_type`     | string | 屋頂類型          | `"平屋頂"` |
| `address`       | string | 安裝地址（可輸入縣市名稱） | `"新北市"` |

---

### 📤 回傳格式（部分欄位）

每個模組為一筆 `recommendations`，如下：

```json
{
  "module_name": "DBK420HFA",
  "brand": "聯合再生能源",
  "type": "單晶矽",
  "efficiency_percent": 21.51,
  "efficiency_level": "高效",
  "capacity_kw": 11.34,
  "daily_kwh_per_kw": 2.57,
  "annual_generation_kwh": 10641,
  "fit_rate_total": 6.6458,
  "annual_revenue_ntd": 70717,
  "install_cost_ntd": 794062,
  "payback_years": 11.2,
  "environmental_benefit": "減碳 4.8 噸/年",
  "investment_projection_20yr": [
    { "year": 1, "value": -723345 },
    { "year": 2, "value": -652627 },
    ...
    { "year": 20, "value": 620297 }
  ]
}
```

---

### 🧪 測試範例 `curl`

```bash
curl -X POST http://localhost:5001/api/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "roof_area_m2": 100,
    "coverage_rate": 0.75,
    "orientation": "南",
    "house_type": "透天",
    "roof_type": "平屋頂",
    "address": "新北市"
}'
```

---

## 🔹 2. `POST /api/llm_decision`

### 📌 功能

根據單一模組的模擬結果（裝置容量、地點、建置成本、年收入、回本年限等），請 GPT-4o 判斷是否推薦安裝、給出推薦分數與理由。

---

### 📥 請求格式（JSON）

| 欄位名稱                    | 類型     | 說明             | 範例值           |
| ----------------------- | ------ | -------------- | ------------- |
| `module_name`           | string | 模組名稱           | `"DBK420HFA"` |
| `efficiency_percent`    | float  | 模組轉換效率 (%)     | `21.51`       |
| `efficiency_level`      | string | 模組效能等級（一般/高效等） | `"高效"`        |
| `capacity_kw`           | float  | 預估裝置容量 (kW)    | `11.34`       |
| `address`               | string | 安裝地點（縣市）       | `"新北市"`       |
| `annual_generation_kwh` | int    | 預估年發電量 (kWh)   | `10641`       |
| `install_cost_ntd`      | int    | 建置成本（新台幣）      | `794062`      |
| `annual_revenue_ntd`    | int    | 年收益（新台幣）       | `70717`       |
| `payback_years`         | float  | 預估回本年限         | `11.2`        |

---

### 📤 回傳格式

```json
{
  "final_recommendation": "保守觀望",
  "score": 0.42,
  "explanation_text": "回本年限偏長，建議保守評估投資風險。"
}
```

---

### 🧪 測試範例 `curl`

```bash
curl -X POST http://localhost:5001/api/llm_decision \
  -H "Content-Type: application/json" \
  -d '{
    "module_name": "DBK420HFA",
    "efficiency_percent": 21.51,
    "efficiency_level": "高效",
    "capacity_kw": 11.34,
    "address": "新北市",
    "annual_generation_kwh": 10641,
    "install_cost_ntd": 794062,
    "annual_revenue_ntd": 70717,
    "payback_years": 11.2
}'
```
