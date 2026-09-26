# AutoCare — журнал разработки

## Стек

- **Backend:** FastAPI + SQLAlchemy + Alembic
- **База данных:** PostgreSQL (Neon, serverless)
- **Frontend:** Next.js (TypeScript) — пока не начат
- **Инфраструктура:** Docker Compose (локально), Render (backend), Vercel (frontend), Neon (БД)
- **Auth:** JWT (python-jose) + bcrypt (passlib)

## Структура backend

```
backend/
├── alembic/                  # миграции
│   ├── env.py                # настроен на app.models + DATABASE_URL из .env
│   └── versions/
├── app/
│   ├── core/
│   │   ├── config.py         # pydantic-settings, читает .env
│   │   ├── security.py       # хэш паролей, создание/проверка JWT
│   │   └── deps.py           # get_current_user, require_role(*roles)
│   ├── models/                # SQLAlchemy-модели
│   │   ├── user.py            # роли: client, manager, master, admin
│   │   ├── car.py
│   │   ├── service.py
│   │   ├── bay.py
│   │   ├── appointment.py     # статусы: pending → confirmed → in_progress → completed / cancelled
│   │   ├── work_order.py      # статусы: open, closed
│   │   └── work_item.py
│   ├── schemas/                # Pydantic-схемы (Create/Out для каждой модели)
│   ├── routers/
│   │   ├── auth.py             # /auth/register, /auth/login
│   │   ├── users.py            # /users/me
│   │   ├── cars.py             # CRUD гаража клиента
│   │   ├── services.py         # каталог услуг (создание — только admin)
│   │   ├── bays.py             # посты (создание — только admin)
│   │   ├── appointments.py     # запись, подтверждение, старт, отмена
│   │   └── work_orders.py      # заказ-наряд, позиции работ, закрытие
│   ├── database.py             # engine, SessionLocal, get_db
│   └── main.py
└── tests/
    ├── conftest.py              # тестовая БД (SQLite in-memory, StaticPool)
    └── test_auth_and_permissions.py
```

## Модель данных (7 таблиц + alembic_version)

- **User** — email, hashed_password, full_name, role
- **Car** — owner_id (FK), make, model, year, plate (unique), mileage
- **Service** — name, base_price, duration_minutes
- **Bay** — name, is_active
- **Appointment** — client_id, car_id, service_id, bay_id, master_id, start_at, end_at, status, complaint
- **WorkOrder** — appointment_id (unique), mileage, status, total
- **WorkItem** — order_id, title, quantity, unit_price

Роли назначаются только вручную/администратором — регистрация всегда создаёт `client` (по ТЗ).

## Реализованная бизнес-логика

### Auth
- Регистрация → всегда роль `client`
- Логин → JWT (`sub` = user id, срок жизни настраивается)
- `get_current_user` — декодирует токен, подгружает пользователя из БД (роль всегда актуальна)
- `require_role(*roles)` — зависимость для ограничения доступа по ролям

### Cars (гараж клиента)
- Клиент видит и создаёт только свои автомобили
- Доступ к чужому автомобилю по прямому ID → `403`
- Уникальность госномера на уровне БД и проверки

### Services / Bays (справочники)
- Просмотр открыт всем авторизованным
- Создание — только `admin` (`require_role`)

### Appointments (записи)
- Клиент может записать только свой автомобиль (`403` при попытке чужого)
- Проверка пересечения слотов на одном посту — атомарно, `409` при конфликте
- Переходы статусов проверяются на сервере:
  - `pending → confirmed` (только manager/admin, через `/confirm`)
  - `confirmed → in_progress` (только назначенный master или admin, через `/start`)
  - `pending/confirmed → cancelled` (клиент или manager/admin, через `/cancel`)
- Попытка недопустимого перехода (например, начать работу над `pending` записью) → `409`
- Прошедшая дата отклоняется (`400`)

### WorkOrder / WorkItem (заказ-наряд)
- Создаётся только для записи в статусе `in_progress`, только назначенным мастером/админом
- При создании фиксируется пробег — не может быть меньше последнего сохранённого значения (`400` иначе)
- Итог (`total`) всегда пересчитывается из суммы позиций в БД (не принимается с клиента)
- Закрытый заказ (`status: closed`) неизменяем — попытка добавить позицию → `409`
- Закрытие невозможно без хотя бы одной позиции работ
- При закрытии appointment переходит в `completed`

## Автотесты (5/5 проходят)

`backend/tests/test_auth_and_permissions.py`, запуск: `pytest -v`

1. `test_client_cannot_access_other_client_car` — **права доступа**: клиент не видит чужой автомобиль (`403`)
2. `test_only_admin_can_create_service` — **валидация прав**: обычный клиент не может создать услугу (`403`)
3. `test_full_appointment_flow` — **основной сценарий**: запись → подтверждение → статус меняется корректно
4. `test_cannot_start_appointment_that_is_still_pending` — **запрещённый переход статуса**: нельзя начать работу над неподтверждённой записью (`409`)
5. `test_cannot_double_book_same_bay` — **конкурентный доступ**: пересекающиеся записи на одном посту запрещены (`409`), на разных постах — разрешены

Тестовая БД — SQLite in-memory с `StaticPool` (одно соединение на тест, чтобы таблицы были видны во всех запросах в рамках одного теста).

## Известные технические детали / договорённости

- `.env` содержит `DATABASE_URL` (Neon) и `JWT_SECRET` (сгенерирован через `secrets.token_urlsafe(32)`) — в `.gitignore`
- Проверка пересечения слотов в проде использует `with_for_update()` (блокировка строк в транзакции) — для атомарности при конкурентных запросах; в тестах на SQLite не используется (SQLite не поддерживает)
- Время записи (`start_at`) требует явного указания часового пояса (ISO с `Z` или offset), иначе `400`

## Что сделано — хронология

1. Выбор темы: **AutoCare** (запись и учёт работ автосервиса)
2. Скаффолдинг репозитория: backend (FastAPI) + frontend (заготовка Next.js) + Docker Compose
3. Настройка Alembic, подключение к Neon, первая миграция (7 таблиц)
4. Auth: регистрация, логин, JWT, проверка прав по ролям
5. Гараж клиента (cars) — CRUD с проверкой владения
6. Справочники (services, bays) — доступ по ролям
7. Appointments — создание записи с атомарной проверкой пересечения слотов, переходы статусов
8. WorkOrder/WorkItem — заказ-наряд, позиции работ, пересчёт итога, закрытие (найден и исправлен баг двойного подсчёта суммы)
9. 5 обязательных автотестов — настроены и проходят

## Что осталось

- [ ] Frontend (Next.js): страницы "Мой гараж", "Запись", "Мои записи", "Диспетчерская", "Заказ-наряд"
- [ ] Роут истории автомобиля для клиента
- [ ] Роут "диспетчерская" для менеджера (список записей по датам/постам)
- [ ] Демо-данные: команда наполнения (2 поста, 6 услуг, 5 авто, 12 заказов)
- [ ] README с инструкцией запуска, ER-диаграммой, тестовыми аккаунтами
- [ ] Пагинация и поиск в списках
- [ ] Страницы/обработка 403/404 на фронтенде
- [ ] Деплой: backend → Render, frontend → Vercel
