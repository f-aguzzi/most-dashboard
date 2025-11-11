import polars as pl
from fastapi import APIRouter

demand_router = APIRouter()

# Caricamento dati
passenger_yearly = pl.LazyFrame(pl.read_excel("evolution.xlsx"))
freight_yearly = pl.LazyFrame(pl.read_excel("freight_yearly 2035.xlsx"))

freight_names = {
    "Freight": "data",
    "Year": "date",
    "Forecasted": "forecasted",
    "80%_lower": "eighty_lower",
    "80%_upper": "eighty_upper",
    "95%_lower": "ninetyfive_lower",
    "95%_upper": "ninetyfive_upper",
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
