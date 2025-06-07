from flask import Flask, jsonify, request, send_from_directory, redirect, session, url_for
import os
import random
from flask_cors import CORS
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

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    file_path = os.path.join(app.static_folder, path)
    if path != "" and os.path.exists(file_path):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, "index.html")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=True)
