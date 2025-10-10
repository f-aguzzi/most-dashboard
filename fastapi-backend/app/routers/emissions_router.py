import polars as pl
from fastapi import APIRouter
from xlsxwriter.workbook import Dict

emissions_router = APIRouter()

scenario1 = pl.LazyFrame(pl.read_excel("scenario1.xlsx"))

scenario2 = pl.LazyFrame(pl.read_excel("scenario2.xlsx"))

scenario3 = pl.LazyFrame(pl.read_excel("scenario3.xlsx"))


@emissions_router.get("/routes")
def get_routes(distance: int, passengers: int):
    data = scenario3

    routes = (
        data.filter([pl.col("GCD_km") <= distance, pl.col("Seats_Total") <= passengers])
        .group_by(
            [
                pl.col("Dep_Airport_Code").alias("Dep_apt"),
                pl.col("Arr_Airport_Code").alias("Arr_apt"),
            ]
        )
        .agg(
            [
                pl.col("lat_Dep").first().alias("Dep_apt_lat"),
                pl.col("lon_Dep").first().alias("Dep_apt_lon"),
                pl.col("lat_Arr").first().alias("Arr_apt_lat"),
                pl.col("lon_Arr").first().alias("Arr_apt_lon"),
                pl.col("GCD_km").first().alias("GCD"),
                pl.col("Frequency").sum().alias("Number"),
                pl.col("Seats_Total").mean().alias("Seats"),
                pl.col("GCD_km").sum().alias("Total_flown"),
                pl.col("final_CO2_TON").sum().alias("co2_tot"),
                pl.col("final_Fuel_TON").sum().alias("Fuel"),
            ]
        )
        .collect()
    )

    result = []
    for row in routes.to_dicts():
        route = [
            [row["Dep_apt_lat"], row["Dep_apt_lon"]],
            [row["Arr_apt_lat"], row["Arr_apt_lon"]],
        ]
        result.append(
            {
                "route": route,
                "label": row["Dep_apt"] + "-" + row["Arr_apt"],
                "count": int(row["Number"]),
                "distance": int(row["GCD"]),
                "seats": int(row["Seats"]),
                "flown": row["Total_flown"],
                "co2": row["co2_tot"],
                "fuel": row["Fuel"],
            }
        )
    return result


@emissions_router.get("/airports")
def get_airports(distance: int, passengers: int):
    data = scenario3.filter(
        [pl.col("GCD_km") <= distance, pl.col("Seats_Total") <= passengers]
    )

    airports_left = data.group_by(pl.col("Dep_Airport_Code").alias("label")).agg(
        [
            pl.col("lat_Dep").first().alias("lat"),
            pl.col("lon_Dep").first().alias("lon"),
        ]
    )

    airports_right = data.group_by(pl.col("Arr_Airport_Code").alias("label")).agg(
        [pl.col("lon_Arr").first().alias("lat"), pl.col("lon_Arr").first().alias("lon")]
    )

    results = []

    for x in pl.concat([airports_left, airports_right]).unique().collect().to_dicts():
        results.append({"label": x["label"], "location": [x["lat"], x["lon"]]})
    return results
