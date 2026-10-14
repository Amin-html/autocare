"""Демо-данные для показа проекта.

Запуск: python -m scripts.seed
Идемпотентно: если демо-админ уже существует, ничего не делает.
В Docker запускается автоматически при SEED_DEMO_DATA=true.
"""
from datetime import datetime, timedelta, timezone
from decimal import Decimal

from app.database import SessionLocal
from app.core.security import hash_password
from app.models import User, Car, Service, Bay, Appointment, WorkOrder, WorkItem
from app.models.user import UserRole
from app.models.appointment import AppointmentStatus
from app.models.work_order import WorkOrderStatus

DEMO_USERS = [
    ("admin@example.com", "Admin Demo", UserRole.admin, "Admin123!"),
    ("manager@example.com", "Manager Demo", UserRole.manager, "Manager123!"),
    ("master@example.com", "Master Demo", UserRole.master, "Master123!"),
    ("client@example.com", "Client Demo", UserRole.client, "Client123!"),
]


def seed(db) -> bool:
    if db.query(User).filter(User.email == DEMO_USERS[0][0]).first():
        print("seed: демо-данные уже есть, пропускаю")
        return False

    users = {}
    for email, name, role, password in DEMO_USERS:
        user = User(email=email, full_name=name, role=role, hashed_password=hash_password(password))
        db.add(user)
        users[role] = user

    services = [
        Service(name="Замена масла", base_price=Decimal("2000"), duration_minutes=30),
        Service(name="Комплексная мойка", base_price=Decimal("1200"), duration_minutes=45),
        Service(name="Замена тормозных колодок", base_price=Decimal("1500"), duration_minutes=30),
        Service(name="Шиномонтаж", base_price=Decimal("1500"), duration_minutes=30),
    ]
    bays = [
        Bay(name="Бокс №1 (Подъемник)"),
        Bay(name="Бокс №2 (Диагностика)"),
        Bay(name="Бокс №3 (Шиномонтаж)"),
    ]
    db.add_all(services + bays)
    db.flush()

    client = users[UserRole.client]
    master = users[UserRole.master]

    bmw = Car(owner_id=client.id, make="BMW", model="F90 M5", year=2024, plate="777AAA01", mileage=24500)
    camry = Car(owner_id=client.id, make="Toyota", model="Camry", year=2019, plate="A123BC", mileage=16000)
    db.add_all([bmw, camry])
    db.flush()

    now = datetime.now(timezone.utc).replace(minute=0, second=0, microsecond=0)

    def appt(car, service, bay, start, status, complaint, with_master=True):
        a = Appointment(
            client_id=client.id,
            car_id=car.id,
            service_id=service.id,
            bay_id=bay.id,
            master_id=master.id if with_master else None,
            start_at=start,
            end_at=start + timedelta(minutes=service.duration_minutes),
            status=status,
            complaint=complaint,
        )
        db.add(a)
        db.flush()
        return a

    # Завершённая запись с закрытым заказ-нарядом (для истории обслуживания)
    done = appt(bmw, services[0], bays[0], now - timedelta(days=3), AppointmentStatus.completed,
                "Плановая замена масла")
    order = WorkOrder(appointment_id=done.id, mileage=24500, status=WorkOrderStatus.closed, total=Decimal("2650"))
    db.add(order)
    db.flush()
    db.add_all([
        WorkItem(order_id=order.id, title="Моторное масло 5W-40", quantity=1, unit_price=Decimal("1800")),
        WorkItem(order_id=order.id, title="Масляный фильтр", quantity=1, unit_price=Decimal("350")),
        WorkItem(order_id=order.id, title="Работа мастера", quantity=1, unit_price=Decimal("500")),
    ])

    # Запись в работе прямо сейчас (красный индикатор в диспетчерской)
    appt(camry, services[2], bays[1], now - timedelta(minutes=15), AppointmentStatus.in_progress,
         "Скрип при торможении")

    # Подтверждённая запись на сегодня (мастер увидит её в «Up next»)
    appt(bmw, services[1], bays[0], now + timedelta(hours=2), AppointmentStatus.confirmed,
         "Помыть перед выставкой")

    # Ожидает подтверждения (менеджер подтвердит и назначит мастера)
    appt(camry, services[3], bays[2], now + timedelta(days=1), AppointmentStatus.pending,
         "Сезонная замена шин", with_master=False)

    # Отменённая
    appt(bmw, services[1], bays[2], now - timedelta(days=1), AppointmentStatus.cancelled,
         "Не успеваю", with_master=False)

    db.commit()
    print("seed: готово. Демо-аккаунты:")
    for email, _name, role, password in DEMO_USERS:
        print(f"  {role.value:8} {email}  /  {password}")
    return True


if __name__ == "__main__":
    session = SessionLocal()
    try:
        seed(session)
    finally:
        session.close()
