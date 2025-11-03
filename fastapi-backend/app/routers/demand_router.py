import polars as pl
from fastapi import APIRouter

demand_router = APIRouter()

# Caricamento dati
passenger_monthly = pl.read_excel("air_passenger_monthly_2035.xlsx")
passenger_yearly = pl.read_excel("air_passenger_yearly_2035.xlsx")
freight_monthly = pl.read_excel("freight_monthly_data 2035.xlsx")
freight_yearly = pl.read_excel("freight_yearly 2035.xlsx")


@demand_router.get("/passenger")
def get_passenger(timeframe: str):
    if timeframe == "monthly":
        return passenger_monthly.to_dicts()
    else:
        return passenger_yearly.to_dicts()


@demand_router.get("/freight")
def get_freight(timeframe: str):
    if timeframe == "monthly":
        return freight_monthly.to_dicts()
    else:
        return freight_yearly.to_dicts()
