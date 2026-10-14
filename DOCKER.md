# Запуск AutoCare в Docker

Нужен Docker Desktop (запущенный). Всё поднимается одной командой: Postgres, бэкенд (FastAPI), фронтенд (Next.js).

## Первый запуск (PowerShell, из корня репозитория)

```powershell
$jwt = python -c "import secrets; print(secrets.token_urlsafe(48))"
"POSTGRES_PASSWORD=autocare_local`nJWT_SECRET=$jwt`nSEED_DEMO_DATA=true" | Out-File -Encoding ascii .env
docker compose up --build
```

Первая сборка занимает несколько минут. Бэкенд сам накатит миграции и создаст демо-данные.

## Адреса

| Что | Адрес |
|---|---|
| Приложение | http://localhost:3000 |
| API + Swagger | http://localhost:8000/docs |

## Демо-аккаунты (создаются только на пустой базе)

| Роль | Email | Пароль |
|---|---|---|
| admin | admin@example.com | Admin123! |
| manager | manager@example.com | Manager123! |
| master | master@example.com | Master123! |
| client | client@example.com | Client123! |

## Полезные команды

```powershell
docker compose ps                                  # состояние сервисов
docker compose logs -f backend                     # логи бэкенда
docker compose exec backend python -m pytest -q    # тесты внутри контейнера
docker compose down                                # остановить (данные сохраняются)
docker compose down -v                             # остановить и стереть базу и загрузки
```

## Заметки

- `NEXT_PUBLIC_API_URL` вшивается в фронтенд при сборке. Если меняете адрес API — `docker compose up --build`.
- Загруженные файлы (аватары) лежат в томе `uploads`, база — в томе `pgdata`; при пересборке они сохраняются.
- Реальный `backend/.env` в образ не попадает (`.dockerignore`), секреты задаются через корневой `.env`.
