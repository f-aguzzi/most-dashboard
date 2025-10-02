import polars as pl
from fastapi import APIRouter

emissions_router = APIRouter()

scenario1 = pl.LazyFrame(pl.read_excel("scenario1.xlsx"))

scenario2 = pl.LazyFrame(pl.read_excel("scenario2.xlsx"))

scenario3 = pl.LazyFrame(pl.read_excel("scenario3.xlsx"))


@emissions_router.get("/routes")
def get_routes(scenario: str):
    if scenario == "s1":
        data = scenario1
    elif scenario == "s2":
        data = scenario2
    elif scenario == "s3":
        data = scenario3
    else:
        return None

    routes = (
        data.group_by(
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
