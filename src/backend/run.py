from flask import Flask, jsonify, request, send_from_directory, redirect, session, url_for
import os
import random
from dotenv import load_dotenv
from flask_jwt_extended import create_access_token
from datetime import timedelta
from authlib.integrations.flask_client import OAuth
from flask_jwt_extended import JWTManager

load_dotenv()

app = Flask(__name__, static_folder="static")
app.secret_key = os.environ.get("FLASK_SECRET_KEY", "your-secret-key")
app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY", "dev-secret")
jwt = JWTManager(app)

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
    # http://localhost:8080/login/google/authorize
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
        return redirect(f"http://localhost:3000/oauth-callback?email={email}")
    except Exception as e:
        print("Google OAuth Error:", e)
        return "Google OAuth 登入失敗：" + str(e), 500

@app.route("/api/user")
def get_user():
    user = session.get("user")
    if user:
        return jsonify(user)
    return jsonify({"error": "未登入"}), 401

@app.route("/api/solar-data")
def get_solar_data():
    try:
        lat = float(request.args.get("lat", 0))
        lng = float(request.args.get("lng", 0))

        solar_potential = calculate_solar_potential(lat, lng)
        average_sunlight = calculate_average_sunlight(lat, lng)
        temperature = calculate_average_temperature(lat, lng)
        weather_condition = get_weather_condition(lat, lng)

        return jsonify({
            "solarPotential": solar_potential,
            "averageSunlight": average_sunlight,
            "temperature": temperature,
            "weatherCondition": weather_condition,
            "coordinates": [lat, lng],
        })
    except Exception as e:
        print("Error fetching solar data:", e)
        return jsonify({"error": "Failed to fetch solar data"}), 500

def calculate_solar_potential(lat, lng):
    latitude_factor = max(0, 100 - abs(lat - 23.5) * 2)
    longitude_factor = random.uniform(80, 100)
    return min(100, max(0, (latitude_factor + longitude_factor) / 2))

def calculate_average_sunlight(lat, lng):
    base_sunlight = 5.5 - abs(lat - 23.5) * 0.1
    variation = (random.random() - 0.5) * 1.0
    return max(3.0, min(7.0, base_sunlight + variation))

def calculate_average_temperature(lat, lng):
    base_temp = 28 - (lat - 22) * 0.5
    variation = (random.random() - 0.5) * 4
    return round(max(18, min(35, base_temp + variation)))

def get_weather_condition(lat, lng):
    conditions = ["晴朗", "多雲", "晴時多雲"]
    index = random.randint(0, len(conditions) - 1)
    return conditions[index]

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    file_path = os.path.join(app.static_folder, path)
    if path != "" and os.path.exists(file_path):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, "index.html")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=True)
