# Гайд по тестированию

## Подход к тестированию (MVP)

Текущая версия использует **manual testing** (ручное тестирование) через UI. 

Для полноценного тестирования рекомендуется добавить Vitest позже.

## Ручное тестирование

### 1. Проверка базовой функциональности

#### Сценарий: Создание нового бронирования

1. **Запустить приложение:**
   ```bash
   npm run dev
   ```

2. **Перейти на вкладку "Bookings"**

3. **Нажать кнопку "New Booking"**

4. **Заполнить форму:**
   - Тип ресурса: "room"
   - Ресурс: "Conference Room 1 (30 seats)"
   - Название: "Team Meeting"
   - Дата начала: 2025-09-05
   - Время начала: 10:00
   - Дата окончания: 2025-09-05
   - Время окончания: 11:00
   - Заметки: (оставить пусто)

5. **Нажать "Save"**

6. **Проверить результаты:**
   - ✅ Бронирование появилось в таблице
   - ✅ Время отображается в локальной временной зоне
   - ✅ Статус "confirmed"

#### Сценарий: Попытка создать пересекающееся бронирование

1. **Попытаться создать бронирование с временем 10:30-11:30**
   (пересекается с предыдущим 10:00-11:00)

2. **Проверить результат:**
   - ❌ Должна появиться ошибка: "Time overlaps with another booking"
   - ❌ Кнопка "Save" должна быть disabled

#### Сценарий: Валидация обязательных полей

1. **Нажать "New Booking"**

2. **Оставить форму пустой и нажать "Save"**

3. **Проверить ошибки:**
   - "Title is required"
   - "Resource type is required"
   - "Resource is required"
   - "Invalid time range"

### 2. Проверка импорта/экспорта

#### Экспорт данных

1. **Перейти на вкладку "Bookings"**

2. **Нажать кнопку "Export"**

3. **Проверить скачанный файл:**
   - Имя: `room-assets-backup-YYYY-MM-DD.json`
   - Формат: Valid JSON
   - Содержит комнаты, активы и бронирования

#### Импорт данных

1. **Перейти на вкладку "Bookings"**

2. **Нажать кнопку "Import"**

3. **Выбрать файл [seed/seed.example.json](../seed/seed.example.json)**

4. **Проверить результаты:**
   - ✅ Таблица обновилась с данными из файла
   - ✅ IndexedDB содержит новые данные

### 3. Проверка поиска

#### Фильтр по названию комнаты

1. **Перейти на вкладку "Resources"**

2. **Ввести "Conference" в поиск**

3. **Проверить результаты:**
   - ✅ Отображаются только "Conference Room *"
   - ✅ "Conference Room" с проектором видна
   - ✅ Активы скрыты

#### Фильтр по активу

1. **Ввести "Projector" в поиск**

2. **Проверить результаты:**
   - ✅ Видны только проекторы (a-proj-1, a-proj-2)
   - ✅ Комнаты скрыты

#### Очистка поиска

1. **Очистить поле поиска**

2. **Проверить:**
   - ✅ Все ресурсы видны снова

### 4. Проверка персистентности данных

#### IndexedDB сохранение

1. **Создать новое бронирование**

2. **Перезагрузить страницу (F5)**

3. **Проверить:**
   - ✅ Бронирование всё ещё есть
   - ✅ Таблица загружена из IndexedDB

#### Очистка хранилища

1. **DevTools → Application → Storage → IndexedDB → RoomAssetsDB → appData**

2. **Удалить все данные (right-click → delete)**

3. **Перезагрузить страницу**

4. **Проверить:**
   - ✅ Загружены default mock данные
   - ✅ Приложение работает нормально

### 5. Проверка редактирования

#### Редактирование бронирования

1. **В таблице Bookings нажать на бронирование**

2. **Форма должна заполниться текущими значениями**

3. **Изменить время: 11:00 → 11:30**

4. **Нажать "Save"**

5. **Проверить:**
   - ✅ Время обновилось в таблице
   - ✅ Нет ошибок пересечения (если новое время свободно)

#### Отмена редактирования

1. **Начать редактировать бронирование**

2. **Нажать "Cancel"**

3. **Проверить:**
   - ✅ Форма очищена
   - ✅ Бронирование не изменилось

### 6. Проверка удаления

#### Удаление бронирования

1. **В таблице нажать на бронирование**

2. **Форма должна появиться с этими данными**

3. **Нажать кнопку "Delete" (красная кнопка)**

4. **Подтвердить удаление**

5. **Проверить:**
   - ✅ Бронирование удалилось из таблицы
   - ✅ Число бронирований уменьшилось

## Чек-лист браузерной совместимости

Протестировать на следующих браузерах:

| Браузер | Версия | IndexedDB | Локальное время | Статус |
|---------|--------|-----------|-----------------|--------|
| Chrome  | 120+   | ✅        | ✅              | ✅     |
| Firefox | 121+   | ✅        | ✅              | ✅     |
| Safari  | 17+    | ✅        | ✅              | ✅     |
| Edge    | 120+   | ✅        | ✅              | ✅     |

### Мобильные браузеры

| Браузер | Версия | Совместимость | Статус |
|---------|--------|---------------|--------|
| Chrome Mobile | 120+ | ✅ | ✅ |
| Safari iOS | 17+ | ✅ | ✅ |
| Firefox Mobile | 121+ | ✅ | ✅ |

## Юнит-тесты (будущее)

Когда будет добавлен Vitest, необходимо покрыть тестами:

### validateBooking()

```typescript
import { describe, it, expect } from 'vitest';
import { validateBooking } from '../src/App';

describe('validateBooking', () => {
  const mockData = {
    rooms: [{ id: 'r-1', name: 'Room 1', capacity: 10, features: [] }],
    assets: [{ id: 'a-1', name: 'Asset 1', inventoryCode: 'INV-001', status: 'available' }],
    bookings: [
      {
        id: 'b-1',
        resourceType: 'room',
        resourceId: 'r-1',
        title: 'Meeting',
        start: '2025-09-05T10:00:00Z',
        end: '2025-09-05T11:00:00Z',
        notes: ''
      }
    ]
  };

  it('должна вернуть ошибку если нет названия', () => {
    const booking = {
      id: 'b-2',
      resourceType: 'room',
      resourceId: 'r-1',
      title: '',
      start: '2025-09-05T11:00:00Z',
      end: '2025-09-05T12:00:00Z',
      notes: ''
    };
    const errors = validateBooking(booking, mockData);
    expect(errors).toContain('Title is required');
  });

  it('должна вернуть ошибку если время окончания раньше начала', () => {
    const booking = {
      id: 'b-3',
      resourceType: 'room',
      resourceId: 'r-1',
      title: 'Meeting',
      start: '2025-09-05T12:00:00Z',
      end: '2025-09-05T11:00:00Z',
      notes: ''
    };
    const errors = validateBooking(booking, mockData);
    expect(errors).toContain('Invalid time range');
  });

  it('должна вернуть ошибку если времена пересекаются', () => {
    const booking = {
      id: 'b-4',
      resourceType: 'room',
      resourceId: 'r-1',
      title: 'Meeting',
      start: '2025-09-05T10:30:00Z',
      end: '2025-09-05T11:30:00Z',
      notes: ''
    };
    const errors = validateBooking(booking, mockData);
    expect(errors).toContain('Time overlaps with another booking');
  });

  it('должна позволить бронирование если нет пересечений', () => {
    const booking = {
      id: 'b-5',
      resourceType: 'room',
      resourceId: 'r-1',
      title: 'Meeting',
      start: '2025-09-05T11:00:00Z',
      end: '2025-09-05T12:00:00Z',
      notes: ''
    };
    const errors = validateBooking(booking, mockData);
    expect(errors).toHaveLength(0);
  });
});
```

### formatDateForDisplay()

```typescript
describe('formatDateForDisplay', () => {
  it('должна отформатировать ISO дату в локальный формат', () => {
    const result = formatDateForDisplay('2025-09-05T08:00:00Z');
    // Результат зависит от локали
    expect(result).toMatch(/5.*сентября.*08:00/i);
  });
});
```

### timesOverlap()

```typescript
describe('timesOverlap', () => {
  it('должна вернуть true если времена пересекаются', () => {
    const result = timesOverlap(
      new Date('2025-09-05T10:00:00Z'),
      new Date('2025-09-05T11:00:00Z'),
      new Date('2025-09-05T10:30:00Z'),
      new Date('2025-09-05T11:30:00Z')
    );
    expect(result).toBe(true);
  });

  it('должна вернуть false если времена не пересекаются', () => {
    const result = timesOverlap(
      new Date('2025-09-05T10:00:00Z'),
      new Date('2025-09-05T11:00:00Z'),
      new Date('2025-09-05T11:00:00Z'),
      new Date('2025-09-05T12:00:00Z')
    );
    expect(result).toBe(false);
  });
});
```

## Интеграционные тесты (будущее)

```typescript
import { render, screen, userEvent } from '@testing-library/react';
import App from '../src/App';

describe('Booking creation flow', () => {
  it('должна создать бронирование через UI', async () => {
    render(<App />);
    
    // Перейти на вкладку Bookings
    const bookingsTab = screen.getByRole('button', { name: /bookings/i });
    await userEvent.click(bookingsTab);
    
    // Нажать New Booking
    const newBookingBtn = screen.getByRole('button', { name: /new booking/i });
    await userEvent.click(newBookingBtn);
    
    // Заполнить форму
    const titleInput = screen.getByPlaceholderText('Meeting title');
    await userEvent.type(titleInput, 'Team Meeting');
    
    // ... остальные поля
    
    // Сохранить
    const saveBtn = screen.getByRole('button', { name: /save/i });
    await userEvent.click(saveBtn);
    
    // Проверить результат
    expect(screen.getByText('Team Meeting')).toBeInTheDocument();
  });
});
```

## Performance тестирование

### Загрузка большого датасета

```bash
# Создать тестовый файл с 1000 бронирований
node scripts/generate-large-dataset.js > seed/seed-large.json

# Импортировать и измерить время
# Время загрузки должно быть < 2 сек
```

### Профилирование в DevTools

1. **Chrome DevTools → Performance**
2. **Нажать Record**
3. **Создать новое бронирование**
4. **Stop**
5. **Проверить:**
   - Main thread заблокирован ≤ 50ms
   - FCP < 1s
   - LCP < 2s

## Тестирование доступности (Accessibility)

### Keyboard Navigation

- ✅ Tab переходит по всем кнопкам
- ✅ Enter активирует кнопку
- ✅ Esc закрывает диалоги
- ✅ Табулятор работает в forms

### Screen Reader (NVDA/JAWS)

- ✅ Заголовки правильно размечены (h1, h2)
- ✅ Кнопки имеют aria-label если нужно
- ✅ Инпуты связаны с labels
- ✅ Таблица имеет thead/tbody

### Контрастность

Проверить с [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/):

- Фон #333, текст #fff → Ratio 12.6:1 ✅
- Фон #3f51b5, текст #fff → Ratio 8.5:1 ✅
- Кнопка "успех" зелёная (#4caf50) → не только цвет ✅

## Отчёт о тестировании

Шаблон для документирования результатов:

```markdown
# Test Report - v1.0.0

## Date: 2025-09-05
## Tester: [Имя]
## Environment: Chrome 120.0 / Windows 11 / Node 20.10

### Summary
- ✅ Passed: 25/25
- ❌ Failed: 0
- ⏭️ Skipped: 0

### Test Cases

| # | Сценарий | Результат | Примечания |
|---|----------|-----------|-----------|
| 1 | Создание бронирования | ✅ PASS | Все поля работают |
| 2 | Валидация пересечения | ✅ PASS | Ошибка отображается |
| ... | ... | ... | ... |

### Issues Found
Нет серьёзных проблем найдено.

### Recommendations
- Добавить загрузчик при импорте больших файлов
- Добавить горячие клавиши для частых операций
```

## CI/CD интеграция (будущее)

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test
      - run: npm run build
```
