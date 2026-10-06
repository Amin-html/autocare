import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.routers import auth, users, cars, services, bays, appointments, work_orders

app = FastAPI(title="AutoCare API")

os.makedirs("uploads/avatars", exist_ok=True)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # адрес frontend в dev-режиме
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

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