# Room&Assets Manager

Веб-приложение для управления аудиториями и активами с системой бронирования.

## 📖 Документация

**🚀 Новичок?** Начните с [Быстрого старта](docs/QUICKSTART.md)

**Полная документация:** [Индекс документации](docs/INDEX.md)

# Room&Assets

Кроссплатформенное SPA для управления аудиториями и оборудованием: каталог ресурсов,
создание/редактирование/удаление бронирований, проверка пересечений, импорт/экспорт в JSON.

**Статус:** MVP — базовый функционал реализован.

**Версия:** 0.1.0

**Автор:** Ваше имя <you@example.com>

---

## Ключевые возможности

- Просмотр аудиторий и оборудования
- Создание/редактирование/удаление бронирований
- Предотвращение пересечений для одного ресурса
- Хранение данных в IndexedDB (локально)
- Импорт/экспорт всего каталога в один JSON
- Docker образ для статической раздачи через Nginx

## Требования

- Node.js 20+ (рекомендуется 22+)
- npm 10+
- Docker (для контейнерной сборки)
- (Опционально) `gh` — GitHub CLI

## Быстрый старт

```bash
# Установить зависимости
npm install

# Запустить dev сервер (Vite)
])

# Сборка production
npm run build

# Просмотр собранной версии
npm run preview
```

## Docker

Prod (сборка + Nginx):

```bash
docker build -t room-assets:prod .
docker run -d -p 80:80 --name room-assets-prod room-assets:prod
```

Dev (HMR):

```bash
docker build -t room-assets:dev --target dev .
docker run --rm -it -p 5173:5173 -v "%CD%":/app -v /app/node_modules --name room-assets-dev room-assets:dev
```

Docker Compose:

```bash
docker compose up --build -d
```

## Формат данных (импорт/экспорт)

Ожидаемая структура JSON:

```json
{
  "rooms": [{ "id":"r-101","name":"Аудитория 101","capacity":30,"features":["projector","whiteboard"] }],
  "assets": [{ "id":"a-proj-1","name":"Проектор","inventoryCode":"PRJ001","status":"available" }],
  "bookings": [{ "id":"b-1","resourceType":"room","resourceId":"r-101","title":"Событие","start":"2025-09-05T08:00:00Z","end":"2025-09-05T09:30:00Z","notes":"" }]
}
```

Время хранится в UTC (RFC‑3339 / ISO‑8601). Пример файла: `seed/seed.example.json`.

## Структура репозитория

- `src/` — исходники React + TypeScript
- `public/` — статические файлы
- `dist/` — собранная версия (генерируется `npm run build`)
- `nginx/` — конфиг для прод-сборки
- `Dockerfile`, `docker-compose.yml` — контейнеризация
- `seed/seed.example.json` — пример данных

## Разработка и проверка

- Проверка типов:

```bash
npx tsc --noEmit
```

- Линтинг:

```bash
npm run lint
```

## Как вносить изменения и отправлять на GitHub

Если репозиторий уже инициализирован:

```bash
git add .
git commit -m "Update README"
git push origin main
```

Создание репозитория через `gh`:

```bash
gh auth login
gh repo create YOUR_GITHUB_USERNAME/room-assets --public --source=. --remote=origin --push
```

## TODO

- Добавить модульные тесты для проверки пересечений и работы с датами
- Улучшить доступность (ARIA)
- CI: сборка + публикация Docker образа

---

Лицензия: MIT

```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
