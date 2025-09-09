import polars as pl

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
