from pydantic import BaseModel

class BayCreate(BaseModel):
    name: str
    is_active: bool = True

class BayUpdate(BaseModel):
    name: str | None = None
    is_active: bool | None = None

class BayOut(BaseModel):
    id: int
    name: str
    is_active: bool

    class Config:
        from_attributes = True