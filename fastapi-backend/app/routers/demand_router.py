import polars as pl
from fastapi import APIRouter

demand_router = APIRouter()

# Caricamento dati
passenger_monthly = pl.LazyFrame(pl.read_excel("air_passenger_monthly_2035.xlsx"))
passenger_yearly = pl.LazyFrame(pl.read_excel("air_passenger_yearly_2035.xlsx"))
freight_montly = pl.LazyFrame(pl.read_excel("freight_monthly_data 2035.xlsx"))
freight_yearly = pl.LazyFrame(pl.read_excel("freight_yearly 2035.xlsx"))
