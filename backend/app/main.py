from fastapi import FastAPI
from app.routers import auth, users, cars, services, bays, appointments, work_orders

app = FastAPI(title="AutoCare API")

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(cars.router)
app.include_router(services.router)
app.include_router(bays.router)
app.include_router(appointments.router)
app.include_router(work_orders.router)

@app.get("/health")
def health():
    return {"status": "ok"}