#!/usr/bin/env bash
# Скрипт для быстрого старта Room&Assets Manager

echo "╔════════════════════════════════════════════════════════════╗"
echo "║   🚀  Room&Assets Manager - Быстрый Старт                 ║"
echo "║                                                            ║"
echo "║   Дата: 2025-09-05 | Версия: 1.0.0 (MVP)                 ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Проверка Node.js
echo "✓ Проверяем Node.js..."
if ! command -v node &> /dev/null; then
    echo "✗ Node.js не установлен!"
    echo "  Скачайте с https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v)
echo "  Версия Node.js: $NODE_VERSION"
echo ""

# Установка зависимостей
echo "✓ Установка зависимостей npm..."
if [ ! -d "node_modules" ]; then
    npm install
    if [ $? -ne 0 ]; then
        echo "✗ Ошибка при установке npm пакетов!"
        exit 1
    fi
else
    echo "  node_modules уже существует (пропускаем)"
fi
echo ""

# Проверка кода
echo "✓ Проверяем TypeScript..."
npx tsc --noEmit
if [ $? -ne 0 ]; then
    echo "✗ Ошибки TypeScript!"
    exit 1
fi
echo "  ✓ Ошибок TypeScript не найдено"
echo ""

# Запуск dev сервера
echo "╔════════════════════════════════════════════════════════════╗"
echo "║   ✓ Всё готово к работе!                                  ║"
echo "║                                                            ║"
echo "║   📱 Приложение запускается на:                           ║"
echo "║      http://localhost:5173                                ║"
echo "║                                                            ║"
echo "║   📖 Документация:                                         ║"
echo "║      docs/QUICKSTART.md  - Быстрый старт                 ║"
echo "║      docs/INDEX.md       - Полный индекс                 ║"
echo "║                                                            ║"
echo "║   ⌨️  Команды:                                             ║"
echo "║      npm run dev         - Запустить dev                 ║"
echo "║      npm run build       - Собрать production             ║"
echo "║      npm run lint        - Проверить код                 ║"
echo "║                                                            ║"
echo "║   Нажмите Ctrl+C для остановки сервера                   ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Запуск сервера
npm run dev
