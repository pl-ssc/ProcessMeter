# Настройка локальной разработки

## 1. Запуск PostgreSQL

```bash
docker compose up -d db
```

## 2. Создание `.env`

```bash
cp .env.example .env
```

Минимум для локальной разработки:
```env
TARGET_DATABASE_URL=postgres://postgres:postgres@localhost:5432/processmeter
JWT_SECRET=dev-only-secret
APP_URL=http://localhost:3001
ADMIN_USERNAME=admin@example.com
ADMIN_PASSWORD=admin123
ADMIN_FULL_NAME=Администратор
ORG_NAME=МояОрганизация
```

> `NODE_ENV` **не устанавливайте** локально — тогда проверка обязательных production-переменных не будет срабатывать.

## 3. Установка зависимостей

```bash
cd backend && npm install
cd ../frontend && npm install
cd ..
```

## 4. Применение миграций

```bash
cd backend
npm run migrate:up
```

Миграции хранятся в `backend/migrations/`. При запуске через `npm start` применяются автоматически через `start.js`.

## 5. Запуск бэкенда

```bash
cd backend
npm run dev
# Сервер поднимается на http://localhost:3001
```

## 6. Запуск фронтенда

```bash
cd frontend
npm run dev
# Vite запускается на http://localhost:5173
# API проксируется на http://localhost:3001
```

## 7. Первый вход

Откройте `http://localhost:5173` и войдите с учётными данными из `ADMIN_USERNAME` / `ADMIN_PASSWORD`.

## 8. Настройка SMTP (опционально)

Если нужна отправка email локально — используйте [Mailpit](https://github.com/axllent/mailpit) или аналогичный SMTP-catching сервер:

```bash
docker run -d -p 1025:1025 -p 8025:8025 axllent/mailpit
```

В интерфейсе администратора (Настройки → SMTP):
- Host: `localhost`, Port: `1025`, Secure: выключено
- User/Password: любые

Веб-интерфейс Mailpit: `http://localhost:8025`

## 9. Импорт справочников (опционально)

Если есть доступ к эталонной БД:

```bash
pg_dump "$SOURCE_DATABASE_URL" \
  --data-only --column-inserts \
  --table=process_1 --table=process_2 --table=process_3 --table=process_4 \
  --table=systems --table=executors \
  > /tmp/pm_seed.sql

psql "$TARGET_DATABASE_URL" -f /tmp/pm_seed.sql
```

Либо через API администратора: **Администрирование → Импорт**.

## Полный деплой в один контейнер

```bash
docker compose up --build
```

Фронт и бэк доступны на `http://localhost:3001`.
