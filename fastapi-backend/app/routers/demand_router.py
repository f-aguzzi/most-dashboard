import polars as pl
from fastapi import APIRouter

demand_router = APIRouter()

# Caricamento dati
passenger_yearly = pl.LazyFrame(pl.read_excel("evolution_passenger.xlsx"))
freight_yearly = pl.LazyFrame(pl.read_excel("evolution_freight.xlsx"))

freight_names = {
    "Trend": "data",
    "Year": "date",
    "Forecasts": "forecasted",
}

passenger_names = {"Year": "date", "Historical": "data", "Forecasts": "forecasted"}


@demand_router.get("/passenger")
def get_passenger():
    data = passenger_yearly.rename(passenger_names)
    return data.collect().to_dicts()


@demand_router.get("/freight")
def get_freight():
    data = freight_yearly.rename(freight_names)
    return data.collect().to_dicts()
