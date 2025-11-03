import polars as pl
from fastapi import APIRouter

demand_router = APIRouter()

# Caricamento dati
passenger_monthly = pl.LazyFrame(pl.read_excel("air_passenger_monthly_2035.xlsx"))
passenger_yearly = pl.LazyFrame(pl.read_excel("air_passenger_yearly_2035.xlsx"))
freight_monthly = pl.LazyFrame(pl.read_excel("freight_monthly_data 2035.xlsx"))
freight_yearly = pl.LazyFrame(pl.read_excel("freight_yearly 2035.xlsx"))

base_names = {
    "Forecasted": "forecasted",
    "80%_lower": "eighty_lower",
    "80%_upper": "eighty_upper",
    "95%_lower": "ninetyfive_lower",
    "95%_upper": "ninetyfive_upper",
}

freight_names = {"Freight": "data"}

passenger_names = {"Passenger": "data"}

monthly_names = {
    "Date": "date",
    "Predicted": "predicted",
} | base_names

yearly_names = {
    "Year": "date",
} | base_names


@demand_router.get("/passenger")
def get_passenger(timeframe: str):
    if timeframe == "monthly":
        data = passenger_monthly.rename(monthly_names | passenger_names)
        return data.collect().to_dicts()
    else:
        data = passenger_yearly.rename(yearly_names | passenger_names)
        return data.collect().to_dicts()


@demand_router.get("/freight")
def get_freight(timeframe: str):
    if timeframe == "monthly":
        data = freight_monthly.rename(monthly_names | freight_names)
        return data.collect().to_dicts()
    else:
        data = freight_yearly.rename(yearly_names | freight_names)
        return data.collect().to_dicts()
