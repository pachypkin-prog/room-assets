# Формат данных Room&Assets

## Структура JSON файла

Файл для импорта/экспорта должен содержать три массива: `rooms`, `assets`, `bookings`.

## Поле Rooms (Аудитории)

```json
{
  "id": "r-101",
  "name": "Аудитория 101",
  "capacity": 30,
  "features": ["projector", "whiteboard"]
}
```

### Поля:

| Поле | Тип | Обязательное | Описание |
|------|-----|------------|----------|
| `id` | string | ✅ | Уникальный идентификатор (напр. `r-101`) |
| `name` | string | ✅ | Название аудитории |
| `capacity` | number | ✅ | Вместимость (количество людей) |
| `features` | string[] | ✅ | Массив особенностей/оборудования |

### Примеры `features`:

- `"projector"` — проектор
- `"whiteboard"` — доска
- `"sound_system"` — звуковая система
- `"smartboard"` — интерактивная доска
- `"video_conference"` — видеоконференц оборудование

## Поле Assets (Оборудование)

```json
{
  "id": "a-proj-1",
  "name": "Проектор Epson",
  "inventoryCode": "PRJ001",
  "status": "available"
}
```

### Поля:

| Поле | Тип | Обязательное | Описание |
|------|-----|------------|----------|
| `id` | string | ✅ | Уникальный идентификатор (напр. `a-proj-1`) |
| `name` | string | ✅ | Название оборудования |
| `inventoryCode` | string | ✅ | Инвентарный номер |
| `status` | enum | ✅ | Статус: `available`, `broken`, `maintenance` |

### Допустимые значения `status`:

- `"available"` — ✅ Доступно
- `"broken"` — ❌ Сломано
- `"maintenance"` — 🔧 На техническом обслуживании

## Поле Bookings (Брони)

```json
{
  "id": "b-1",
  "resourceType": "room",
  "resourceId": "r-101",
  "title": "Семинар по React",
  "start": "2025-09-05T08:00:00Z",
  "end": "2025-09-05T09:30:00Z",
  "notes": "Нужен HDMI кабель"
}
```

### Поля:

| Поле | Тип | Обязательное | Описание |
|------|-----|------------|----------|
| `id` | string | ✅ | Уникальный идентификатор (напр. `b-1`) |
| `resourceType` | enum | ✅ | Тип ресурса: `room` или `asset` |
| `resourceId` | string | ✅ | ID ресурса (должен совпадать с одним из rooms/assets) |
| `title` | string | ✅ | Название события/брони |
| `start` | string | ✅ | Время начала в ISO 8601 UTC (напр. `2025-09-05T08:00:00Z`) |
| `end` | string | ✅ | Время окончания в ISO 8601 UTC |
| `notes` | string | ✅ | Примечание (может быть пустой строкой `""`) |

### Допустимые значения `resourceType`:

- `"room"` — аудитория (ссылается на объект из массива `rooms`)
- `"asset"` — оборудование (ссылается на объект из массива `assets`)

### Формат времени

**ISO 8601 / RFC 3339 в UTC:**

```
2025-09-05T08:00:00Z
 ^        ^  ^  ^   ^
 дата    час мин сек таймзон (Z = UTC)
 YYYY-MM-DD HH:MM:SS
```

**Примеры:**
- `2025-09-05T08:00:00Z` — 5 сентября 2025, 8:00 UTC
- `2025-01-01T00:00:00Z` — 1 января 2025, 00:00 UTC
- `2025-12-31T23:59:59Z` — 31 декабря 2025, 23:59:59 UTC

⚠️ **Важно**: Время всегда хранится в UTC (с суффиксом `Z`). При отображении приложение автоматически переводит в локальный часовой пояс пользователя.

## Полный пример файла

```json
{
  "rooms": [
    {
      "id": "r-101",
      "name": "Аудитория 101",
      "capacity": 30,
      "features": ["projector", "whiteboard"]
    },
    {
      "id": "r-203",
      "name": "Конференц-зал",
      "capacity": 20,
      "features": ["video_conference", "sound_system"]
    }
  ],
  "assets": [
    {
      "id": "a-proj-1",
      "name": "Проектор Epson",
      "inventoryCode": "PRJ001",
      "status": "available"
    },
    {
      "id": "a-mic-1",
      "name": "Микрофон Shure",
      "inventoryCode": "MIC001",
      "status": "available"
    }
  ],
  "bookings": [
    {
      "id": "b-1",
      "resourceType": "room",
      "resourceId": "r-101",
      "title": "Лекция по веб-разработке",
      "start": "2025-09-15T09:00:00Z",
      "end": "2025-09-15T10:30:00Z",
      "notes": "Проектор + звук"
    },
    {
      "id": "b-2",
      "resourceType": "asset",
      "resourceId": "a-proj-1",
      "title": "Презентация результатов",
      "start": "2025-09-15T11:00:00Z",
      "end": "2025-09-15T12:00:00Z",
      "notes": ""
    }
  ]
}
```

## Валидация данных

При импорте файла приложение проверяет:

1. ✅ Структура JSON корректна
2. ✅ Присутствуют все три массива: `rooms`, `assets`, `bookings`
3. ❌ Не проверяет валидность ID (может привести к "полям без значения")
4. ❌ Не проверяет существование referenced ресурсов

## Рекомендации

- Используйте UUIDs для `id` вместо просто чисел (устойчивей к конфликтам)
- Номера ID в примерах (`r-101`, `a-proj-1`) используются для читаемости
- Сохраняйте экспортированные файлы как backup
- При импорте убедитесь что это правильный файл (все текущие данные будут заменены!)

## Пример использования

### Экспорт

1. Откройте приложение
2. Нажмите кнопку 📥 (Экспорт) в шапке
3. Автоматически скачается файл `room-assets-2025-09-20.json`

### Импорт

1. Нажмите кнопку 📤 (Импорт) в шапке
2. Выберите JSON файл
3. Подтвердите (текущие данные будут заменены)
4. После успеха все данные из файла будут загружены

## Типизация TypeScript

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
  start: string; // ISO 8601 UTC
  end: string;   // ISO 8601 UTC
  notes: string;
}

interface AppData {
  rooms: Room[];
  assets: Asset[];
  bookings: Booking[];
}
```
