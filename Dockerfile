# 建置前端
FROM node:20 AS builder
WORKDIR /app
COPY src/frontend/ ./

RUN npm install -g pnpm \
  && pnpm install \
  && pnpm run build  # ❌ 不要再跑 next export

# 使用 nginx serve 靜態檔案
FROM nginx:alpine

# 修改 nginx 設定：改為 listen 8080
RUN sed -i 's/80;/8080;/' /etc/nginx/conf.d/default.conf

COPY --from=builder /app/out /usr/share/nginx/html
EXPOSE 8080
