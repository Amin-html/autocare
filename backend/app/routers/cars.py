from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.deps import get_current_user, require_role
from app.core.uploads import delete_upload, save_image
from app.models.user import User, UserRole
from app.models.car import Car
from app.models.appointment import Appointment
from app.schemas.car import CarCreate, CarUpdate, CarOut

router = APIRouter(prefix="/cars", tags=["cars"])


def _check_owner_or_admin(car: Car, current_user: User):
    if car.owner_id != current_user.id and current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Нет доступа к этому автомобилю")


def _get_car_or_404(db: Session, car_id: int) -> Car:
    car = db.query(Car).filter(Car.id == car_id).first()
    if not car:
        raise HTTPException(status_code=404, detail="Автомобиль не найден")
    return car


@router.get("", response_model=list[CarOut])
def list_my_cars(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(Car).filter(Car.owner_id == current_user.id).all()


@router.get("/all", response_model=list[CarOut])
def list_all_cars(
    db: Session = Depends(get_db),
    _staff=Depends(require_role(UserRole.manager, UserRole.master, UserRole.admin)),
):
    return db.query(Car).all()


@router.post("", response_model=CarOut, status_code=status.HTTP_201_CREATED)
def add_car(
    car_in: CarCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    existing = db.query(Car).filter(Car.plate == car_in.plate).first()
    if existing:
        raise HTTPException(status_code=400, detail="Автомобиль с таким госномером уже зарегистрирован")

    car = Car(owner_id=current_user.id, **car_in.model_dump())
    db.add(car)
    db.commit()
    db.refresh(car)
    return car


@router.get("/{car_id}", response_model=CarOut)
def get_car(
    car_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    car = _get_car_or_404(db, car_id)
    _check_owner_or_admin(car, current_user)
    return car


@router.patch("/{car_id}", response_model=CarOut)
def update_car(
    car_id: int,
    data: CarUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    car = _get_car_or_404(db, car_id)
    _check_owner_or_admin(car, current_user)

    updates = data.model_dump(exclude_unset=True)

    if "plate" in updates and updates["plate"] != car.plate:
        clash = db.query(Car).filter(Car.plate == updates["plate"], Car.id != car_id).first()
        if clash:
            raise HTTPException(status_code=400, detail="Автомобиль с таким госномером уже зарегистрирован")

    for field, value in updates.items():
        setattr(car, field, value)

    db.commit()
    db.refresh(car)
    return car


@router.post("/{car_id}/photo", response_model=CarOut)
async def upload_car_photo(
    car_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    car = _get_car_or_404(db, car_id)
    _check_owner_or_admin(car, current_user)

    new_url = await save_image(file, "cars")
    old_url = car.photo_url
    car.photo_url = new_url
    db.commit()
    db.refresh(car)
    delete_upload(old_url)
    return car


@router.delete("/{car_id}/photo", response_model=CarOut)
def delete_car_photo(
    car_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    car = _get_car_or_404(db, car_id)
    _check_owner_or_admin(car, current_user)

    old_url = car.photo_url
    car.photo_url = None
    db.commit()
    db.refresh(car)
    delete_upload(old_url)
    return car


@router.delete("/{car_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_car(
    car_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    car = _get_car_or_404(db, car_id)
    _check_owner_or_admin(car, current_user)

    has_history = db.query(Appointment).filter(Appointment.car_id == car_id).first()
    if has_history:
        raise HTTPException(
            status_code=409,
            detail="Нельзя удалить автомобиль с историей записей на сервис",
        )

    old_url = car.photo_url
    db.delete(car)
    db.commit()
    delete_upload(old_url)