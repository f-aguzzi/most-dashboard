import polars as pl
from functools import lru_cache

def get_all_flights(data: pl.DataFrame):
    number = data.select("Airline").count().to_dicts()[0]["Airline"]
    km = data.select(pl.col("Flown_km").sum()).to_dicts()[0]["Flown_km"]
    fuel = data.select(pl.col("fuel_conv_tot").sum()).to_dicts()[0]["fuel_conv_tot"]
    emissions = data.select(pl.col("co2_tot").sum()).to_dicts()[0]["co2_tot"]
    electric = data.select(pl.col("co2_tot_electric").sum()).to_dicts()[0]["co2_tot_electric"]
    return {
        "flight_number" : number,
        "total_km": km,
        "total_fuel": fuel,
        "total_emissions": emissions,
        "electric_emissions": electric
    }

def filter_routes(data: pl.DataFrame, distance: int, seats: int):
    routes = data.filter(pl.col("GCD") <= int(distance))
    routes = routes.filter(pl.col("Seats") <= int(seats))
    routes = routes.group_by(pl.col("Dep_apt", "Arr_apt")).agg([
        pl.col("Dep_apt_lat").first(),
        pl.col("Dep_apt_lon").first(),
        pl.col("Arr_apt_lat").first(),
        pl.col("Arr_apt_lon").first()
    ]).select(pl.col(
        "Dep_apt_lat",
        "Dep_apt_lon",
        "Arr_apt_lat",
        "Arr_apt_lon",
        "Dep_apt",
        "Arr_apt"
    ))
    return routes

def filter_airports(data: pl.DataFrame, distance: int, seats: int):
    pass
