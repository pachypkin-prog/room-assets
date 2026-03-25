# Рекомендации по разработке (CONTRIBUTING)

## Перед началом

1. Убедитесь, что у вас установлены:
   - Node.js 18+
   - npm или yarn
   - (опционально) Just для управления задачами

2. Склонируйте репозиторий и установите зависимости:
   ```bash
   git clone <repository>
   cd room-assets
   npm install
   ```

## Запуск разработки

```bash
# С Just
just dev

# С npm
npm run dev
```

Приложение будет доступно на http://localhost:5173 с горячей перезагрузкой (HMR).

## Архитектура

### Структура файлов

```
src/
├── App.tsx          # Основной компонент (550+ строк)
│   ├── Types        # Интерфейсы: Room, Asset, Booking, AppData
│   ├── Utils        # Утилиты: форматирование, валидация, IndexedDB
│   ├── Components   # Внутренние компоненты (Header, Navigation и т.д.)
│   └── App          # Главный компонент с state management
├── App.css          # Все стили приложения (450+ строк)
└── main.tsx         # Точка входа

docs/
├── SPEC.md          # Спецификация и требования
├── DECISIONS.md     # Технические решения
├── DATA_FORMAT.md   # Формат данных JSON
└── CONTRIBUTING.md  # Этот файл

seed/
└── seed.example.json # Пример данных для тестирования
```

### State Management

Приложение использует React Hooks для управления состоянием в одном компоненте `App.tsx`:

```typescript
const [data, setData] = useState<AppData>(initialData);
const [activeTab, setActiveTab] = useState<'resources' | 'bookings'>('resources');
const [searchQuery, setSearchQuery] = useState('');
const [editingBookingId, setEditingBookingId] = useState<string | null>(null);
```

**Преимущества:**
- Простота для MVP
- Полная типизация TypeScript
- Минимум зависимостей

**При миграции на Redux/Context API:**
- Разделить AppData на слайсы (rooms, assets, bookings)
- Создать экшены для каждой операции
- Переместить утилиты в selectors

### Компоненты

Все компоненты являются функциональными и определены как функции внутри `App.tsx`:

#### Header
```typescript
function Header() {
  // Logo и навигация
}
```

#### Navigation
```typescript
function Navigation({ activeTab, onTabChange }) {
  // Tabs: Resources, Bookings
}
```

#### ResourcesList
```typescript
function ResourcesList({ rooms, assets, searchQuery }) {
  // Отображение карточек ресурсов
}
```

#### BookingsList
```typescript
function BookingsList({ bookings, data, onEditBooking, onDeleteBooking }) {
  // Таблица бронирований с CRUD операциями
}
```

#### BookingForm
```typescript
function BookingForm({ booking, rooms, assets, onSave, onCancel }) {
  // Форма создания/редактирования бронирования
}
```

## Добавление нового функционала

### Пример: Добавить фильтр по дате

1. **Добавить state:**
   ```typescript
   const [filterDate, setFilterDate] = useState<string>('');
   ```

2. **Создать компонент фильтра:**
   ```typescript
   function DateFilter({ value, onChange }) {
     return (
       <input
         type="date"
         value={value}
         onChange={(e) => onChange(e.target.value)}
       />
     );
   }
   ```

3. **Обновить BookingsList для фильтрации:**
   ```typescript
   const filteredBookings = filterDate
     ? bookings.filter(b => b.start.startsWith(filterDate))
     : bookings;
   ```

4. **Добавить CSS:**
   ```css
   .date-filter {
     padding: 0.5rem 1rem;
     border: 1px solid var(--border-color);
   }
   ```

### Пример: Добавить удаление комнаты

1. **Добавить handler:**
   ```typescript
   const handleDeleteRoom = (roomId: string) => {
     const updatedData = {
       ...data,
       rooms: data.rooms.filter(r => r.id !== roomId)
     };
     setData(updatedData);
     saveData(updatedData);
   };
   ```

2. **Добавить кнопку в ResourcesList:**
   ```typescript
   <button onClick={() => handleDeleteRoom(room.id)}>
     Удалить
   </button>
   ```

3. **Добавить подтверждение:**
   ```typescript
   const handleDeleteRoom = (roomId: string) => {
     if (!confirm('Вы уверены?')) return;
     // ... удаление
   };
   ```

## Валидация данных

### Текущая валидация

`validateBooking()` функция проверяет:
- Выбраны ли ресурс и время
- Время окончания позже времени начала
- Ресурс существует
- Нет пересечений с другими бронированиями

```typescript
function validateBooking(booking: Booking, data: AppData): string[] {
  const errors: string[] = [];
  
  if (!booking.title) errors.push('Название обязательно');
  if (!booking.resourceType) errors.push('Тип ресурса обязателен');
  if (!booking.resourceId) errors.push('Ресурс обязателен');
  
  // ... дополнительные проверки
  
  return errors;
}
```

### Добавление новой валидации

1. Добавить проверку в `validateBooking()`:
   ```typescript
   if (booking.title.length < 3) {
     errors.push('Название должно быть минимум 3 символа');
   }
   ```

2. Обновить UI для показа ошибки:
   ```typescript
   {validationErrors.includes('Название...') && (
     <div className="error">Название должно быть минимум 3 символа</div>
   )}
   ```

## Работа с датой и временем

Приложение использует **ISO 8601** для хранения и **локальное время** для отображения:

```typescript
// Сохранение (UTC)
const start = new Date('2025-09-05T08:00:00Z');

// Отображение (локальное время)
const displayText = formatDateForDisplay(start); // "5 сентября, 08:00"

// Конвертация из input[type=datetime-local]
const isoString = inputToISO(inputValue);

// Конвертация в input[type=datetime-local]
const inputValue = isoToInput(isoString);
```

**Важно:** Всегда используйте UTC для хранения в IndexedDB!

## Тестирование

### Без тестового фреймворка (текущее состояние)

Тестируйте вручную:

1. **Создание бронирования:**
   - Выбрать комнату и дату/время
   - Проверить, что время не пересекается
   - Сохранить и проверить в таблице

2. **Импорт/экспорт:**
   - Экспортировать данные
   - Очистить IndexedDB (DevTools → Storage → IndexedDB)
   - Импортировать файл
   - Проверить, что данные восстановились

3. **Браузерная совместимость:**
   - Chrome, Firefox, Safari, Edge
   - Mobile (iOS Safari, Android Chrome)

### Рекомендуемый набор инструментов (будущее)

```bash
# Установить Vitest
npm install -D vitest @testing-library/react

# Создать tests/
tests/
├── utils.test.ts        # Тесты для validateBooking, formatDate и т.д.
├── components.test.tsx  # Тесты компонентов
└── integration.test.ts  # Интеграционные тесты
```

Пример теста:

```typescript
// tests/utils.test.ts
import { validateBooking } from '../src/App';

describe('validateBooking', () => {
  it('должна возвращать ошибку если нет названия', () => {
    const booking = { title: '', resourceType: 'room', resourceId: 'r-1' };
    const errors = validateBooking(booking, mockData);
    expect(errors).toContain('Название обязательно');
  });
});
```

## Стиль кода

### TypeScript

- Всегда используйте типы для функций и переменных
- Предпочитайте `interface` для объектов
- Используйте `enum` для перечисляемых значений

```typescript
// Хорошо
function saveBooking(booking: Booking): Promise<void> {
  // ...
}

// Плохо
function saveBooking(booking) {
  // ...
}
```

### React

- Используйте функциональные компоненты и Hooks
- Избегайте циклов useEffect - используйте `useCallback`
- Поднимайте state как можно выше (в App)

```typescript
// Хорошо
function MyComponent({ data, onUpdate }: Props) {
  return <div onClick={() => onUpdate(data)}>...</div>;
}

// Плохо
function MyComponent({ data }) {
  useEffect(() => {
    // Что-то с data
  }, [data]);
}
```

### CSS

- Используйте CSS переменные для цветов
- Вложенные селекторы для модулей
- Мобильный подход (mobile-first)

```css
/* Хорошо */
.button {
  background-color: var(--primary-color);
  padding: var(--spacing-md);
}

.button:hover {
  background-color: var(--primary-dark);
}

/* Плохо */
.button {
  background-color: #3f51b5;
  padding: 12px;
}
```

## Дебаgging

### Console Logs

```typescript
console.log('Бронирование:', booking);
console.warn('Ошибка валидации:', errors);
console.error('Ошибка IndexedDB:', error);
```

### DevTools

1. **Sources:** Поставить breakpoint в коде
2. **Console:** Выполнить команды в контексте страницы
3. **Network:** Проверить XHR запросы (в будущем при API интеграции)
4. **Storage → IndexedDB:** Просмотреть данные

### Проверка IndexedDB

```javascript
// В DevTools Console
const db = window.indexedDB.databases();
db.forEach(d => console.log(d.name));

// Получить все данные
const req = indexedDB.open('RoomAssetsDB');
req.onsuccess = (e) => {
  const os = e.target.result.transaction('appData').objectStore('appData');
  os.getAll().onsuccess = (e) => console.log(e.target.result);
};
```

## Commits и PR

### Сообщения коммитов

```
feat: добавить фильтр по дате в бронирования
fix: исправить пересечение времени бронирований
docs: обновить README с инструкциями импорта
refactor: извлечь валидацию в отдельный модуль
```

### PR Template

```
## Описание
Краткое описание изменений

## Тип изменения
- [ ] Новая функция
- [ ] Исправление ошибки
- [ ] Документация
- [ ] Рефакторинг

## Тестирование
Как были протестированы изменения?

## Чек-лист
- [ ] Код следует стилю проекта
- [ ] Документация обновлена
- [ ] TypeScript ошибок нет
- [ ] Тесты пройдены (если есть)
```

## Производительность

### Текущие ограничения

- Все данные в памяти (OK до 10,000 бронирований)
- Полный перерендер при каждом изменении (OK для MVP)

### Оптимизация (будущее)

1. **Виртуализация списков:**
   ```bash
   npm install react-window
   ```

2. **Пагинация:**
   ```typescript
   const itemsPerPage = 50;
   const currentPage = 1;
   const paginated = bookings.slice(
     (currentPage - 1) * itemsPerPage,
     currentPage * itemsPerPage
   );
   ```

3. **Web Workers для валидации:**
   ```typescript
   const worker = new Worker('validate.worker.ts');
   worker.postMessage(booking);
   ```

## Развёртывание

Приложение готово к развёртыванию на:

- **GitHub Pages:** `npm run build && npx gh-pages -d dist`
- **Vercel:** Подключить репозиторий, выбрать Vite preset
- **Netlify:** Drag & drop папку `dist/`
- **Docker:** Создать Dockerfile с Node.js и nginx

## Полезные ссылки

- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [MDN IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [ISO 8601 Standard](https://en.wikipedia.org/wiki/ISO_8601)

## Вопросы?

- Прочитайте [DECISIONS.md](DECISIONS.md) для архитектурных решений
- Смотрите [DATA_FORMAT.md](DATA_FORMAT.md) для структуры данных
- Откройте Issue на GitHub для обсуждений
