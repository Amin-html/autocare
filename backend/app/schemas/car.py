from pydantic import BaseModel, Field

class CarCreate(BaseModel):
    make: str
    model: str
    year: int = Field(ge=1900, le=2100)
    plate: str
    mileage: int = Field(ge=0, default=0)

class CarUpdate(BaseModel):
    make: str | None = None
    model: str | None = None
    year: int | None = Field(default=None, ge=1900, le=2100)
    plate: str | None = None
    mileage: int | None = Field(default=None, ge=0)

class CarOut(BaseModel):
    id: int
    owner_id: int
    make: str
    model: str
    year: int
    plate: str
    mileage: int

    class Config:
        from_attributes = True