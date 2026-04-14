# Инструкция для технического специалиста

В данном документе описаны процедуры развертывания, настройки и обслуживания приложения ProcessMeter.

## 1. Системные требования

*   Docker и Docker Compose.
*   Node.js v24+ (для локальной разработки без Docker).
*   Свободные порты: `3001` (backend), `5173` (frontend dev), `5432` (PostgreSQL).

## 2. Развертывание

### Через Docker Compose

```bash
cp .env.example .env
# Заполните все обязательные переменные в .env
docker compose up --build -d
```

Приложение будет доступно на `http://HOST:PORT` (по умолчанию `http://HOST:3001`).

### Вручную (без Docker)

```bash
# 1. Установка зависимостей
cd backend && npm install
cd ../frontend && npm install && npm run build
cd ..

# 2. Применение миграций (или запустится автоматически через npm start)
cd backend && npm run migrate:up

# 3. Запуск
NODE_ENV=production node backend/src/start.js
```

## 3. Настройка окружения (`.env`)

Создайте `.env` в корне проекта на основе `.env.example`. Обязательные переменные для production:

| Переменная | Описание |
|---|---|
| `TARGET_DATABASE_URL` | Строка подключения к рабочей БД |
| `JWT_SECRET` | Секрет JWT (≥32 символа, уникальный) |
| `APP_URL` | Публичный URL приложения (для ссылок в email) |
| `ADMIN_USERNAME` | Email первого администратора |
| `ADMIN_PASSWORD` | Пароль первого администратора |

> ⚠️ При `NODE_ENV=production` сервер завершится с ошибкой `[FATAL]`, если `JWT_SECRET` не задан или равен `change-me`.

Переменные окружения для Metabase больше не используются и не должны добавляться в проектный `.env`.

## 4. Управление миграциями БД

Миграции применяются автоматически при `npm start` и хранятся в `backend/migrations/`.

Ручные команды:
```bash
cd backend

# Применить все незапущенные миграции
npm run migrate:up

# Откатить последнюю миграцию
npm run migrate:down

# Проверить статус
npm run migrate -- status
```

## 5. Настройка SMTP и email

SMTP настраивается через **административный интерфейс → Настройки**. Параметры сохраняются в таблице `settings`.

Доступные параметры: `smtp_host`, `smtp_port`, `smtp_user`, `smtp_password`, `smtp_from`, `smtp_from_name`, `smtp_secure`.

Кнопка «Тест подключения» проверяет SMTP без отправки письма.

> Убедитесь, что `APP_URL` в `.env` указывает на публичный адрес — он используется при формировании ссылок в письмах.

### Шаблоны писем

Шаблоны приглашения, сброса пароля и уведомления об опросе хранятся в `settings` (ключи `email_invite_html`, `email_reset_html`, `email_survey_complete_html`). Правятся через Admin UI.

В шаблонах доступны переменные: `{{full_name}}`, `{{org_name}}`, `{{link}}`.

## 6. Импорт справочников

```bash
# Через Admin UI: Администрирование → Импорт

# Или curl
curl -X POST https://your-app/api/admin/import \
  -H "X-Admin-Key: YOUR_ADMIN_API_KEY"
```

⚠️ Импорт **очищает `user_answers`** и пересоздаёт пустые ответы. Выполняйте до начала работы пользователей.

## 7. Аналитика

Аналитика реализована внутри приложения и не зависит от внешнего BI-сервиса. Базовые агрегаты и витрины лежат в `db/bi_views.sql`, а пользовательский интерфейс работает через API `/api/analytics/*`.

## 8. Ручные операции (SQL)

Создание администратора вручную (если `ensureAdminUser` не отработал):
```sql
INSERT INTO users (username, password_hash, full_name, role, is_active)
VALUES ('admin@example.com', '<bcrypt_hash>', 'Администратор', 'admin', true);
```

Инвалидировать все активные токены пользователя:
```sql
UPDATE password_tokens SET used_at = now()
WHERE user_id = <id> AND used_at IS NULL;
```

## 9. Устранение неполадок

| Симптом | Возможная причина | Решение |
|---|---|---|
| `[FATAL] Missing required environment variables` | Не задан `JWT_SECRET` или `TARGET_DATABASE_URL` в production | Задайте переменные в `.env` |
| Письма не приходят | Неверные SMTP-настройки или неправильный `APP_URL` | Проверьте SMTP-тест в Настройках; убедитесь, что `APP_URL` публичный |
| Ошибка ES-модулей | Используете `require()` в новых скриптах | Используйте `import/export` и явные расширения `.js` |
| `relation "password_tokens" does not exist` | Миграция не применялась | Запустите `npm run migrate:up` |
| Ошибка `Relation already exists` | Повторная попытка применить уже применённую миграцию | Безопасно игнорировать; `IF NOT EXISTS` защищает от дублей |
