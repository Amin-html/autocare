from tests.conftest import create_user, auth_headers
from app.models.user import UserRole
from app.models.appointment import Appointment

def test_client_cannot_access_other_client_car(client, db_session):
    create_user(db_session, "alice@example.com")
    create_user(db_session, "bob@example.com")

    headers_alice = auth_headers(client, "alice@example.com")
    headers_bob = auth_headers(client, "bob@example.com")

    car = client.post(
        "/cars",
        json={"make": "Toyota", "model": "Camry", "year": 2022, "plate": "A123BC", "mileage": 1000},
        headers=headers_alice,
    ).json()

    resp = client.get(f"/cars/{car['id']}", headers=headers_bob)
    assert resp.status_code == 403

def test_only_admin_can_create_service(client, db_session):
    create_user(db_session, "client@example.com", role=UserRole.client)
    headers = auth_headers(client, "client@example.com")

    resp = client.post(
        "/services",
        json={"name": "Замена масла", "base_price": "1500.00", "duration_minutes": 30},
        headers=headers,
    )
    assert resp.status_code == 403

def test_full_appointment_flow(client, db_session):
    admin = create_user(db_session, "admin@example.com", role=UserRole.admin)
    client_user = create_user(db_session, "client@example.com")
    master = create_user(db_session, "master@example.com", role=UserRole.master)

    admin_headers = auth_headers(client, "admin@example.com")
    client_headers = auth_headers(client, "client@example.com")

    bay = client.post("/bays", json={"name": "Пост 1"}, headers=admin_headers).json()
    service = client.post(
        "/services",
        json={"name": "Замена масла", "base_price": "1500.00", "duration_minutes": 30},
        headers=admin_headers,
    ).json()
    car = client.post(
        "/cars",
        json={"make": "Toyota", "model": "Camry", "year": 2022, "plate": "A123BC", "mileage": 1000},
        headers=client_headers,
    ).json()

    appt = client.post(
        "/appointments",
        json={
            "car_id": car["id"],
            "service_id": service["id"],
            "bay_id": bay["id"],
            "start_at": "2027-01-01T10:00:00Z",
        },
        headers=client_headers,
    ).json()
    assert appt["status"] == "pending"

    confirm = client.post(
        f"/appointments/{appt['id']}/confirm?master_id={master.id}",
        headers=admin_headers,
    )
    assert confirm.status_code == 200
    assert confirm.json()["status"] == "confirmed"

def test_cannot_start_appointment_that_is_still_pending(client, db_session):
    admin = create_user(db_session, "admin@example.com", role=UserRole.admin)
    client_user = create_user(db_session, "client@example.com")
    master = create_user(db_session, "master@example.com", role=UserRole.master)

    admin_headers = auth_headers(client, "admin@example.com")
    client_headers = auth_headers(client, "client@example.com")
    master_headers = auth_headers(client, "master@example.com")

    bay = client.post("/bays", json={"name": "Пост 1"}, headers=admin_headers).json()
    service = client.post(
        "/services",
        json={"name": "Замена масла", "base_price": "1500.00", "duration_minutes": 30},
        headers=admin_headers,
    ).json()
    car = client.post(
        "/cars",
        json={"make": "Toyota", "model": "Camry", "year": 2022, "plate": "A123BC", "mileage": 1000},
        headers=client_headers,
    ).json()
    appt = client.post(
        "/appointments",
        json={"car_id": car["id"], "service_id": service["id"], "bay_id": bay["id"], "start_at": "2027-01-01T10:00:00Z"},
        headers=client_headers,
    ).json()

    db_appt = db_session.query(Appointment).filter(Appointment.id == appt["id"]).first()
    db_appt.master_id = master.id
    db_session.commit()

    resp = client.post(f"/appointments/{appt['id']}/start", headers=master_headers)
    assert resp.status_code == 409

def test_cannot_double_book_same_bay(client, db_session):
    admin = create_user(db_session, "admin@example.com", role=UserRole.admin)
    client1 = create_user(db_session, "client1@example.com")
    client2 = create_user(db_session, "client2@example.com")

    admin_headers = auth_headers(client, "admin@example.com")
    headers1 = auth_headers(client, "client1@example.com")
    headers2 = auth_headers(client, "client2@example.com")

    bay = client.post("/bays", json={"name": "Пост 1"}, headers=admin_headers).json()
    service = client.post(
        "/services",
        json={"name": "Замена масла", "base_price": "1500.00", "duration_minutes": 30},
        headers=admin_headers,
    ).json()
    car1 = client.post(
        "/cars",
        json={"make": "Toyota", "model": "Camry", "year": 2022, "plate": "A123BC", "mileage": 1000},
        headers=headers1,
    ).json()
    car2 = client.post(
        "/cars",
        json={"make": "Honda", "model": "Civic", "year": 2021, "plate": "B456CD", "mileage": 500},
        headers=headers2,
    ).json()

    resp1 = client.post(
        "/appointments",
        json={"car_id": car1["id"], "service_id": service["id"], "bay_id": bay["id"], "start_at": "2027-01-01T10:00:00Z"},
        headers=headers1,
    )
    assert resp1.status_code == 201

    resp2 = client.post(
        "/appointments",
        json={"car_id": car2["id"], "service_id": service["id"], "bay_id": bay["id"], "start_at": "2027-01-01T10:15:00Z"},
        headers=headers2,
    )
    assert resp2.status_code == 409