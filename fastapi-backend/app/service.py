import polars as pl
from functools import lru_cache

def get_all_flights(data: pl.DataFrame):
    number = data.select("Frequency").sum().to_dicts()[0]["Frequency"]
    km = data.select(pl.col("Flown_km").sum()).to_dicts()[0]["Flown_km"]
    fuel = data.select(pl.col("fuel_conv_tot").sum()).to_dicts()[0]["fuel_conv_tot"]
    emissions = data.select(pl.col("co2_tot").sum()).to_dicts()[0]["co2_tot"]
    electric = data.select(pl.col("co2_tot_electric").sum()).to_dicts()[0]["co2_tot_electric"]
    cost_conventional = data.select(pl.col("cost_conventional").sum()).to_dicts()[0]["cost_conventional"]
    cost_electric = data.select(pl.col("cost_electric").sum()).to_dicts()[0]["cost_electric"]
    return {
        "flight_number" : number,
        "total_km": km,
        "total_fuel": fuel,
        "total_emissions": emissions,
        "electric_emissions": electric,
        "cost_conventional": cost_conventional,
        "cost_electric": cost_electric
    }

def filter_routes(data: pl.DataFrame, distance: int, seats: int):
    routes = data.filter(pl.col("GCD") <= int(distance))
    routes = routes.filter(pl.col("Seats") <= int(seats))
    routes = routes.group_by(pl.col("Dep_apt", "Arr_apt")).agg([
        pl.col("Dep_apt_lat").first(),
        pl.col("Dep_apt_lon").first(),
        pl.col("Arr_apt_lat").first(),
        pl.col("Arr_apt_lon").first(),
        pl.col("Frequency").sum().alias("Number"),
        pl.col("GCD").first(),
        ((pl.col("Seats") * pl.col("Frequency")).sum() / pl.col("Frequency").sum()).alias("Seats"),
        pl.col("Flown_km").sum().alias("Total_flown"),
        pl.col("co2_tot").sum(),
        pl.col("delta_co2_tot").sum()
    ]).select(pl.col(
        "Dep_apt_lat",
        "Dep_apt_lon",
        "Arr_apt_lat",
        "Arr_apt_lon",
        "Dep_apt",
        "Arr_apt",
        "Number",
        "GCD",
        "Seats",
        "Total_flown",
        "co2_tot",
        "delta_co2_tot"
    ))
    return routes

def filter_airports(data: pl.DataFrame, distance: int, seats: int):
    pass
