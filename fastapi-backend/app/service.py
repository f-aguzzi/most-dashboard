"""
Modulo di servizio per il backend della Most-Dashboard.
"""
import polars as pl

def get_all_flights(data: pl.LazyFrame) -> pl.LazyFrame:
    """
    Aggrega le statistiche dei voli sotto forma di LazyFrame ottimizzabile
    """
    # Perform all aggregations in a single query for efficiency
    return data.select([
        pl.col("Frequency").sum().alias("flight_number"),
        pl.col("Flown_km").sum().alias("total_km"),
        pl.col("fuel_conv_tot").sum().alias("total_fuel"),
        pl.col("co2_tot").sum().alias("total_emissions"),
        pl.col("co2_tot_electric").sum().alias("electric_emissions"),
        pl.col("cost_conventional").sum().alias("cost_conventional"),
        pl.col("cost_electric").sum().alias("cost_electric")
    ])


def filter_routes(data: pl.LazyFrame, distance: int, seats: int) -> pl.LazyFrame:
    """
    Filtra e aggrega i dati delle rotte, restituendo un LazyFrame per una
    successiva elaborazione ottimizzata.
    """
    return (
        data
        .filter(pl.col("GCD") <= distance)
        .filter(pl.col("Seats") <= seats)
        .group_by([pl.col("Dep_apt"), pl.col("Arr_apt")])
        .agg([
            pl.col("Dep_apt_lat").first(),
            pl.col("Dep_apt_lon").first(),
            pl.col("Arr_apt_lat").first(),
            pl.col("Arr_apt_lon").first(),
            pl.col("Frequency").sum().alias("Number"),
            pl.col("GCD").first(),
            (
                (pl.col("Seats") * pl.col("Frequency")
            ).sum() / pl.col("Frequency").sum()).alias("Seats"),
            pl.col("Flown_km").sum().alias("Total_flown"),
            pl.col("co2_tot").sum(),
            pl.col("delta_co2_tot").sum(),
            pl.col("fuel_conv_tot").sum().alias("Fuel")
        ])
        .select([
            pl.col("Dep_apt_lat"),
            pl.col("Dep_apt_lon"),
            pl.col("Arr_apt_lat"),
            pl.col("Arr_apt_lon"),
            pl.col("Dep_apt"),
            pl.col("Arr_apt"),
            pl.col("Number"),
            pl.col("GCD"),
            pl.col("Seats"),
            pl.col("Total_flown"),
            pl.col("co2_tot"),
            pl.col("delta_co2_tot"),
            pl.col("Fuel")
        ])
    )
