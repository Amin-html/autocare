from app.models.stored_file import StoredFile
from tests.conftest import auth_headers, create_user

PNG = b"\x89PNG\r\n\x1a\n" + b"fake-png-body" * 10
PNG2 = b"\x89PNG\r\n\x1a\n" + b"another-body" * 10
CAR = {"make": "BMW", "model": "M5", "year": 2024, "plate": "777AAA01", "mileage": 100}


def _png(data=PNG):
    return {"file": ("photo.png", data, "image/png")}


def _make_car(client, db_session, email="alice@example.com"):
    create_user(db_session, email)
    headers = auth_headers(client, email)
    car = client.post("/cars", json=CAR, headers=headers).json()
    return car, headers


def test_car_photo_is_stored_in_db_and_served_publicly(client, db_session):
    car, headers = _make_car(client, db_session)

    resp = client.post(f"/cars/{car['id']}/photo", files=_png(), headers=headers)
    assert resp.status_code == 200
    url = resp.json()["photo_url"]
    assert url.startswith("/files/")
    assert db_session.query(StoredFile).count() == 1

    # без токена, как <img>
    img = client.get(url)
    assert img.status_code == 200
    assert img.content == PNG
    assert img.headers["content-type"] == "image/png"
    assert "immutable" in img.headers["cache-control"]

    cached = client.get(url, headers={"If-None-Match": img.headers["etag"]})
    assert cached.status_code == 304


def test_replacing_photo_removes_old_file(client, db_session):
    car, headers = _make_car(client, db_session)

    first = client.post(f"/cars/{car['id']}/photo", files=_png(PNG), headers=headers).json()["photo_url"]
    second = client.post(f"/cars/{car['id']}/photo", files=_png(PNG2), headers=headers).json()["photo_url"]

    assert first != second
    assert client.get(first).status_code == 404
    assert client.get(second).content == PNG2
    assert db_session.query(StoredFile).count() == 1


def test_delete_photo_and_delete_car_remove_file(client, db_session):
    car, headers = _make_car(client, db_session)
    url = client.post(f"/cars/{car['id']}/photo", files=_png(), headers=headers).json()["photo_url"]

    resp = client.delete(f"/cars/{car['id']}/photo", headers=headers)
    assert resp.status_code == 200 and resp.json()["photo_url"] is None
    assert client.get(url).status_code == 404

    client.post(f"/cars/{car['id']}/photo", files=_png(), headers=headers)
    assert db_session.query(StoredFile).count() == 1
    assert client.delete(f"/cars/{car['id']}", headers=headers).status_code == 204
    assert db_session.query(StoredFile).count() == 0


def test_rejects_non_images(client, db_session):
    car, headers = _make_car(client, db_session)

    fake = client.post(
        f"/cars/{car['id']}/photo",
        files={"file": ("x.png", b"definitely not an image", "image/png")},
        headers=headers,
    )
    assert fake.status_code == 400

    wrong_type = client.post(
        f"/cars/{car['id']}/photo",
        files={"file": ("x.txt", b"hello", "text/plain")},
        headers=headers,
    )
    assert wrong_type.status_code == 400
    assert db_session.query(StoredFile).count() == 0


def test_other_client_cannot_upload_to_foreign_car(client, db_session):
    car, _ = _make_car(client, db_session, "alice@example.com")
    create_user(db_session, "bob@example.com")
    bob = auth_headers(client, "bob@example.com")

    resp = client.post(f"/cars/{car['id']}/photo", files=_png(), headers=bob)
    assert resp.status_code == 403
    assert db_session.query(StoredFile).count() == 0


def test_avatar_upload_replaces_previous(client, db_session):
    create_user(db_session, "alice@example.com")
    headers = auth_headers(client, "alice@example.com")

    first = client.post("/users/me/avatar", files=_png(PNG), headers=headers).json()["avatar_url"]
    second = client.post("/users/me/avatar", files=_png(PNG2), headers=headers).json()["avatar_url"]

    assert first.startswith("/files/") and second.startswith("/files/") and first != second
    assert client.get(first).status_code == 404
    assert client.get(second).content == PNG2


def test_unknown_or_malformed_file_id_is_404(client):
    assert client.get("/files/" + "0" * 32).status_code == 404
    assert client.get("/files/not-a-valid-id").status_code == 404
