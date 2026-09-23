# Развёртывание SK Store на сервере с Docker

Подробная инструкция по подготовке, первому запуску, обновлению и устранению типичных проблем.

Англоязычная справка по операциям: [`deployment.md`](./deployment.md).

---

## Содержание

1. [Архитектура production](#1-архитектура-production)
2. [Что понадобится](#2-что-понадобится)
3. [Подготовка сервера (VPS)](#3-подготовка-сервера-vps)
4. [Подготовка приложения на сервере](#4-подготовка-приложения-на-сервере)
5. [Первое развёртывание](#5-первое-развёртывание)
6. [Nginx и HTTPS](#6-nginx-и-https)
7. [Проверка после запуска](#7-проверка-после-запуска)
8. [Обновление приложения после изменений в коде](#8-обновление-приложения-после-изменений-в-коде)
9. [Автоматический деплой через GitHub Actions (опционально)](#9-автоматический-деплой-через-github-actions-опционально)
10. [Резервное копирование и восстановление](#10-резервное-копирование-и-восстановление)
11. [Откат на предыдущую версию](#11-откат-на-предыдущую-версию)
12. [Типичные проблемы и решения](#12-типичные-проблемы-и-решения)
13. [Чек-лист перед публичным запуском](#13-чек-лист-перед-публичным-запуском)

---

## 1. Архитектура production

В production все три сервиса работают в Docker:

```text
Internet
   ↓
Nginx на хосте (:80 / :443)
   ↓
127.0.0.1:3000 → контейнер frontend (Next.js)
   ↓ /api/* (rewrite внутри Next.js)
контейнер backend (NestJS) :3001 — только внутри Docker-сети
   ↓
контейнер postgres :5432 — только внутри Docker-сети + volume postgres_data
```

**Важно:**

- Frontend публикуется **только на localhost** хоста (`127.0.0.1:3000`). Снаружи сайт доступен через Nginx.
- Backend (`3001`) и PostgreSQL (`5432`) **не должны** быть открыты в интернет.
- Данные БД хранятся в Docker volume `postgres_data` и переживают перезапуск контейнеров.

Ключевые файлы в репозитории:

| Файл | Назначение |
| --- | --- |
| `docker-compose.prod.yml` | Production-стек (frontend + backend + postgres) |
| `server/Dockerfile` | Образ API (NestJS) |
| `frontend/Dockerfile` | Образ сайта (Next.js standalone) |
| `.env.production.example` | Шаблон переменных окружения для сервера |
| `deploy/deploy-prod.sh` | Скрипт умного обновления (сборка только изменённых частей) |
| `deploy/nginx/sk-store.conf.example` | Пример конфигурации Nginx |

---

## 2. Что понадобится

### Сервер

- VPS с Ubuntu 22.04 / 24.04 (или аналог)
- Минимум 2 GB RAM (рекомендуется 4 GB для сборки frontend)
- 20+ GB диска
- Доступ по SSH

### На сервере

- Docker Engine
- Docker Compose v2 (`docker compose`, не `docker-compose`)
- Git
- Nginx (reverse proxy + HTTPS)

### Для production с доменом

- Домен с A-записью на IP сервера
- Рабочий SMTP (для писем о заказах)
- Сгенерированные секреты (пароли, JWT)

### Локально (для разработки и CI)

- Node.js 20+ (если собираете и тестируете локально)
- Репозиторий SK Store на GitHub (для автодеплоя)

---

## 3. Подготовка сервера (VPS)

### 3.1. Обновление системы

```bash
sudo apt update && sudo apt upgrade -y
```

### 3.2. Установка Docker

```bash
sudo apt install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "${VERSION_CODENAME}") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

Проверка:

```bash
docker --version
docker compose version
```

### 3.3. Пользователь для деплоя (рекомендуется)

Не работайте постоянно под `root`. Создайте отдельного пользователя:

```bash
sudo adduser deploy
sudo usermod -aG docker deploy
```

Дальнейшие команды Docker можно выполнять от `deploy` (после перелогина или `newgrp docker`).

### 3.4. Файрвол

Откройте только нужные порты:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status
```

**Не открывайте** порты `3000`, `3001`, `5432` наружу.

### 3.5. Установка Nginx

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 3.6. SSH-ключ для автодеплоя (опционально)

На **локальной машине**:

```bash
ssh-keygen -t ed25519 -C "github-actions-sk-store" -f ~/.ssh/sk-store-deploy -N ""
```

На **сервере** (под пользователем `deploy`):

```bash
mkdir -p ~/.ssh && chmod 700 ~/.ssh
# Вставьте содержимое ~/.ssh/sk-store-deploy.pub в authorized_keys:
nano ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

Проверка входа:

```bash
ssh -i ~/.ssh/sk-store-deploy deploy@ВАШ_IP
```

---

## 4. Подготовка приложения на сервере

### 4.1. Клонирование репозитория

```bash
sudo mkdir -p /home/deploy
sudo chown deploy:deploy /home/deploy
su - deploy

git clone https://github.com/ВАШ_АККАУНТ/sk-store.git ~/sk-store
cd ~/sk-store
```

> Путь можно выбрать другой (например `/opt/sk-store`). Главное — использовать один и тот же путь в CI-секрете `DEPLOY_PATH`.

### 4.2. Создание `.env.production`

```bash
cd ~/sk-store
cp .env.production.example .env.production
chmod 600 .env.production
nano .env.production
```

**Обязательно заполните:**

| Переменная | Описание |
| --- | --- |
| `POSTGRES_PASSWORD` | Сильный пароль БД. Генерация: `openssl rand -base64 32` |
| `JWT_SECRET` | Секрет для JWT. Генерация: `openssl rand -base64 48` |
| `NEXT_PUBLIC_SITE_URL` | Публичный URL сайта (с `https://`, без `/` в конце) |
| `CORS_ORIGIN` | Тот же origin, что и `NEXT_PUBLIC_SITE_URL` |
| `ADMIN_PASSWORD` | Пароль админа (мин. 12 символов, **не** `admin123`) |
| `SMTP_HOST`, `MAIL_FROM`, `ORDER_NOTIFICATION_EMAIL` | Почта для уведомлений о заказах |

**Пример для домена:**

```env
NEXT_PUBLIC_SITE_URL=https://shop.example.com
CORS_ORIGIN=https://shop.example.com
COOKIE_SECURE=true
```

**Пример для теста только по IP (без HTTPS, временно):**

```env
NEXT_PUBLIC_SITE_URL=http://130.49.141.216
CORS_ORIGIN=http://130.49.141.216
COOKIE_SECURE=false
```

> Без HTTPS admin login с `COOKIE_SECURE=true` **не будет работать**. Для публичного production всегда используйте HTTPS и `COOKIE_SECURE=true`.

### 4.3. Переменная GIT_COMMIT (для тегов образов)

При сборке и деплое используется текущий коммит Git:

```bash
export GIT_COMMIT="$(git rev-parse HEAD)"
```

Скрипт `deploy/deploy-prod.sh` делает это автоматически.

---

## 5. Первое развёртывание

Все команды — из корня репозитория на сервере:

```bash
cd ~/sk-store
export GIT_COMMIT="$(git rev-parse HEAD)"
COMPOSE="docker compose -f docker-compose.prod.yml --env-file .env.production"
```

### 5.1. Сборка образов

```bash
$COMPOSE build
```

Первый build может занять 10–20 минут (скачивание базовых образов, `npm ci`, сборка Next.js).

### 5.2. Запуск PostgreSQL

```bash
$COMPOSE up -d postgres
```

Дождитесь статуса `healthy`:

```bash
$COMPOSE ps postgres
```

или:

```bash
$COMPOSE logs -f postgres
# Ctrl+C когда видите "database system is ready to accept connections"
```

### 5.3. Миграции базы данных

```bash
$COMPOSE run --rm backend npx prisma migrate deploy
```

Используйте **только** `migrate deploy` в production. **Не используйте** `migrate dev`, `db push`, `migrate reset`.

### 5.4. Первичный seed (только один раз)

Создаёт учётную запись администратора из `ADMIN_USERNAME` / `ADMIN_PASSWORD`:

```bash
$COMPOSE run --rm backend node dist/prisma/seed.js
```

Production seed **отклоняет** пароль `admin123` и пароли короче 12 символов.

> Демо-товары и новости в production **не** создаются — каталог наполняется через админку.

### 5.5. Запуск приложения

```bash
$COMPOSE up -d
```

Проверка статуса:

```bash
$COMPOSE ps
```

Все сервисы (`postgres`, `backend`, `frontend`) должны быть `running`, backend и postgres — `healthy`.

### 5.6. Проверка на localhost (до Nginx)

```bash
curl -s http://127.0.0.1:3000/ | head
curl -s http://127.0.0.1:3000/api/health
```

Ожидается HTTP 200 и JSON со статусом health от API.

### 5.7. Сохранение маркера деплоя (рекомендуется)

Чтобы последующие обновления не пересобирали всё без необходимости:

```bash
git rev-parse HEAD > .deploy-last-commit
```

Файл `.deploy-last-commit` хранится только на сервере (в `.gitignore`).

---

## 6. Nginx и HTTPS

### 6.1. Конфигурация Nginx

Скопируйте пример и отредактируйте домен:

```bash
sudo cp ~/sk-store/deploy/nginx/sk-store.conf.example /etc/nginx/sites-available/sk-store.conf
sudo nano /etc/nginx/sites-available/sk-store.conf
# Замените YOUR_DOMAIN на ваш домен
sudo ln -sf /etc/nginx/sites-available/sk-store.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

Nginx проксирует трафик на `127.0.0.1:3000` (frontend). Backend и postgres снаружи недоступны.

### 6.2. HTTPS через Let's Encrypt

После того как DNS (A-запись) указывает на сервер:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d shop.example.com
```

Убедитесь в `.env.production`:

```env
COOKIE_SECURE=true
NEXT_PUBLIC_SITE_URL=https://shop.example.com
CORS_ORIGIN=https://shop.example.com
```

Если меняли `NEXT_PUBLIC_SITE_URL`, **пересоберите frontend**:

```bash
cd ~/sk-store
export GIT_COMMIT="$(git rev-parse HEAD)"
docker compose -f docker-compose.prod.yml --env-file .env.production build frontend
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --force-recreate --no-build frontend
```

### 6.3. Вариант только HTTP + IP (временный тест)

Если домена и HTTPS ещё нет, используйте упрощённый server-блок (порт 80, `proxy_pass` на `127.0.0.1:3000`). Пример — в `nginx.confix.example` в корне репозитория.

Обязательно:

```env
COOKIE_SECURE=false
NEXT_PUBLIC_SITE_URL=http://ВАШ_IP
CORS_ORIGIN=http://ВАШ_IP
```

После смены URL — rebuild frontend (см. выше).

---

## 7. Проверка после запуска

### 7.1. Публичные страницы

Откройте в браузере (лучше incognito или Ctrl+Shift+R):

- `/` — главная
- `/products` — каталог
- `/news`, `/contacts`, `/cart`
- `/privacy-policy` — юридические страницы

### 7.2. Админка

- `/admin/login` — вход с `ADMIN_USERNAME` / `ADMIN_PASSWORD`
- Создайте тестовый продукт, проверьте отображение на сайте

### 7.3. Заказ и API

```bash
curl -s https://shop.example.com/api/health
```

Создайте тестовый заказ через корзину — сумма должна считаться на сервере.

### 7.4. Логи при ошибках

```bash
cd ~/sk-store
docker compose -f docker-compose.prod.yml logs -f frontend
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f postgres
```

---

## 8. Обновление приложения после изменений в коде

### 8.1. Общий процесс (ручной деплой)

1. Сделайте backup БД (см. [раздел 10](#10-резервное-копирование-и-восстановление)).
2. На сервере получите новый код и запустите скрипт деплоя:

```bash
cd ~/sk-store
git pull --ff-only origin main
bash deploy/deploy-prod.sh
```

Скрипт **сам решает**, что делать:

| Что изменилось в Git | Действие |
| --- | --- |
| `frontend/` | Сборка frontend + пересоздание контейнера frontend |
| `server/` | Сборка backend + `prisma migrate deploy` + пересоздание backend |
| `docker-compose.prod.yml` | Пересоздание контейнеров (без сборки, если код не менялся) |
| Только `docs/`, `.github/` и т.п. | Без сборки и без перезапуска — только обновление маркера |
| Тот же коммит повторно | Выход без действий |

### 8.2. Принудительная полная пересборка

Если подозреваете проблемы с кешем Docker:

```bash
cd ~/sk-store
git pull --ff-only origin main
FORCE_BUILD=1 bash deploy/deploy-prod.sh
```

### 8.3. Обновление только frontend (пример)

Вы изменили UI, меню, стили — затронута папка `frontend/`:

```bash
git pull --ff-only origin main
bash deploy/deploy-prod.sh
# В логе: "Frontend changes detected" → "Build frontend"
```

Backend и migrate **не** запустятся, если `server/` не менялся.

### 8.4. Обновление backend + миграции (пример)

Вы добавили API, изменили Prisma-схему — затронута папка `server/`:

```bash
git pull --ff-only origin main
bash deploy/deploy-prod.sh
# В логе: "Backend changes detected" → build backend → prisma migrate deploy
```

Перед деплоем на production просмотрите новые файлы в `server/prisma/migrations/`.

### 8.5. Изменение переменных в `.env.production`

| Что изменили | Что делать |
| --- | --- |
| `POSTGRES_PASSWORD`, `JWT_SECRET`, SMTP и др. runtime-переменные backend | `docker compose ... up -d --force-recreate backend` |
| `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_IMAGE_REMOTE_HOSTS` | **Rebuild frontend** + recreate frontend |
| `COOKIE_SECURE`, `CORS_ORIGIN` | Recreate backend (и frontend при необходимости) |

Пример после смены публичного URL:

```bash
cd ~/sk-store
nano .env.production
export GIT_COMMIT="$(git rev-parse HEAD)"
docker compose -f docker-compose.prod.yml --env-file .env.production build frontend
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --force-recreate --no-build frontend
```

### 8.6. Проверка версии на сервере

```bash
cd ~/sk-store
git log -1 --oneline
docker compose -f docker-compose.prod.yml --env-file .env.production exec -T frontend node -p 'process.env.GIT_COMMIT'
cat .deploy-last-commit
```

Три значения должны совпадать после успешного деплоя frontend.

### 8.7. Полезные команды на каждый день

**Статус контейнеров:**

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production ps
```

**Перезапуск без пересборки:**

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production restart frontend backend
```

**Остановка (данные БД сохраняются):**

```bash
docker compose -f docker-compose.prod.yml down
```

**Запуск снова:**

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up -d
```

> **Никогда** не выполняйте `docker compose down -v` на production — флаг `-v` **удаляет volume с базой данных**.

---

## 9. Автоматический деплой через GitHub Actions (опционально)

После настройки CI/CD merge в ветку `main` автоматически деплоит на VPS.

### 9.1. Схема

```text
Pull Request → CI (lint, typecheck, test, build)
merge в main → Deploy (SSH → backup → git pull → deploy-prod.sh → smoke test)
```

### 9.2. Секреты в GitHub

Settings → Secrets and variables → Actions:

| Секрет | Пример |
| --- | --- |
| `DEPLOY_HOST` | `130.49.141.216` |
| `DEPLOY_USER` | `deploy` |
| `DEPLOY_PATH` | `/home/deploy/sk-store` |
| `DEPLOY_SSH_KEY_B64` | base64 приватного ключа (рекомендуется) |

Кодирование ключа (macOS):

```bash
base64 < ~/.ssh/sk-store-deploy | tr -d '\n' | pbcopy
```

### 9.3. Ручной запуск с полной пересборкой

GitHub → Actions → Deploy → Run workflow → включить **Force rebuild**.

### 9.4. Ручной деплой как fallback

Если Actions недоступен — те же команды, что в [разделе 8.1](#81-общий-процесс-ручной-деплой).

---

## 10. Резервное копирование и восстановление

### 10.1. Backup PostgreSQL и Media

> **Важно:** backup PostgreSQL **не достаточен** для полного восстановления сайта, если используются загруженные изображения (Phase 30A).

**PostgreSQL:**

```bash
cd ~/sk-store
mkdir -p ~/backups
BACKUP=~/backups/skstore-$(date +%Y%m%d-%H%M%S).dump

docker compose -f docker-compose.prod.yml --env-file .env.production exec -T postgres \
  pg_dump -U skstore_app -d skstore --no-owner --format=custom > "$BACKUP"

ls -lh "$BACKUP"
```

Храните бэкапы **вне** Docker volume (отдельная папка, облако, другой сервер).

**Media files** (Docker volume `media_data` → `/app/public/media` в backend):

```bash
cd ~/sk-store
BACKUP=~/backups/skstore-media-$(date +%Y%m%d-%H%M%S).tar.gz
docker compose -f docker-compose.prod.yml --env-file .env.production exec -T backend \
  tar -czf - -C /app/public/media . > "$BACKUP"
ls -lh "$BACKUP"
```

### 10.2. Восстановление из backup

> Сначала протестируйте на копии БД, не на production.

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production exec -T postgres \
  pg_restore -U skstore_app -d skstore --clean --if-exists < ~/backups/ВАШ_ФАЙЛ.dump
```

---

## 11. Откат на предыдущую версию

1. **Backup БД** (если откатываете код с новыми миграциями).
2. Переключите Git на предыдущий коммит или тег:

```bash
cd ~/sk-store
git fetch --tags
git checkout v1.0.0   # или конкретный commit SHA
```

3. Принудительный деплой этой версии:

```bash
FORCE_BUILD=1 bash deploy/deploy-prod.sh
```

4. Если миграции уже применены и ломают старый код — восстановите БД из backup (раздел 10).

> Prisma-миграции односторонние. Планируйте откат заранее: backup перед каждым деплоем с миграциями.

5. Вернитесь на `main` после исправления:

```bash
git checkout main
git pull --ff-only origin main
```

---

## 12. Типичные проблемы и решения

### 12.1. Сайт не открывается снаружи, но `curl localhost:3000` работает

**Причина:** Nginx не настроен или не запущен; frontend слушает только `127.0.0.1`.

**Решение:**

```bash
sudo nginx -t
sudo systemctl status nginx
curl -I http://127.0.0.1:3000/
```

Проверьте конфиг Nginx и DNS.

---

### 12.2. Admin login не работает (редирект на login, 401)

**Причины:**

- `COOKIE_SECURE=true`, а сайт открыт по HTTP
- Неверный `CORS_ORIGIN` / `NEXT_PUBLIC_SITE_URL`
- Отсутствует `API_INTERNAL_URL` в runtime frontend

**Решение:**

1. Для HTTPS: `COOKIE_SECURE=true`, origin с `https://`
2. Для теста по IP: `COOKIE_SECURE=false`
3. Проверьте:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production exec frontend printenv API_INTERNAL_URL
# Должно быть: http://backend:3001
```

4. Пересоздайте frontend после правок `.env.production`.

---

### 12.3. Deploy прошёл успешно, но UI не изменился

**Причины:**

- Кеш браузера
- Не пересобрался frontend (изменения не в `main` или не на сервере)
- Старый контейнер без recreate

**Решение:**

1. Жёсткое обновление: Ctrl+Shift+R или incognito
2. На сервере:

```bash
cd ~/sk-store
git log -1 --oneline
docker compose -f docker-compose.prod.yml --env-file .env.production exec -T frontend node -p 'process.env.GIT_COMMIT'
cat .deploy-last-commit
```

3. Принудительная пересборка:

```bash
FORCE_BUILD=1 bash deploy/deploy-prod.sh
```

---

### 12.4. Ошибка `Frontend GIT_COMMIT mismatch`

**Причина:** Контейнер frontend не пересоздан после сборки или образ не подтянулся.

**Решение:**

```bash
cd ~/sk-store
export GIT_COMMIT="$(git rev-parse HEAD)"
docker compose -f docker-compose.prod.yml --env-file .env.production build frontend
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --force-recreate --no-build frontend
```

---

### 12.5. `prisma migrate deploy` падает

**Причины:**

- postgres не healthy
- Конфликт миграций
- Неверный `DATABASE_URL` / пароль в `.env.production`

**Решение:**

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production ps postgres
docker compose -f docker-compose.prod.yml --env-file .env.production logs postgres
docker compose -f docker-compose.prod.yml --env-file .env.production run --rm backend npx prisma migrate status
```

---

### 12.6. Seed: «password too short» или «admin123 not allowed»

Production seed требует пароль **≥ 12 символов**, не `admin123`.

```bash
nano .env.production   # исправьте ADMIN_PASSWORD
docker compose -f docker-compose.prod.yml --env-file .env.production run --rm backend node dist/prisma/seed.js
```

---

### 12.7. Контейнер backend в статусе `unhealthy`

**Решение:**

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production logs backend
docker compose -f docker-compose.prod.yml --env-file .env.production exec backend node -e \
  "fetch('http://127.0.0.1:3001/api/health').then(r=>console.log(r.status)).catch(console.error)"
```

Частые причины: БД недоступна, ошибка в `.env.production`, приложение не стартует из-за missing env.

---

### 12.8. Нехватка места на диске / памяти при build

**Решение:**

```bash
docker system df
docker image prune -f
docker builder prune -f
free -h
df -h
```

Frontend build требует ~2 GB RAM. При нехватке памяти добавьте swap или увеличьте VPS.

---

### 12.9. GitHub Actions: `ParsePrivateKey` / SSH не подключается

**Причины:**

- В секрет попал **публичный** ключ вместо приватного
- Ключ обрезан или с лишними кавычками
- Публичный ключ не добавлен в `authorized_keys` на сервере

**Решение:** используйте `DEPLOY_SSH_KEY_B64` (base64 всего приватного файла). Проверьте вход вручную:

```bash
ssh -i ~/.ssh/sk-store-deploy deploy@ВАШ_IP
```

---

### 12.10. Письма о заказах не отправляются

**Решение:**

- Проверьте `SMTP_*` в `.env.production`
- Смотрите логи backend при создании заказа
- Заказ всё равно сохраняется в БД — email может падать отдельно

---

### 12.11. Случайно выполнили `docker compose down -v`

Volume `postgres_data` удалён — **данные БД потеряны**, если не было backup.

**Восстановление:** только из dump (раздел 10). Затем заново migrate + seed.

---

## 13. Чек-лист перед публичным запуском

### Инфраструктура

- [ ] Docker и Compose v2 установлены
- [ ] Пользователь `deploy` в группе `docker`
- [ ] UFW: открыты 22, 80, 443; закрыты 3000, 3001, 5432
- [ ] DNS: A-запись домена → IP сервера

### Конфигурация

- [ ] `.env.production` создан, `chmod 600`
- [ ] Сильные `POSTGRES_PASSWORD`, `JWT_SECRET`, `ADMIN_PASSWORD`
- [ ] `ADMIN_PASSWORD` ≠ `admin123`, длина ≥ 12
- [ ] `NEXT_PUBLIC_SITE_URL` и `CORS_ORIGIN` совпадают с реальным URL
- [ ] `COOKIE_SECURE=true` при HTTPS
- [ ] SMTP настроен и проверен

### Деплой

- [ ] `docker compose build` успешен
- [ ] postgres healthy
- [ ] `prisma migrate deploy` применён
- [ ] seed выполнен (первый запуск)
- [ ] frontend + backend healthy
- [ ] Nginx + Let's Encrypt работают

### Проверка функционала

- [ ] Публичные страницы открываются
- [ ] Admin login работает
- [ ] Создание заказа, сумма с сервера
- [ ] Контактная форма
- [ ] Первый backup БД создан
- [ ] `docker compose restart` — данные на месте

---

## Краткая шпаргалка команд

```bash
# Перейти в проект
cd ~/sk-store
COMPOSE="docker compose -f docker-compose.prod.yml --env-file .env.production"

# Первый запуск
export GIT_COMMIT="$(git rev-parse HEAD)"
$COMPOSE build
$COMPOSE up -d postgres
$COMPOSE run --rm backend npx prisma migrate deploy
$COMPOSE run --rm backend node dist/prisma/seed.js    # один раз
$COMPOSE up -d

# Обновление после git pull
git pull --ff-only origin main
bash deploy/deploy-prod.sh

# Полная пересборка
FORCE_BUILD=1 bash deploy/deploy-prod.sh

# Логи
$COMPOSE logs -f frontend
$COMPOSE logs -f backend

# Backup
$COMPOSE exec -T postgres pg_dump -U skstore_app -d skstore --no-owner --format=custom > ~/backups/skstore.dump
```

---

*Документ актуален для SK Store с production Docker (`docker-compose.prod.yml`, `deploy/deploy-prod.sh`). При изменении архитектуры обновите также [`deployment.md`](./deployment.md).*
