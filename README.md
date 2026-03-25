# Room&Assets Manager

Веб-приложение для управления аудиториями и активами с системой бронирования.

## 📖 Документация

**🚀 Новичок?** Начните с [Быстрого старта](docs/QUICKSTART.md)

**Полная документация:** [Индекс документации](docs/INDEX.md)

Основные документы:
- [Спецификация](docs/SPEC.md) - требования и пользовательские истории
- [Технические решения](docs/DECISIONS.md) - обоснование архитектуры
- [Формат данных](docs/DATA_FORMAT.md) - структура импорта/экспорта
- [Архитектура](docs/ARCHITECTURE.md) - как устроено приложение
- [Разработка](docs/CONTRIBUTING.md) - как добавлять функции
- [Развёртывание](docs/DEPLOYMENT.md) - как запустить на сервере
- [Тестирование](docs/TESTING.md) - как тестировать
- [FAQ](docs/FAQ.md) - ответы на вопросы

## Стек технологий

- **React 18** - UI библиотека
- **TypeScript** - статическая типизация
- **Vite** - быстрый bundler
- **IndexedDB** - хранилище данных в браузере
- **Material-UI** - компоненты

## Быстрый старт

### Требования
- Node.js 18+
- npm или yarn

### Установка и запуск (с Just)

```bash
# Установить Just (если не установлен)
# Windows: choco install just
# Linux/macOS: curl --proto '=https' --tlsv1.2 -sSf https://just.systems/install.sh | bash

just install  # Установить зависимости
just dev      # Запустить dev сервер
```

Приложение будет доступно на http://localhost:5173

### Установка и запуск (npm)

```bash
npm install    # Установить зависимости
npm run dev    # Запустить dev сервер
```

## Доступные команды

### С Just
```bash
just dev       # Запустить dev сервер
just build     # Собрать для production
just preview   # Просмотреть production сборку
just lint      # Проверить код
just clean     # Очистить dist и node_modules
just reset     # Переустановить всё и запустить dev
```

### С npm
```bash
npm run dev    # Запустить dev сервер
npm run build  # Собрать для production  
npm run lint   # Проверить код
```

## Функциональность

### v1.0 (MVP)
- ✅ Просмотр списка аудиторий и активов
- ✅ Бронирование аудиторий и активов
- ✅ Проверка доступности на выбранное время
- ✅ Просмотр всех бронирований
- ✅ Сохранение данных в IndexedDB
- ✅ Импорт/экспорт данных в JSON

### v2.0+
- Удаление и редактирование ресурсов
- Расширенные фильтры по датам
- Уведомления о предстоящих бронированиях
- Тёмная тема

## Структура проекта

```
src/
├── App.tsx          # Основной компонент с логикой
├── App.css          # Стили приложения
├── main.tsx         # Точка входа
└── components/      # Переиспользуемые компоненты
    └── Button/      # Примеры кнопок

docs/
├── SPEC.md          # Спецификация (требования, US)
├── DECISIONS.md     # Технические решения
└── DATA_FORMAT.md   # Формат импорта/экспорта

seed/
└── seed.example.json # Пример данных для импорта
```

## Данные

Приложение использует IndexedDB для сохранения данных. При первом запуске загружаются mock-данные:
- 3 аудитории разного размера
- 3 актива (проекторы, микрофоны)
- 2 примера бронирований

Можно импортировать данные из JSON файла используя кнопку "Импорт" → выбрать файл вида [seed.example.json](seed/seed.example.json)

## API приложения

Основные типы данных (определены в `src/App.tsx`):

```typescript
interface Room {
  id: string;
  name: string;
  capacity: number;
  features: string[];
}

interface Asset {
  id: string;
  name: string;
  inventoryCode: string;
  status: 'available' | 'broken' | 'maintenance';
}

interface Booking {
  id: string;
  resourceType: 'room' | 'asset';
  resourceId: string;
  title: string;
  start: string;      // ISO 8601: "2025-09-05T08:00:00Z"
  end: string;        // ISO 8601: "2025-09-05T09:30:00Z"
  notes: string;
}
```

## Браузеры

Поддерживаются браузеры с поддержкой IndexedDB:
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## Разработка

### Локальное тестирование

```bash
# Стартовый сервер dev (с HMR)
just dev

# Или с npm
npm run dev
```

### Сборка для production

```bash
just build
just preview  # Просмотреть собранную версию

# Или с npm
npm run build
npm run preview
```

### TypeScript проверка

```bash
npx tsc --noEmit
```

### Синтаксис и стиль

Проект использует ESLint для проверки кода:

```bash
npm run lint
```

## Импорт/Экспорт данных

### Экспорт
1. Кнопка "Экспорт" в Bookings
2. Сохраняет все комнаты, активы и бронирования в JSON

### Импорт  
1. Кнопка "Импорт" в Bookings
2. Выберите JSON файл формата [seed.example.json](seed/seed.example.json)
3. Данные загружаются в IndexedDB

Пример структуры JSON - см. [DATA_FORMAT.md](docs/DATA_FORMAT.md)

## Docker

В проекте есть `Dockerfile` и пример `docker-compose.yml` для быстрого развёртывания.

Prod (сборка + Nginx):

```bash
# Собрать финальный образ (будет использовать stage `build` и `prod`):
docker build -t room-assets:prod .

# Запустить контейнер (порт 80):
docker run -d -p 80:80 --name room-assets-prod room-assets:prod
```

Dev (локальная разработка с HMR):

```bash
# Собрать образ для dev-stage и запустить Vite с монтированием кода проекта:
docker build -t room-assets:dev --target dev .
docker run --rm -it -p 5173:5173 \
  -v "%CD%":/app \
  -v /app/node_modules \
  --name room-assets-dev room-assets:dev
```

Примечание: на Windows в PowerShell/ CMD синтаксис монтирования текущей директории отличается (`%CD%`/`${PWD}`/`%cd%`). Рекомендуется использовать WSL2 для лучшей производительности томов.

Docker Compose (prod):

```bash
docker compose up --build -d
```

Для публикации в реестр:

```bash
docker tag room-assets:prod youruser/room-assets:latest
docker push youruser/room-assets:latest
```


## Лицензия

MIT

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
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
