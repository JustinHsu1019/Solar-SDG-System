# 使用 Node + Python 的整合 base image
FROM node:18-bullseye

# 安裝 Python 與依賴
RUN apt-get update && apt-get install -y python3 python3-pip

# 設定工作目錄
WORKDIR /app

# 複製所有檔案到容器
COPY . .

# 安裝 pnpm 與前端依賴
WORKDIR /app/src/frontend
RUN npm install -g pnpm concurrently \
 && pnpm install \
 && pnpm build

# 回到根目錄安裝 Python 套件
WORKDIR /app
RUN pip3 install --no-cache-dir -r requirements.txt

# 開放三個埠口
EXPOSE 3000 5001 8080

# 啟動所有服務（注意：你要在 package.json 裡定義 "start": "next start"）
CMD ["sh", "-c", "concurrently \"pnpm --prefix src/frontend start\" \"python3 src/dsa_backend/app.py\" \"python3 src/backend/run.py\""]
