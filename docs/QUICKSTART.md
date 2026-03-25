# Быстрый старт (Quickstart)

## 5 минут до первого запуска

### 1️⃣ Клонирование и установка

```bash
# Клонировать репозиторий
git clone https://github.com/your-username/room-assets.git
cd room-assets

# Установить зависимости
npm install

# Или с Just (если установлен)
just install
```

### 2️⃣ Запуск dev сервера

```bash
npm run dev
# или
just dev
```

Откроется http://localhost:5173 с приложением 📱

### 3️⃣ Исследование приложения (2 минуты)

**Вкладка "Resources":**
- Просмотрите 3 аудитории и 3 актива
- Используйте поиск (введите "Conference" или "Projector")

**Вкладка "Bookings":**
- Посмотрите 2 примера бронирований
- Нажмите "New Booking" для создания нового

### 4️⃣ Создание первого бронирования

Форма автоматически заполнится, только введите:

```
Тип ресурса:     Room
Ресурс:          Conference Room 1 (30 seats)
Название:        "My First Booking"
Дата/Время:      2025-09-05 10:00 - 11:00
Заметки:         (опционально)
```

Нажмите **Save** → видите в таблице ✅

### 5️⃣ Проверка персистентности

```
Перезагрузите страницу (F5)
↓
Бронирование осталось? ✅ IndexedDB работает!
```

## Полезные команды

### Development

```bash
npm run dev        # Запустить dev сервер с HMR
npm run build      # Собрать для production
npm run preview    # Просмотреть production сборку
npm run lint       # Проверить стиль кода
```

### С Just

```bash
just dev          # Запустить сервер
just build        # Собрать production
just clean        # Очистить dist/
just setup        # install + dev (все в одной команде)
```

## Первые действия

### Импортировать пример данных

Если захотите больше тестовых данных:

1. Перейти на вкладку "Bookings"
2. Нажать кнопку "Import"
3. Выбрать `seed/seed.example.json`

✅ Загружены 3 комнаты, 3 актива, 2 бронирования

### Экспортировать данные

Сохранить свои данные в JSON:

1. На вкладке "Bookings"
2. Нажать "Export"
3. Скачается `room-assets-backup-2025-09-05.json`

### Удалить все данные

Если захочется начать с чистого листа:

1. **DevTools** (F12)
2. **Application** → **Storage** → **IndexedDB** → **RoomAssetsDB**
3. Удалить все
4. Перезагрузить страницу (новые mock данные)

## Структура проекта

```
room-assets/
├── src/
│   ├── App.tsx         ← Основной компонент (550+ строк)
│   ├── App.css         ← Все стили
│   ├── main.tsx        ← Точка входа
│   └── components/     ← Примеры компонентов
│
├── docs/               ← Документация
│   ├── SPEC.md         ← Требования и функции
│   ├── DECISIONS.md    ← Архитектура и выборы
│   ├── DATA_FORMAT.md  ← Формат JSON данных
│   ├── CONTRIBUTING.md ← Для разработчиков
│   ├── TESTING.md      ← Тестирование
│   └── DEPLOYMENT.md   ← Развёртывание
│
├── seed/
│   └── seed.example.json ← Пример данных для импорта
│
├── package.json
├── tsconfig.json
├── vite.config.ts
├── justfile            ← Команды для Just
└── README.md
```

## Основные концепции

### Комната (Room)

```json
{
  "id": "r-101",
  "name": "Conference Room 1",
  "capacity": 30,
  "features": ["projector", "whiteboard", "sound_system"]
}
```

### Актив (Asset)

```json
{
  "id": "a-proj-1",
  "name": "Epson EB-2250U",
  "inventoryCode": "INV-2024-001",
  "status": "available"  // "available" | "broken" | "maintenance"
}
```

### Бронирование (Booking)

```json
{
  "id": "b-1",
  "resourceType": "room",        // "room" | "asset"
  "resourceId": "r-101",
  "title": "Team Meeting",
  "start": "2025-09-05T08:00:00Z",  // ISO 8601 (UTC)
  "end": "2025-09-05T09:30:00Z",
  "notes": "Обсуждение проекта"
}
```

## Частые вопросы

### Q: Где сохраняются данные?
**A:** В браузере, в IndexedDB (база данных на клиенте). Не на сервере.

### Q: Могу ли я поделиться данными?
**A:** Да! Экспортируйте JSON → отправьте файл → они импортируют.

### Q: Какие браузеры поддерживаются?
**A:** Chrome, Firefox, Safari, Edge (версии 2023+). Нужна поддержка IndexedDB.

### Q: Можно ли использовать на мобильном?
**A:** Да, приложение responsive. Откройте на iPhone или Android.

### Q: Как запустить на своем сервере?
**A:** Смотрите [DEPLOYMENT.md](DEPLOYMENT.md) → раздел "собственный сервер".

### Q: Можно ли добавить новый функционал?
**A:** Да! Смотрите [CONTRIBUTING.md](CONTRIBUTING.md) → раздел "добавление нового".

## Типичный workflow дня

```
09:00 - Откройте приложение
        ↓
        Проверьте доступные комнаты и активы (вкладка Resources)
        ↓
10:00 - Создайте новое бронирование
        ↓
        Выберите комнату, время, добавьте название
        ↓
11:00 - Просмотрите все бронирования (вкладка Bookings)
        ↓
        Отредактируйте если нужно (нажмите на строку)
        ↓
17:00 - Экспортируйте отчёт
        ↓
        Отправьте JSON коллеге для резервной копии
```

## Troubleshooting

### Приложение не запускается
```bash
# Убедиться что Node.js установлен
node --version

# Очистить cache и переустановить
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Port 5173 занят
```bash
# Использовать другой port
npm run dev -- --port 3000
```

### IndexedDB полна
```javascript
// В DevTools Console
const dbs = await indexedDB.databases();
console.log(dbs);
```

### Данные потеряны
```javascript
// Восстановить из файла через Import
// Или скопировать из другого браузера через Export
```

### Ошибка "Type is required"
```
Убедиться что выбрали тип ресурса: Room или Asset
```

### Время отображается неправильно
```
Приложение использует локальное время браузера
Проверьте: Settings → Time & date → Timezone
```

## Следующие шаги

### Новичок в React?
1. Прочитайте [react.dev](https://react.dev)
2. Посмотрите компоненты в `src/App.tsx`
3. Попробуйте изменить текст или цвета в `src/App.css`

### Хочу добавить функцию?
1. Смотрите [CONTRIBUTING.md](CONTRIBUTING.md)
2. Примеры добавления фильтра, удаления ресурса и т.д.

### Хочу развернуть в интернет?
1. Смотрите [DEPLOYMENT.md](DEPLOYMENT.md)
2. Выбирите платформу: GitHub Pages (бесплатно), Vercel, Netlify

### Хочу добавить тесты?
1. Смотрите [TESTING.md](TESTING.md)
2. Примеры с Vitest + React Testing Library

### Хочу изучить архитектуру?
1. Смотрите [DECISIONS.md](DECISIONS.md)
2. Почему React? Почему IndexedDB? Как обработать дату?

## Сообщество и поддержка

- 📖 [Спецификация](SPEC.md)
- 🏗️ [Архитектура](DECISIONS.md)
- 📝 [Для разработчиков](CONTRIBUTING.md)
- ✅ [Тестирование](TESTING.md)
- 🚀 [Развёртывание](DEPLOYMENT.md)

## Лицензия

MIT - используйте свободно!

---

**Готовы? Запустите приложение:**

```bash
npm run dev
```

**Откройте http://localhost:5173** 🎉
