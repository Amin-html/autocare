from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.deps import get_current_user, require_role
from app.models.user import User, UserRole
from app.models.car import Car
from app.models.appointment import Appointment
from app.schemas.car import CarCreate, CarUpdate, CarOut

router = APIRouter(prefix="/cars", tags=["cars"])


def _check_owner_or_admin(car: Car, current_user: User):
    if car.owner_id != current_user.id and current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Нет доступа к этому автомобилю")


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
    car = db.query(Car).filter(Car.id == car_id).first()
    if not car:
        raise HTTPException(status_code=404, detail="Автомобиль не найден")
    _check_owner_or_admin(car, current_user)
    return car


@router.patch("/{car_id}", response_model=CarOut)
def update_car(
    car_id: int,
    data: CarUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    car = db.query(Car).filter(Car.id == car_id).first()
    if not car:
        raise HTTPException(status_code=404, detail="Автомобиль не найден")
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


@router.delete("/{car_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_car(
    car_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    car = db.query(Car).filter(Car.id == car_id).first()
    if not car:
        raise HTTPException(status_code=404, detail="Автомобиль не найден")
    _check_owner_or_admin(car, current_user)

    has_history = db.query(Appointment).filter(Appointment.car_id == car_id).first()
    if has_history:
        raise HTTPException(
            status_code=409,
            detail="Нельзя удалить автомобиль с историей записей на сервис",
        )

    db.delete(car)
    db.commit()