import { useState, useEffect, useRef } from 'react'
import './App.css'

// ============= TYPES =============
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
  start: string;
  end: string;
  notes: string;
}

interface AppData {
  rooms: Room[];
  assets: Asset[];
  bookings: Booking[];
}

// ============= MOCK DATA =============
const mockData: AppData = {
  rooms: [
    { id: "r-101", name: "Аудитория 101", capacity: 30, features: ["projector", "whiteboard"] },
    { id: "r-203", name: "Аудитория 203", capacity: 20, features: ["sound_system"] },
    { id: "r-305", name: "Аудитория 305", capacity: 50, features: ["projector", "whiteboard", "sound_system"] },
  ],
  assets: [
    { id: "a-proj-1", name: "Проектор Epson", inventoryCode: "PRJ001", status: "available" },
    { id: "a-proj-2", name: "Проектор Sony", inventoryCode: "PRJ002", status: "available" },
    { id: "a-mic-1", name: "Микрофон Shure", inventoryCode: "MIC001", status: "maintenance" },
  ],
  bookings: [
    {
      id: "b-1",
      resourceType: "room",
      resourceId: "r-101",
      title: "Семинар по React",
      start: "2025-09-05T08:00:00Z",
      end: "2025-09-05T09:30:00Z",
      notes: "Нужен HDMI кабель"
    },
    {
      id: "b-2",
      resourceType: "asset",
      resourceId: "a-proj-1",
      title: "Презентация компании",
      start: "2025-09-05T10:00:00Z",
      end: "2025-09-05T11:00:00Z",
      notes: "Потребуется USB"
    },
  ]
};

// ============= UTILITIES =============
function formatDateForDisplay(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function isoToInput(isoString: string): { date: string; time: string } {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return {
    date: `${year}-${month}-${day}`,
    time: `${hours}:${minutes}`
  };
}

function inputToISO(dateString: string, timeString: string): string {
  const [year, month, day] = dateString.split("-");
  const [hours, minutes] = timeString.split(":");
  const localDate = new Date(
    parseInt(year),
    parseInt(month) - 1,
    parseInt(day),
    parseInt(hours),
    parseInt(minutes),
    0
  );
  return localDate.toISOString();
}

function timesOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
  const s1 = new Date(start1).getTime();
  const e1 = new Date(end1).getTime();
  const s2 = new Date(start2).getTime();
  const e2 = new Date(end2).getTime();
  return s1 < e2 && s2 < e1;
}

function validateBooking(booking: Booking, rooms: Room[], assets: Asset[], existingBookings: Booking[]): string | null {
  if (new Date(booking.start) >= new Date(booking.end)) {
    return "Время начала должно быть раньше времени конца";
  }
  if (booking.resourceType === "room") {
    if (!rooms.some(r => r.id === booking.resourceId)) {
      return "Выбранная аудитория не существует";
    }
  } else {
    if (!assets.some(a => a.id === booking.resourceId)) {
      return "Выбранное оборудование не существует";
    }
  }
  for (const existingBooking of existingBookings) {
    if (existingBooking.resourceId === booking.resourceId && 
        existingBooking.resourceType === booking.resourceType && 
        existingBooking.id !== booking.id) {
      if (timesOverlap(booking.start, booking.end, existingBooking.start, existingBooking.end)) {
        return `Это время уже забронировано (событие: "${existingBooking.title}")`;
      }
    }
  }
  return null;
}

// ============= DB FUNCTIONS =============
const DB_NAME = "RoomAssetsDB";
const STORE_NAME = "appData";

async function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onerror = () => reject(new Error("Ошибка при открытии БД"));
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

async function saveData(data: AppData): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(data, "appData");
    request.onerror = () => reject(new Error("Ошибка при сохранении"));
    request.onsuccess = () => resolve();
  });
}

async function loadData(): Promise<AppData | null> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get("appData");
    request.onerror = () => reject(new Error("Ошибка при загрузке"));
    request.onsuccess = () => resolve(request.result || null);
  });
}

// ============= COMPONENTS =============
interface HeaderProps {
  onSearch: (q: string) => void;
  onExport: () => void;
  onImportClick: () => void;
  searchQuery: string;
}

function Header({ onSearch, onExport, onImportClick, searchQuery }: HeaderProps) {
  return (
    <header className="header">
      <h1>🏢 Room&Assets Manager</h1>
      <div className="header-controls">
        <input
          type="text"
          className="search-input"
          placeholder="🔍 Поиск..."
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
        />
        <button className="btn btn-primary" onClick={onExport} title="Скачать данные">📥 Экспорт</button>
        <button className="btn btn-primary" onClick={onImportClick} title="Загрузить данные">📤 Импорт</button>
      </div>
    </header>
  );
}

interface NavigationProps {
  activeTab: "resources" | "bookings" | "new-booking";
  onTabChange: (tab: "resources" | "bookings" | "new-booking") => void;
  bookingCount: number;
}

function Navigation({ activeTab, onTabChange, bookingCount }: NavigationProps) {
  return (
    <nav className="navigation">
      <button
        className={activeTab === "resources" ? "nav-button active" : "nav-button"}
        onClick={() => onTabChange("resources")}
      >
        🏛️ Ресурсы
      </button>
      <button
        className={activeTab === "bookings" ? "nav-button active" : "nav-button"}
        onClick={() => onTabChange("bookings")}
      >
        📅 Бронирования <span className="badge">{bookingCount}</span>
      </button>
      <button
        className={activeTab === "new-booking" ? "nav-button active" : "nav-button"}
        onClick={() => onTabChange("new-booking")}
      >
        ➕ Новая бронь
      </button>
    </nav>
  );
}

interface ResourcesListProps {
  rooms: Room[];
  assets: Asset[];
  searchQuery: string;
}

function ResourcesList({ rooms, assets, searchQuery }: ResourcesListProps) {
  const filteredRooms = rooms.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredAssets = assets.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="resources-container">
      <section className="resources-section">
        <h2>🏛️ Аудитории</h2>
        {filteredRooms.length === 0 ? (
          <div className="empty-state">
            <p>😴 Нет аудиторий</p>
          </div>
        ) : (
          <div className="resources-grid">
            {filteredRooms.map((room) => (
              <div key={room.id} className="resource-card">
                <h3>{room.name}</h3>
                <p>👥 Вместимость: <strong>{room.capacity}</strong> человек</p>
                {room.features.length > 0 && (
                  <p>✨ Оборудование: {room.features.join(", ")}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="resources-section">
        <h2>📦 Оборудование</h2>
        {filteredAssets.length === 0 ? (
          <div className="empty-state">
            <p>😴 Нет оборудования</p>
          </div>
        ) : (
          <div className="resources-grid">
            {filteredAssets.map((asset) => (
              <div key={asset.id} className="resource-card">
                <h3>{asset.name}</h3>
                <p>📋 Инвентарный номер: <strong>{asset.inventoryCode}</strong></p>
                <p>
                  Статус: <span className={`status status-${asset.status}`}>
                    {asset.status === 'available' ? '✅ Доступно' : 
                     asset.status === 'broken' ? '❌ Сломано' : '🔧 На техническом обслуживании'}
                  </span>
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

interface BookingsListProps {
  bookings: Booking[];
  rooms: Room[];
  assets: Asset[];
  searchQuery: string;
  onEditBooking: (id: string) => void;
  onDeleteBooking: (id: string) => void;
}

function BookingsList({ bookings, rooms, assets, searchQuery, onEditBooking, onDeleteBooking }: BookingsListProps) {
  const filtered = bookings
    .filter((b) => b.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  const getResourceName = (type: string, id: string) => {
    if (type === "room") return rooms.find((r) => r.id === id)?.name || "?";
    return assets.find((a) => a.id === id)?.name || "?";
  };

  return (
    <div className="bookings-list">
      {filtered.length === 0 ? (
        <div className="empty-state">
          <p>📭 Нет бронирований</p>
        </div>
      ) : (
        <table className="bookings-table">
          <thead>
            <tr>
              <th>📋 Название</th>
              <th>🏛️ Ресурс</th>
              <th>⏰ Время</th>
              <th>📝 Примечание</th>
              <th>⚙️ Действия</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => (
              <tr key={b.id}>
                <td className="booking-title">{b.title}</td>
                <td>{getResourceName(b.resourceType, b.resourceId)}</td>
                <td className="booking-time">
                  {formatDateForDisplay(b.start)} {formatTime(b.start)} - {formatTime(b.end)}
                </td>
                <td className="booking-notes">{b.notes}</td>
                <td className="booking-actions">
                  <button onClick={() => onEditBooking(b.id)} className="btn-edit">✏️ Редактировать</button>
                  <button onClick={() => {
                    if (window.confirm("Удалить эту бронь?")) onDeleteBooking(b.id);
                  }} className="btn-delete-booking">🗑️ Удалить</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

interface BookingFormProps {
  rooms: Room[];
  assets: Asset[];
  onSubmit: (b: Booking) => void;
  onCancel: () => void;
  initialBooking?: Booking;
}

function BookingForm({ rooms, assets, onSubmit, onCancel, initialBooking }: BookingFormProps) {
  const [title, setTitle] = useState(initialBooking?.title || "");
  const [resourceType, setResourceType] = useState<"room" | "asset">(initialBooking?.resourceType || "room");
  const [resourceId, setResourceId] = useState(initialBooking?.resourceId || "");
  const [startDate, setStartDate] = useState(initialBooking ? isoToInput(initialBooking.start).date : new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState(initialBooking ? isoToInput(initialBooking.start).time : "09:00");
  const [endDate, setEndDate] = useState(initialBooking ? isoToInput(initialBooking.end).date : new Date().toISOString().split("T")[0]);
  const [endTime, setEndTime] = useState(initialBooking ? isoToInput(initialBooking.end).time : "10:00");
  const [notes, setNotes] = useState(initialBooking?.notes || "");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title || !resourceId || !startDate || !startTime || !endDate || !endTime) {
      setError("Заполните все поля");
      return;
    }
    try {
      onSubmit({
        id: initialBooking?.id || `b-${Date.now()}`,
        resourceType,
        resourceId,
        title,
        start: inputToISO(startDate, startTime),
        end: inputToISO(endDate, endTime),
        notes,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    }
  };

  const resources = resourceType === "room" ? rooms : assets;

  return (
    <form className="booking-form" onSubmit={handleSubmit}>
      <h2>{initialBooking ? "✏️ Редактировать бронь" : "➕ Новая бронь"}</h2>
      {error && <div className="error-message">❌ {error}</div>}
      
      <input
        type="text"
        placeholder="📝 Название события"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      
      <select
        value={resourceType}
        onChange={(e) => {
          setResourceType(e.target.value as "room" | "asset");
          setResourceId("");
        }}
      >
        <option value="room">🏛️ Аудитория</option>
        <option value="asset">📦 Оборудование</option>
      </select>
      
      <select value={resourceId} onChange={(e) => setResourceId(e.target.value)} required>
        <option value="">-- Выберите ресурс --</option>
        {resources.map((r: any) => (
          <option key={r.id} value={r.id}>{r.name}</option>
        ))}
      </select>
      
      <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
      <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
      <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
      <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
      
      <textarea
        placeholder="📝 Примечание"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={3}
      />
      
      <div className="form-actions">
        <button type="submit" className="btn-submit">
          {initialBooking ? "💾 Сохранить изменения" : "✅ Создать бронь"}
        </button>
        <button type="button" onClick={onCancel} className="btn-cancel">❌ Отменить</button>
      </div>
    </form>
  );
}

// ============= MAIN APP =============
function App() {
  const [data, setData] = useState<AppData>(mockData);
  const [activeTab, setActiveTab] = useState<"resources" | "bookings" | "new-booking">("resources");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingBookingId, setEditingBookingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData().then((savedData) => {
      if (savedData) setData(savedData);
    });
  }, []);

  useEffect(() => {
    saveData(data);
  }, [data]);

  const editingBooking: Booking | undefined = editingBookingId
    ? data.bookings.find((b) => b.id === editingBookingId)
    : undefined;

  const handleExport = () => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `room-assets-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const text = await file.text();
        const imported = JSON.parse(text);
        if (!Array.isArray(imported.rooms) || !Array.isArray(imported.assets) || !Array.isArray(imported.bookings)) {
          throw new Error("Неверный формат JSON");
        }
        setData(imported);
        alert("Импорт успешен!");
      } catch (error) {
        alert(`Ошибка: ${error instanceof Error ? error.message : "?"}`);
      }
    }
    e.target.value = "";
  };

  const addBooking = (booking: Booking) => {
    const error = validateBooking(booking, data.rooms, data.assets, data.bookings);
    if (error) {
      alert(error);
      return;
    }
    setData((prev) => ({ ...prev, bookings: [...prev.bookings, booking] }));
    setActiveTab("bookings");
  };

  const updateBooking = (booking: Booking) => {
    const error = validateBooking(booking, data.rooms, data.assets, data.bookings);
    if (error) {
      alert(error);
      return;
    }
    setData((prev) => ({
      ...prev,
      bookings: prev.bookings.map((b) => (b.id === booking.id ? booking : b)),
    }));
    setEditingBookingId(null);
    setActiveTab("bookings");
  };

  const deleteBooking = (id: string) => {
    setData((prev) => ({
      ...prev,
      bookings: prev.bookings.filter((b) => b.id !== id),
    }));
  };

  return (
    <div className="app">
      <Header
        onSearch={setSearchQuery}
        onExport={handleExport}
        onImportClick={() => fileInputRef.current?.click()}
        searchQuery={searchQuery}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImport}
        style={{ display: "none" }}
      />
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} bookingCount={data.bookings.length} />
      <main className="main-content">
        {activeTab === "resources" && (
          <ResourcesList rooms={data.rooms} assets={data.assets} searchQuery={searchQuery} />
        )}
        {activeTab === "bookings" && (
          <BookingsList
            bookings={data.bookings}
            rooms={data.rooms}
            assets={data.assets}
            searchQuery={searchQuery}
            onEditBooking={(id: string) => {
              setEditingBookingId(id);
              setActiveTab("new-booking");
            }}
            onDeleteBooking={deleteBooking}
          />
        )}
        {activeTab === "new-booking" && (
          <BookingForm
            rooms={data.rooms}
            assets={data.assets}
            onSubmit={(b) => {
              if (editingBooking) {
                updateBooking(b);
              } else {
                addBooking(b);
              }
            }}
            onCancel={() => {
              setEditingBookingId(null);
              setActiveTab("bookings");
            }}
            initialBooking={editingBooking}
          />
        )}
      </main>
    </div>
  );
}

export default App;
