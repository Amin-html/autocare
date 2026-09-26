from fastapi import FastAPI
from app.routers import auth, users, cars


app = FastAPI(title="AutoCare API")

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(cars.router)

@app.get("/health")
def health():
    return {"status": "ok"}