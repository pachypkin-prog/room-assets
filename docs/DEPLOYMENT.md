# Развёртывание (Deployment)

Приложение готово к развёртыванию на различные платформы.

## Локальное тестирование перед развёртыванием

### 1. Проверка сборки

```bash
# Собрать для production
npm run build

# Результат: dist/ папка с готовыми файлами
# Размер: ~150 KB (gzipped)
```

### 2. Локальный preview

```bash
# Запустить production сборку локально
npm run preview

# Открыть в браузере: http://localhost:4173
```

### 3. TypeScript check

```bash
# Убедиться что нет ошибок типов
npx tsc --noEmit
```

### 4. Lint check

```bash
# Проверить стиль кода
npm run lint
```

## Развёртывание на GitHub Pages

### Предусловие
- Репозиторий должен быть на GitHub
- GitHub Actions включены

### Шаг 1: Обновить vite.config.ts

Если репозиторий находится по адресу `https://github.com/username/room-assets`:

```typescript
// vite.config.ts
export default defineConfig({
  base: '/room-assets/',  // Добавить если не в root
  plugins: [react()],
})
```

Если сайт будет на пользовательском домене или GitHub Pages по умолчанию:

```typescript
// vite.config.ts
export default defineConfig({
  // base: '/',  // По умолчанию
  plugins: [react()],
})
```

### Шаг 2: Создать GitHub Actions workflow

Создать файл `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main  # Или master, в зависимости от default branch

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run type check
        run: npx tsc --noEmit
      
      - name: Build
        run: npm run build
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### Шаг 3: Включить GitHub Pages

1. Перейти на GitHub → Settings → Pages
2. Source: Deploy from a branch
3. Branch: gh-pages
4. Directory: / (root)
5. Save

### Шаг 4: Push в репозиторий

```bash
git add .
git commit -m "chore: add github pages deployment"
git push origin main
```

Приложение будет доступно на:
- `https://username.github.io/room-assets` (если не в root)
- `https://username.github.io` (если это пользовательский репозиторий)

## Развёртывание на Vercel

### Шаг 1: Подключить репозиторий

1. Перейти на [vercel.com](https://vercel.com)
2. Нажать "New Project"
3. Выбрать Git repository "room-assets"
4. Нажать "Import"

### Шаг 2: Настроить параметры

Vercel должен автоматически определить:
- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm ci`

Если не определил, указать вручную.

### Шаг 3: Deploy

1. Нажать "Deploy"
2. Ждём 1-2 минуты
3. Приложение доступно на `https://<project>.vercel.app`

### Шаг 4: Собственный домен (опционально)

1. Settings → Domains
2. Добавить собственный домен
3. Следовать инструкциям для настройки DNS

## Развёртывание на Netlify

### Шаг 1: Подключить репозиторий

1. Перейти на [netlify.com](https://netlify.com)
2. Нажать "Add new site" → "Connect to Git"
3. Выбрать GitHub и авторизоваться
4. Выбрать репозиторий "room-assets"

### Шаг 2: Настроить параметры

- **Base directory:** / (или пусто)
- **Build command:** `npm run build`
- **Publish directory:** `dist`

### Шаг 3: Deploy

1. Нажать "Deploy site"
2. Ждём завершения
3. Приложение доступно на `https://<random-name>.netlify.app`

## Развёртывание на собственном сервере (nginx)

### Шаг 1: Собрать приложение

```bash
npm install
npm run build

# Результат в папке: dist/
```

### Шаг 2: Скопировать на сервер

```bash
# С локального компьютера
scp -r dist/* user@server:/var/www/room-assets/

# Или через git
git clone https://github.com/username/room-assets.git
cd room-assets
npm install && npm run build
```

### Шаг 3: Настроить nginx

```nginx
# /etc/nginx/sites-available/room-assets
server {
    listen 80;
    server_name room-assets.example.com;

    root /var/www/room-assets;
    index index.html;

    # SPA routing - перенаправить все 404 на index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Кэширование статических файлов
    location ~* \.(js|css|png|jpg|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Не кэшировать HTML
    location ~ \.html?$ {
        expires 0;
        add_header Cache-Control "must-revalidate";
    }

    # GZIP сжатие
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
    gzip_vary on;
}
```

### Шаг 4: Включить сайт

```bash
sudo ln -s /etc/nginx/sites-available/room-assets \
           /etc/nginx/sites-enabled/room-assets

sudo nginx -t  # Проверить конфиг
sudo systemctl restart nginx
```

### Шаг 5: SSL сертификат (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d room-assets.example.com

# Автоматическое обновление
sudo systemctl enable certbot.timer
```

## Развёртывание с Docker

### Шаг 1: Создать Dockerfile

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Скопировать сборку из builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Скопировать nginx конфиг
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Шаг 2: Создать nginx.conf

```nginx
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|svg)$ {
        expires 1y;
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
}
```

### Шаг 3: Собрать и запустить Docker image

```bash
# Собрать образ
docker build -t room-assets:1.0.0 .

# Запустить контейнер
docker run -p 80:80 room-assets:1.0.0

# Приложение доступно на http://localhost
```

### Шаг 4: Docker Compose (опционально)

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

```bash
docker-compose up -d
```

## Развёртывание на AWS (S3 + CloudFront)

### Шаг 1: Создать S3 bucket

```bash
aws s3 mb s3://room-assets-bucket
```

### Шаг 2: Загрузить файлы

```bash
npm run build

aws s3 sync dist/ s3://room-assets-bucket/ \
  --delete \
  --cache-control "public, max-age=3600"

# HTML не кэшировать
aws s3 cp dist/index.html s3://room-assets-bucket/index.html \
  --metadata-directive REPLACE \
  --cache-control "max-age=0, no-cache, no-store, must-revalidate"
```

### Шаг 3: Настроить CloudFront

1. AWS Console → CloudFront → Create Distribution
2. Origin: S3 bucket URL
3. Default cache behavior:
   - Allowed HTTP methods: GET, HEAD
   - Compress objects automatically: Yes
4. Error responses: 404 → /index.html

## Развёртывание на Azure

### Шаг 1: Создать Static Web Apps ресурс

```bash
az staticwebapp create \
  --name room-assets \
  --resource-group my-group \
  --source https://github.com/username/room-assets
```

### Шаг 2: Настроить CI/CD

Azure автоматически создаст GitHub Actions workflow.

Проверить файл `.github/workflows/azure-static-web-apps-*.yml`

### Шаг 3: Deploy

```bash
git push
```

Приложение будет доступно на URL, указанном в Azure Portal.

## Мониторинг

### Сервис и Uptime

```bash
# Использовать UptimeRobot для мониторинга доступности
# https://uptimerobot.com/
```

### Логирование ошибок

Добавить сервис для отслеживания ошибок:

```typescript
// src/errorTracking.ts (будущее)
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
});
```

### Analytics

Добавить Google Analytics:

```typescript
// src/main.tsx
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  // ...
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
```

## Версионирование и обновления

### Семантическое версионирование

Следовать [semver.org](https://semver.org/):

```
MAJOR.MINOR.PATCH

v1.0.0 - MVP release
v1.1.0 - Добавлена функция X
v1.1.1 - Fix bug Y
v2.0.0 - Breaking changes
```

### Changelog

Файл `CHANGELOG.md`:

```markdown
# Changelog

## [1.0.0] - 2025-09-05
### Added
- Управление комнатами и активами
- Система бронирования с валидацией
- Импорт/экспорт данных
- IndexedDB персистентность

### Changed
- N/A

### Fixed
- N/A
```

### Release process

```bash
# 1. Обновить версию в package.json
npm version patch  # v1.0.1
# или
npm version minor  # v1.1.0
# или
npm version major  # v2.0.0

# 2. Обновить CHANGELOG.md

# 3. Push с тегом
git push origin main --tags

# 4. GitHub создаст Release автоматически
```

## Откат к предыдущей версии

### GitHub Pages

```bash
git revert HEAD
git push origin main
```

### Vercel / Netlify

1. Dashboard → Deployments
2. Выбрать предыдущий deployment
3. Нажать "Rollback"

### Собственный сервер

```bash
cd /var/www/room-assets
git log --oneline  # Найти коммит
git checkout <commit-hash>
npm run build
sudo systemctl restart app
```

## Performance и SEO

### Оптимизация производительности

✅ Достигнуто:
- Vite fast bundling (< 200ms)
- Code splitting (js, css отдельно)
- Lazy loading components
- IndexedDB async (не блокирует UI)

📋 Будущее:
- Image optimization (WebP)
- Minification и compression (Brotli)
- Service Worker для offline
- Web Vitals monitoring

### SEO оптимизация

```html
<!-- index.html -->
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Room & Assets Manager</title>
  <meta name="description" content="Система управления аудиториями и бронирования активов" />
  <meta name="keywords" content="бронирование, комнаты, активы, менеджер" />
  <meta name="author" content="Your Company" />
  
  <!-- Open Graph для соцсетей -->
  <meta property="og:title" content="Room & Assets Manager" />
  <meta property="og:description" content="..." />
  <meta property="og:image" content="..." />
</head>
```

## Безопасность

### Секреты и переменные

Использовать `.env` файлы (никогда не коммитить):

```bash
# .env.local
VITE_API_URL=https://api.example.com
VITE_SENTRY_DSN=https://...
```

Доступ в коде:

```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

### Content Security Policy

Добавить header в nginx:

```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'wasm-unsafe-eval'";
```

### HTTPS

Всегда использовать HTTPS на production:

```nginx
server {
    listen 443 ssl http2;
    ssl_certificate /etc/letsencrypt/live/domain/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/domain/privkey.pem;
}

# Перенаправить HTTP → HTTPS
server {
    listen 80;
    return 301 https://$server_name$request_uri;
}
```

## Troubleshooting

### 404 errors на refresh

**Проблема:** При обновлении страницы SPA возвращает 404

**Решение:** Настроить сервер перенаправлять на index.html
- nginx: `try_files $uri /index.html`
- Vercel: Автоматически
- GitHub Pages: Работает с hash routing

### CORS errors при API

**Проблема:** Запросы к API возвращают CORS ошибку

**Решение:** Использовать proxy сервер или CORS headers на backend

```typescript
// fetch с proxy
fetch('/.netlify/functions/api/data')
```

### IndexedDB не работает в incognito

**Проблема:** Некоторые браузеры отключают IndexedDB в incognito mode

**Решение:** Fallback на sessionStorage или предупредить пользователя

## Контрольный список перед production

- ✅ TypeScript не имеет ошибок
- ✅ ESLint проходит без ошибок
- ✅ npm run build выполняется успешно
- ✅ npm run preview работает локально
- ✅ Все браузеры поддерживаются
- ✅ HTTPS включен
- ✅ Кэширование настроено
- ✅ GZIP включен
- ✅ Бэкапы данных автоматические
- ✅ Мониторинг настроен
