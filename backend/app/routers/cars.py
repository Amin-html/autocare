from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.deps import get_current_user, require_role
from app.models.user import User, UserRole
from app.models.car import Car
from app.schemas.car import CarCreate, CarOut

router = APIRouter(prefix="/cars", tags=["cars"])

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
    # владелец видит только своё; менеджер/мастер увидят через отдельный роут диспетчерской
    if car.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Нет доступа к этому автомобилю")
    return car