"""
Modulo principale del backend della Most-Dashboard.
"""

from sys import prefix
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.electric_router import electric_router
from app.routers.emissions_router import emissions_router

app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://localhost:4173",
    "https://most-dashboard.federico-aguzzi.workers.dev",
    "https://most-dashboard-production.federico-aguzzi.workers.dev",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def health_check():
    return {"status": "healthy"}


app.include_router(electric_router, prefix="/electric")
app.include_router(emissions_router, prefix="/emissions")
