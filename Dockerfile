# Dockerfile
# ---- базовые зависимости
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --no-audit --prefer-offline

# ---- dev: Vite + HMR
FROM node:20-alpine AS dev
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
# Копируем остальной код
COPY . .
# Открываем порт dev-сервера
EXPOSE 5173
# Ensure Vite listens on all interfaces inside container
ENV HOST=0.0.0.0
# Запускаем Vite
CMD ["npm","run","dev"]

# ---- build: собираем статическую дистрибуцию
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---- prod: nginx + статика
FROM nginx:1.27-alpine AS prod
# Замена стандартного конфига NGINX
RUN rm -f /etc/nginx/conf.d/default.conf
COPY ./nginx/nginx.conf /etc/nginx/conf.d/app.conf
# Копируем результаты сборки
COPY --from=build /app/dist/ /usr/share/nginx/html/
EXPOSE 80
