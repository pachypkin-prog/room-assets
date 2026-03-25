# Room&Assets Manager - Технические решения

## 📋 Содержание

1. [Выбор стека технологий](#выбор-стека-технологий)
2. [Хранилище данных](#хранилище-данных)
3. [Архитектура приложения](#архитектура-приложения)
4. [Работа со временем](#работа-со-временем)
5. [Валидация и обработка ошибок](#валидация-и-обработка-ошибок)

## 🛠️ Выбор стека технологий

### React + TypeScript

**Решение:** React 18 с TypeScript

**Обоснование:**
- ✅ **Кроссплатформенность**: веб-стек работает одинаково на Windows, macOS, Linux
- ✅ **прототипирование**: React позволяет быстро собирать интерфейс
- ✅ **Типизация**: TypeScript предотвращает ошибки на этапе разработки
- ✅ **Экосистема**: богатая экосистема библиотек и инструментов
- ✅ **Популярность**: хорошая документация и сообщество

**Альтернативы рассмотрены:**
- Vue.js — похож на React, но меньше экосистема
- Svelte — компилируется в JS, но сложнее интегрировать UI фреймворки
- JavaFX/Avalonia — требуют JDK/DotNet, менее гибкие

### Vite как сборщик

**Решение:** Vite вместо Webpack/Create React App

**Обоснование:**
- ✅ **Скорость**: молниеносный dev-сервер на основе ES modules
- ✅ **Hot Module Replacement**: изменения видны мгновенно
- ✅ **Простота**: минимальная конфигурация, "работает из коробки"
- ✅ **Production build**: быстрая оптимизированная сборка
- ✅ **Поддержка TypeScript**: встроенная

### Material-UI (MUI)

**Решение:** MUI для базовых компонентов (Container, Box)

**Обоснование:**
- ✅ **Профессиональный дизайн**: готовые компоненты соответствуют Material Design
- ✅ **Адаптивность**: встроенная система сетки и responsive utils
- ✅ **Доступность**: компоненты соответствуют WCAG стандартам
- ✅ **Документация**: подробные примеры и API

**Примечание:** Дополнительно использован CSS для специфичных стилей приложения.

---

## 💾 Хранилище данных

### IndexedDB вместо LocalStorage

**Решение:** IndexedDB для сохранения данных

**Обоснование:**

| Параметр | LocalStorage | IndexedDB |
|----------|--------------|-----------|
| Объём | 5-10 MB | 50+ MB |
| API | Синхронный | Асинхронный |
| Блокировка UI | Да, может заблокировать | Нет, работает в фоне |
| Индексы | Нет | Да, поиск по индексам |
| Транзакции | Нет | Да, полная ACID |
| Сложные типы | JSON-строки | Любые JS объекты |

**Наш выбор:** IndexedDB идеален для приложения с растущим объёмом броней.

```typescript
// IndexedDB API
async function saveData(data: AppData): Promise<void> {
  const db = await initDB();
  const transaction = db.transaction([STORE_NAME], "readwrite");
  const store = transaction.objectStore(STORE_NAME);
  await store.put(data, "appData");
}

// LocalStorage был бы синхронным и блокировал бы UI:
// localStorage.setItem("appData", JSON.stringify(data)); // ❌ Не используем
```

### Структура хранилища

```
Database: "RoomAssetsDB" (version: 1)
  ├─ Object Store: "appData"
     └─ Key: "appData"
        └─ Value: AppData { rooms[], assets[], bookings[] }
```

**Автозагрузка:** При старте приложения загружаются сохранённые данные.  
**Автосохранение:** При каждом изменении данные сохраняются в IndexedDB.

---

## 🏗️ Архитектура приложения

### Структура компонентов

```
App.tsx (главный компонент)
├── Header (поиск, импорт/экспорт)
├── Navigation (табы)
└── Main Content
    ├── ResourcesList (при activeTab === "resources")
    ├── BookingsList (при activeTab === "bookings")
    └── BookingForm (при activeTab === "new-booking")
```

### Управление состоянием

**Решение:** React hooks (useState, useEffect)

**Обоснование:**
- ✅ Встроено в React, не нужны дополнительные библиотеки
- ✅ Простой и понятный API
- ✅ Достаточно для MVP, можно расширить Redux позже

```typescript
const [data, setData] = useState<AppData>(mockData);
const [activeTab, setActiveTab] = useState<"resources" | "bookings" | "new-booking">("resources");
```

**Альтернативы рассмотрены:**
- Redux — оverkill для простого приложения
- Zustand — подходит, но useState уже работает
- Context API — может быть использована позже при расширении

### Разделение ответственности

- **App.tsx**: управление состоянием, логика валидации, IndexedDB операции
- **Компоненты**: отображение данных, обработка событий пользователя
- **Utilities**: утилиты для работы с датами, валидации

---

## 🌍 Работа со временем

### Проблема

Без правильной работы со временем получаем:
- ❌ Разные времена в разных локалях
- ❌ Ошибки фильтрации при смене часового пояса
- ❌ Confusion при импорте/экспорте между ОС

### Решение: ISO 8601 в UTC + локальное отображение

```typescript
// ✅ Сохраняем в UTC (ISO 8601)
start: "2025-09-05T08:00:00Z"  // 8 утра UTC
end: "2025-09-05T09:00:00Z"    // 9 утра UTC

// ✅ Отображаем в локальном часовом поясе
const date = new Date("2025-09-05T08:00:00Z");
date.toLocaleString(); // "2025-09-05 11:00:00" (для UTC+3)
```

### Функции преобразования

```typescript
// Из ISO в локальное время для формы
function isoToInput(isoString: string): { date: string; time: string }

// Из формы (локальное) в ISO (UTC)
function inputToISO(dateString: string, timeString: string): string

// Форматирование для отображения
function formatDateForDisplay(isoString: string): string
function formatTime(isoString: string): string
```

### Почему не используем date-fns?

В MVP достаточно встроенного Intl API:
- ✅ Встроено в браузер (не нужна доп. библиотека)
- ✅ Поддерживает локали
- ✅ Простой API для нашего случая

При расширении можно добавить date-fns для более сложных операций.

---

## ✅ Валидация и обработка ошибок

### Валидация броней

```typescript
function validateBooking(
  booking: Booking,
  rooms: Room[],
  assets: Asset[],
  existingBookings: Booking[]
): string | null {
  // 1. Проверка порядка времени
  if (new Date(booking.start) >= new Date(booking.end)) {
    return "Время начала должно быть раньше времени конца";
  }
  
  // 2. Проверка существования ресурса
  if (booking.resourceType === "room") {
    if (!rooms.some(r => r.id === booking.resourceId)) {
      return "Выбранная аудитория не существует";
    }
  } else {
    if (!assets.some(a => a.id === booking.resourceId)) {
      return "Выбранное оборудование не существует";
    }
  }
  
  // 3. Проверка пересечений
  for (const existing of existingBookings) {
    if (timesOverlap(booking, existing)) {
      return `Это время уже забронировано`;
    }
  }
  
  return null; // ✅ Всё OK
}
```

### Обработка ошибок UI

```typescript
const [error, setError] = useState<string | null>(null);

const handleSubmit = (e: React.FormEvent) => {
  setError(null);
  
  try {
    const error = validateBooking(booking, data.rooms, data.assets, data.bookings);
    if (error) throw new Error(error);
    
    // Сохранение
    addBooking(booking);
  } catch (err) {
    setError(err instanceof Error ? err.message : "Неизвестная ошибка");
  }
};

// Отображение в UI
{error && <div className="error-message">❌ {error}</div>}
```

### Импорт данных: валидация формата

```typescript
const imported = JSON.parse(text);

// Проверяем структуру
if (!Array.isArray(imported.rooms) || 
    !Array.isArray(imported.assets) || 
    !Array.isArray(imported.bookings)) {
  throw new Error("Неверный формат JSON");
}

setData(imported); // ✅ OK
```

---

## 🔄 Поток данных

```
┌─────────────────────────────────────────────┐
│         Пользовательский ввод               │
│  (форма, кнопка, поиск)                     │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │   Валидация          │
        │   - Время            │
        │   - Пересечения      │
        │   - Существование    │
        └──────────────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │  Обновить состояние  │
        │  (setState)          │
        └──────────────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │  Сохранить IndexedDB │
        │  (автоматически)     │
        └──────────────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │  Перерисовать UI     │
        │  (React render)      │
        └──────────────────────┘
```

---

## 📈 Масштабируемость

### Текущие ограничения

- **IndexedDB**: 50+ MB (достаточно для ~10,000 броней)
- **React состояние**: полная загрузка в памяти (~OK для MVP)
- **Синхронизация**: не поддерживается (один пользователь)

### Возможные оптимизации (v2.0+)

1. **Виртуализация таблицы**: если броней > 1000
2. **Paginated loading**: загрузка броней порциями
3. **Web Workers**: обработка больших импортов в фоне
4. **Service Worker**: кэширование для офлайн режима
5. **Backend**: интеграция с REST API для синхронизации

---

## 🧪 Тестирование

### Текущее покрытие

- ❌ Нет unit тестов (MVP)
- ❌ Нет integration тестов

### Рекомендуемые инструменты (v2.0+)

```json
{
  "devDependencies": {
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "vitest": "^0.34.0",
    "@vitest/ui": "^0.34.0"
  }
}
```

### Примеры тестов

```typescript
// Тест валидации
describe('validateBooking', () => {
  it('should reject booking with start >= end', () => {
    const booking = {
      start: "2025-09-05T10:00:00Z",
      end: "2025-09-05T09:00:00Z",
      // ...
    };
    expect(validateBooking(booking, [], [], [])).toBeTruthy();
  });
  
  it('should reject overlapping bookings', () => {
    // ... тест пересечений
  });
});
```

---

## 📚 Дополнительные решения

### CSS vs CSS-in-JS

**Выбор:** CSS + классы (не CSS-in-JS)

**Причины:**
- ✅ Проще для MVP
- ✅ Лучше производительность (нет runtime overhead)
- ✅ Можно легко переключиться на CSS Modules или Tailwind позже

### Иконки

**Решение:** Unicode emoji (🏛️, 📅, 🔍 и т.д.)

**Причины:**
- ✅ Работают везде, встроены в браузер
- ✅ Не нужны доп. файлы или шрифты
- ✅ Малый размер

### Форматирование дат в таблице

**Решение:** `Intl.DateTimeFormat` + custom функции

```typescript
// ✅ Встроенный API, поддерживает локали
date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })

// Вывод: "5 сентября"
```

---

## 🎯 Выводы

Выбранный стек обеспечивает:
- ✅ **Быстрое прототипирование** (React + Vite)
- ✅ **Надёжность** (TypeScript)
- ✅ **Кроссплатформенность** (веб-технологии)
- ✅ **Простота масштабирования** (hooks, IndexedDB)
- ✅ **Минимум зависимостей** (встроенные API где возможно)

При росте проекта легко добавить:
- Redux для управления состоянием
- Express backend для синхронизации
- Tailwind для стилей
- Vitest для тестов
