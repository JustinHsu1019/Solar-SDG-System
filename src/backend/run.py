from flask import Flask, jsonify, request, send_from_directory, redirect, session, url_for
import os
import random
from flask_cors import CORS
from dotenv import load_dotenv
from flask_jwt_extended import create_access_token
from datetime import timedelta
from authlib.integrations.flask_client import OAuth
from flask_jwt_extended import JWTManager
import requests
from geopy.distance import geodesic

load_dotenv()

app = Flask(__name__, static_folder="static")
app.secret_key = os.environ.get("FLASK_SECRET_KEY", "your-secret-key")
app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY", "dev-secret")
jwt = JWTManager(app)
CORS(app, resources={r"/*": {"origins": "*"}})

# Google OAuth 設定（✅ 改用 OpenID Connect 標準方式）
oauth = OAuth(app)
oauth.register(
    name='google',
    client_id=os.environ.get("GOOGLE_CLIENT_ID"),
    client_secret=os.environ.get("GOOGLE_CLIENT_SECRET"),
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={
        'scope': 'openid email profile'
    }
)


@app.route("/login/google")
def login_google():
    # 1. 觸發 Google OAuth 流程，使用者授權後會回到 /login/google/authorize
    # 請確保下列兩個 redirect_uri 都有加到 Google Cloud Console 的 OAuth 2.0 設定中：
    # http://34.81.110.126:8080/login/google/authorize
    # http://127.0.0.1:8080/login/google/authorize
    redirect_uri = url_for("authorize_google", _external=True)
    return oauth.google.authorize_redirect(redirect_uri)

@app.route("/login/google/authorize")
def authorize_google():
    try:
        token = oauth.google.authorize_access_token()
        # 正確取得 userinfo
        user = oauth.google.userinfo()
        email = user.get("email")
        if not email:
            return "登入失敗，缺少 email", 400

        # 把 email 傳回前端，讓前端直接用
        return redirect(f"https://solarlytics.ddns.net/oauth-callback?email={email}")
    except Exception as e:
        print("Google OAuth Error:", e)
        return "Google OAuth 登入失敗：" + str(e), 500

@app.route("/api/user")
def get_user():
    user = session.get("user")
    if user:
        return jsonify(user)
    return jsonify({"error": "未登入"}), 401

def polygon_area_geodesic(polygon):
    """
    計算多邊形（經緯度座標陣列）在地球表面的近似面積（平方米）
    使用三角剖分與 geopy 計算邊長，再用海龍公式計算面積
    """
    if len(polygon) < 3:
        return 0
    # 以第一點為基準，將多邊形分割為多個三角形
    area = 0
    p0 = (polygon[0]['lat'], polygon[0]['lng'])
    for i in range(1, len(polygon) - 1):
        p1 = (polygon[i]['lat'], polygon[i]['lng'])
        p2 = (polygon[i + 1]['lat'], polygon[i + 1]['lng'])
        # 三邊長
        a = geodesic(p0, p1).meters
        b = geodesic(p1, p2).meters
        c = geodesic(p2, p0).meters
        s = (a + b + c) / 2
        # 海龍公式
        try:
            tri_area = (s * (s - a) * (s - b) * (s - c)) ** 0.5
            area += tri_area
        except Exception:
            pass
    return round(area, 2)

@app.route("/api/roof-detect", methods=["POST"])
def roof_detect():
    data = request.get_json()
    lat = data.get("lat")
    lng = data.get("lng")
    polygon = data.get("polygon")  # 前端傳來的 [{lat, lng}, ...] 陣列

    # 若有多邊形，直接用 geopy 計算面積
    if polygon and isinstance(polygon, list) and len(polygon) >= 3:
        area = polygon_area_geodesic(polygon)
        print(f"geopy 計算多邊形面積: {area} 平方米")  # 新增這行
        return jsonify({"area": area})

    # 取得 Google Maps 靜態圖像 URL，若有 polygon 則用 path 標示
    if polygon and isinstance(polygon, list) and len(polygon) >= 3:
        # path 格式: path=color:0xff0000ff|weight:2|lat1,lng1|lat2,lng2|...
        path_str = "|".join([f"{p['lat']},{p['lng']}" for p in polygon])
        static_map_url = (
            f"https://maps.googleapis.com/maps/api/staticmap"
            f"?size=640x640&maptype=satellite"
            f"&path=color:0xff0000ff|weight:2|{path_str}"
            f"&key={os.environ.get('GOOGLE_MAPS_API_KEY')}"
        )
        # 取中心點作為地圖中心
        center_lat = sum(p['lat'] for p in polygon) / len(polygon)
        center_lng = sum(p['lng'] for p in polygon) / len(polygon)
        static_map_url += f"&center={center_lat},{center_lng}&zoom=20"
    else:
        static_map_url = (
            f"https://maps.googleapis.com/maps/api/staticmap"
            f"?center={lat},{lng}&zoom=20&size=640x640&maptype=satellite"
            f"&key={os.environ.get('GOOGLE_MAPS_API_KEY')}"
        )

    # 下載圖片
    img_resp = requests.get(static_map_url)
    if img_resp.status_code != 200:
        print("無法取得地圖圖片", img_resp.status_code, img_resp.text)
        return jsonify({"error": "無法取得地圖圖片"}), 500

    # 呼叫 Gemini Vision API
    # Gemini 1.0 Pro Vision 已停用，改用 gemini-1.5-flash
    gemini_api_key = os.environ.get("GOOGLE_API_KEY")
    gemini_url = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent"
    headers = {"Content-Type": "application/json"}
    import base64
    img_base64 = base64.b64encode(img_resp.content).decode("utf-8")

    if polygon and isinstance(polygon, list) and len(polygon) >= 3:
        prompt = (
            "請根據這張衛星圖像與紅色多邊形標示區域，"
            "辨識該多邊形區域內的屋頂面積（平方米），"
            "並回傳一個 JSON 格式：{\"area\": 面積數字, \"polygon\": [多邊形座標陣列]}，"
            "polygon 為屋頂輪廓的經緯度陣列。"
        )
    else:
        prompt = (
            "請自動辨識這張衛星圖像中最大屋頂的面積（平方米），"
            "並回傳一個 JSON 格式：{\"area\": 面積數字, \"polygon\": [多邊形座標陣列]}，"
            "polygon 為屋頂輪廓的經緯度陣列。"
        )

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt},
                    {
                        "inlineData": {
                            "mimeType": "image/png",
                            "data": img_base64
                        }
                    }
                ]
            }
        ]
    }
    gemini_full_url = f"{gemini_url}?key={gemini_api_key}"
    gemini_resp = requests.post(gemini_full_url, headers=headers, json=payload)
    if gemini_resp.status_code != 200:
        print("Gemini Vision API 失敗", gemini_resp.status_code, gemini_resp.text)
        return jsonify({"error": "Gemini Vision API 失敗"}), 500

    try:
        gemini_data = gemini_resp.json()
        import json
        result_json = gemini_data["candidates"][0]["content"]["parts"][0]["text"]
        print("Gemini 回傳內容：", result_json)
        result = json.loads(result_json)
        print("Gemini 解析後結果：", result)
        return jsonify(result)
    except Exception as e:
        print("Gemini 回傳解析失敗：", e)
        print("Gemini 原始回傳：", gemini_resp.text)
        return jsonify({"error": "Gemini 回傳解析失敗", "detail": str(e)}), 500

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    file_path = os.path.join(app.static_folder, path)
    if path != "" and os.path.exists(file_path):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, "index.html")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=True)
