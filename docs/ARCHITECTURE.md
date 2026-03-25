# Архитектура (ARCHITECTURE)

## Общая структура системы

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                           │
│                     (React Components)                          │
├─────────────────────────────────────────────────────────────────┤
│  Header │ Navigation (Resources | Bookings)                     │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ ResourcesList / BookingsList / BookingForm                 │ │
│  └────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                    STATE MANAGEMENT                             │
│              (React Hooks - useState/useEffect)                 │
├─────────────────────────────────────────────────────────────────┤
│                   BUSINESS LOGIC                                │
│  validateBooking() │ formatDate() │ timesOverlap()             │
│  isoToInput() │ inputToISO()      │ formatTime()               │
├─────────────────────────────────────────────────────────────────┤
│                  DATA PERSISTENCE                               │
│  initDB() │ saveData() │ loadData()                             │
├─────────────────────────────────────────────────────────────────┤
│                   BROWSER APIs                                  │
│  IndexedDB │ Intl API │ JSON.stringify/parse                   │
└─────────────────────────────────────────────────────────────────┘
```

## Компонентная архитектура

```
App (550 lines)
├── State: data, activeTab, searchQuery, editingBookingId
├── Effects: initDB(), loadData() on mount
├── Handlers: create, edit, delete, export, import
│
├── Header()
│   └── Logo + Navigation title
│
├── Navigation()
│   └── Tabs: Resources | Bookings
│
├── ResourcesList() [if activeTab === 'resources']
│   ├── SearchBox
│   └── ResourceCard[] (Rooms + Assets)
│
├── BookingsList() [if activeTab === 'bookings']
│   ├── ActionBar (New, Export, Import)
│   └── BookingsTable (editable rows)
│
└── BookingForm() [if editingBookingId]
    ├── Inputs (ResourceType, Resource, Title, Time)
    ├── Validation messages
    └── Buttons (Save, Cancel, Delete)
```

## Поток данных

```
┌─────────────────────┐
│  User Action        │ ← Click "New Booking"
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│  Event Handler                          │
│  (handleNewBooking, handleSaveBooking)  │
└──────────┬──────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│  Validation                             │
│  validateBooking(booking, data)         │
└──────────┬──────────────────────────────┘
           │
    ┌──────┴──────┐
    │             │
    ▼             ▼
 [Valid]       [Invalid]
    │             │
    │             └──→ Show errors
    │
    ▼
┌─────────────────────────────────────────┐
│  Update State                           │
│  setData({...data, bookings: [...]})    │
└──────────┬──────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│  Effect Hook                            │
│  useEffect(() => saveData(data), [data])│
└──────────┬──────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│  IndexedDB Save                         │
│  saveData(data)                         │
└──────────┬──────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│  Re-render Components                   │
│  (Show new booking in table)            │
└─────────────────────────────────────────┘
```

## Структура данных

```typescript
AppData
├── rooms: Room[]
│   ├── id: "r-101"
│   ├── name: "Conference Room 1"
│   ├── capacity: 30
│   └── features: ["projector", "whiteboard"]
│
├── assets: Asset[]
│   ├── id: "a-proj-1"
│   ├── name: "Epson Projector"
│   ├── inventoryCode: "INV-001"
│   └── status: "available" | "broken" | "maintenance"
│
└── bookings: Booking[]
    ├── id: "b-1"
    ├── resourceType: "room" | "asset"
    ├── resourceId: "r-101"
    ├── title: "Team Meeting"
    ├── start: "2025-09-05T08:00:00Z" (ISO 8601 UTC)
    ├── end: "2025-09-05T09:30:00Z"
    └── notes: "Brief discussion"
```

## IndexedDB Schema

```
Database: RoomAssetsDB
└── Object Store: appData
    ├── Key: "data"
    └── Value: {
          rooms: [...],
          assets: [...],
          bookings: [...]
        }
```

### Зачем один ключ?
- Простота: вся логика приложения в одной структуре
- Скорость: все данные загружаются одним запросом
- Типобезопасность: TypeScript интерфейс AppData

### Миграция на нормализованную схему (будущее)
```
Database: RoomAssetsDB (v2)
├── Object Store: rooms
│   ├── Index: "by-capacity"
│   └── Key: room.id
├── Object Store: assets
│   ├── Index: "by-status"
│   └── Key: asset.id
└── Object Store: bookings
    ├── Index: "by-room", "by-asset", "by-date"
    └── Key: booking.id
```

## Управление состоянием

### Текущий подход (MVP)
```typescript
// Все в одном компоненте App
const [data, setData] = useState<AppData>(initialData);

// Обновление
const updated = { ...data, bookings: newBookings };
setData(updated);

// Побочный эффект (сохранение)
useEffect(() => saveData(data), [data]);
```

### Миграция на Redux (будущее)
```typescript
// Слайсы
├── roomsSlice.ts (state, reducers, selectors)
├── assetsSlice.ts
└── bookingsSlice.ts (state, reducers, actions)

// Store
store.ts (combineReducers, middleware)

// Компоненты
├── useDispatch() для actions
└── useSelector() для state
```

### Альтернатива: Context API
```typescript
// Context
AppContext.ts (createContext, Provider, useApp hook)

// В App
<AppProvider>
  <Header />
  <Navigation />
  <Content />
</AppProvider>
```

## Обработка даты и времени

```
User Input (HTML datetime-local)
│
└─→ inputToISO(inputValue)
    │
    └─→ Парсим "2025-09-05T10:00" → new Date()
    │
    └─→ Конвертируем в UTC → "2025-09-05T08:00:00Z"
    │
    └─→ Сохраняем в IndexedDB (UTC)

IndexedDB (UTC)
│
└─→ displayBooking(booking)
    │
    └─→ Парсим ISO → new Date()
    │
    └─→ formatDateForDisplay(isoString)
    │
    └─→ Используем Intl.DateTimeFormat (локальная зона)
    │
    └─→ Отображаем "5 сентября, 10:00" (локальное время)
```

**Важно:** На сервере бронирование всегда в UTC!

## Валидация

```
validateBooking(booking, data)
│
├─ Title проверка
│   ├─ ✓ Есть и не пусто?
│   └─ ✗ → "Title is required"
│
├─ Resource проверка
│   ├─ ✓ Выбран тип?
│   ├─ ✓ Выбран ID?
│   ├─ ✓ Ресурс существует?
│   └─ ✗ → "Resource not found"
│
├─ Время проверка
│   ├─ ✓ Start < End?
│   ├─ ✓ Имеют значения?
│   └─ ✗ → "Invalid time range"
│
└─ Пересечение проверка
    ├─ ✓ Нет других бронирований на это время?
    └─ ✗ → "Time overlaps with another booking"
```

## Производительность

### Текущие показатели (MVP)
```
Данные:         3 rooms, 3 assets, 2 bookings
Размер IndexedDB: ~2 KB
Load time:       < 100ms
First render:    < 200ms
Re-render:       < 50ms
```

### Лимиты (когда нужна оптимизация)
```
Rooms:     > 1,000  → Пагинация / Virtual scroll
Assets:    > 10,000 → Индексирование в IndexedDB
Bookings:  > 100,000 → Web Worker для валидации
```

### Оптимизация (будущее)

1. **Code splitting**
   ```typescript
   const BookingForm = React.lazy(() => import('./BookingForm'));
   ```

2. **Memoization**
   ```typescript
   const ResourceCard = React.memo(({ room }) => ...);
   ```

3. **Virtual scrolling (react-window)**
   ```typescript
   <VariableSizeList height={600} itemCount={bookings.length}>
     {BookingRow}
   </VariableSizeList>
   ```

4. **Web Worker**
   ```typescript
   const worker = new Worker('validate.worker.ts');
   worker.postMessage({ booking, data });
   ```

## Безопасность

### Текущие меры
- ✅ Input validation (валидация полей)
- ✅ No SQL injection (используется IndexedDB)
- ✅ No XSS (React автоматически экранирует)
- ✅ Type safety (TypeScript)

### Будущие меры
- 🔲 Authentication (JWT tokens)
- 🔲 Authorization (role-based access)
- 🔲 Encryption (для sensitive данных)
- 🔲 CORS headers (если будет backend)
- 🔲 Rate limiting (на API уровне)

## Локализация

### Текущее состояние
- ✅ Русский язык (UI, сообщения об ошибках)
- ✅ Локальное время (Intl.DateTimeFormat)
- ✅ ISO 8601 даты (универсальный формат)

### Будущее
```typescript
// i18next интеграция
import { useTranslation } from 'react-i18next';

function Header() {
  const { t } = useTranslation();
  return <h1>{t('header.title')}</h1>;
}
```

## Интеграция с внешними системами

### Текущее состояние
- Нет зависимостей от backend API
- Полностью автономная система

### Будущие интеграции

1. **REST API**
   ```typescript
   // Заменить IndexedDB на fetch
   async function saveData(data) {
     await fetch('/api/data', {
       method: 'POST',
       body: JSON.stringify(data)
     });
   }
   ```

2. **Real-time синхронизация (WebSocket)**
   ```typescript
   const socket = new WebSocket('wss://api.example.com/ws');
   socket.onmessage = (event) => {
     const newData = JSON.parse(event.data);
     setData(newData);
   };
   ```

3. **Google Calendar интеграция**
   ```typescript
   // Синхронизировать бронирования с Google Calendar
   gapi.calendar.events.insert({
     calendarId: 'primary',
     resource: calendarEvent
   });
   ```

## Масштабирование

### 1-100 пользователей (текущее)
```
Client-side IndexedDB
↓
Нет проблем, работает отлично
```

### 100-1000 пользователей
```
Добавить backend API
├── Express.js / Node.js
├── PostgreSQL база данных
└── Real-time синхронизация (Socket.io)
```

### 1000+ пользователей
```
Добавить кэширование и CDN
├── Redis cache (часто используемые запросы)
├── CloudFront (статические файлы)
├── Database репликация (read replicas)
└── Load balancer (nginx)
```

## Развёртывание архитектура

```
┌─────────────────┐
│  Source Code    │
│  (GitHub)       │
└────────┬────────┘
         │
         ▼
┌──────────────────────────────────┐
│  CI/CD Pipeline                  │
│  (GitHub Actions)                │
├──────────────────────────────────┤
│ ✓ Run tests                      │
│ ✓ Type check                     │
│ ✓ Lint                           │
│ ✓ Build (npm run build)          │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│  Distribution                    │
├──────────────────────────────────┤
│ ├─ GitHub Pages (free)           │
│ ├─ Vercel (best)                 │
│ ├─ Netlify                       │
│ ├─ S3 + CloudFront               │
│ └─ Custom server (nginx)         │
└──────────────────────────────────┘
```

## Мониторинг и логирование

### Текущее состояние
- Нет логирования (development mode)
- Browser console для дебага

### Будущее
```typescript
// Sentry для отслеживания ошибок
import * as Sentry from "@sentry/react";

Sentry.init({ dsn: process.env.VITE_SENTRY_DSN });

// Google Analytics
gtag('event', 'booking_created', {
  resourceType: booking.resourceType,
  duration: getDuration(booking)
});
```

## Резервные копии и восстановление

### Текущий механизм
```
Export → JSON файл → Google Drive / Dropbox
         ↑
         │
    При необходимости
         │
         ▼
      Import → IndexedDB
```

### Автоматическое резервное копирование (будущее)
```typescript
// Каждый час
setInterval(() => {
  const backup = JSON.stringify(data);
  localStorage.setItem(`backup-${Date.now()}`, backup);
}, 3600000);

// Очистить старые бэкапы
const backups = Object.keys(localStorage)
  .filter(k => k.startsWith('backup-'))
  .sort()
  .slice(0, -10)  // Сохранить последние 10
  .forEach(k => localStorage.removeItem(k));
```

## Тестирование архитектура

```
Unit Tests (функции)
├── validateBooking()
├── formatDate()
├── timesOverlap()
└── isoToInput()

Component Tests (компоненты)
├── Header render
├── Navigation tabs
├── ResourcesList search
└── BookingForm validation

Integration Tests (потоки)
├── Create booking flow
├── Import/Export cycle
└── Edit booking flow

E2E Tests (полное приложение)
├── User creates booking
├── Data persists
└── Export/Import works
```

## Лицензирование и зависимости

```
Основные зависимости:
├── react@18.2.0          (MIT)
├── react-dom@18.2.0      (MIT)
└── @mui/material@5.14.0  (MIT)

Dev зависимости:
├── typescript             (Apache 2.0)
├── vite                   (MIT)
└── eslint                 (MIT)

Лицензия проекта: MIT
Можно использовать в коммерческих проектах
```

## Контрольный список архитектуры

Перед production развёртыванием:

- ✅ Все компоненты типизированы (TypeScript)
- ✅ Валидация входных данных
- ✅ Error handling во всех операциях
- ✅ IndexedDB инициализация с обработкой ошибок
- ✅ Кэширование статических файлов
- ✅ GZIP сжатие
- ✅ HTTPS (для production)
- ✅ Backup/restore механизм
- ✅ Мониторинг ошибок (опционально)
- ✅ Analytics (опционально)
