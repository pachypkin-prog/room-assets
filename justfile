# Justfile для Room&Assets Manager
# https://github.com/casey/just
# 
# Использование:
#   just          - показать все команды
#   just dev      - запустить dev сервер
#   just build    - собрать для production
#   just preview  - просмотреть production сборку
#   just lint     - проверить код

set shell := ["bash", "-c"]

# Показать помощь по всем командам
help:
    @just --list

# Установить зависимости
install:
    npm install

# Запустить dev сервер на http://localhost:5173
dev:
    npm run dev

# Собрать для production
build:
    npm run build

# Просмотреть production сборку локально
preview:
    npm run preview

# Проверить TypeScript
type-check:
    npx tsc --noEmit

# Линтинг с ESLint
lint:
    npm run lint

# Установить зависимости и запустить dev сервер
setup: install && dev

# Очистить dist и node_modules
clean:
    rm -rf dist
    rm -rf node_modules
    rm -rf .vite

# Переустановить всё и запустить dev
reset: clean install dev

# Сформировать production артефакт и показать размер
build-check: build
    @echo "=== Размер сборки ==="
    @du -sh dist/
    @echo ""
    @echo "=== Содержимое dist ==="
    @ls -lah dist/

# Запустить все проверки перед коммитом
pre-commit: type-check lint build

# Показать версию Node и npm
version:
    @echo "Node: $(node --version)"
    @echo "npm: $(npm --version)"

# Откыть документацию в браузере (если поддерживается)
docs:
    @echo "Документация находится в папке docs/"
    @echo "  - docs/SPEC.md - спецификация"
    @echo "  - docs/DECISIONS.md - технические решения"
    @echo "  - docs/DATA_FORMAT.md - формат данных"

# Информация о проекте
info:
    @echo "=== Room&Assets Manager ==="
    @echo ""
    @echo "Веб-приложение для управления аудиториями и бронированием"
    @echo ""
    @echo "Технологии:"
    @echo "  - React 18 + TypeScript"
    @echo "  - Vite"
    @echo "  - IndexedDB"
    @echo ""
    @echo "Команды:"
    @echo "  just dev        - разработка"
    @echo "  just build      - production сборка"
    @echo "  just lint       - проверка кода"
    @echo "  just docs       - документация"
    @echo ""
