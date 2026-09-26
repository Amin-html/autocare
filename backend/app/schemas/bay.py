from pydantic import BaseModel

class BayCreate(BaseModel):
    name: str
    is_active: bool = True


class BayOut(BaseModel):
    id: int
    name: str
    is_active: bool

    class Config:
        from_attributes = True