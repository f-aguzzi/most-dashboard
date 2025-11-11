import polars as pl
from fastapi import APIRouter

drone_router = APIRouter()

data = pl.LazyFrame(pl.read_excel("droni.xlsx"))


@drone_router.get("/routes")
def get_data(number: int, model: str):
    result = data.filter([pl.col("droni") == number, pl.col("modello") == model])
    result = result.collect().to_dicts()

    results = []

    for row in result:
        route = [
            [row["lat_origin"], row["lon_origin"]],
            [row["lat_dest"], row["lon_dest"]],
        ]
        results.append(
            {
                "route": route,
                "label": f"{row['Origin']} - {row['Destination']}",
                "count": row["nr_flights"],
                "replaced": row["nr_movs_replaced"],
                "weight": row["peso_trasport"],
                "co2": row["CO2_reduction"],
            }
        )
    return results


@drone_router.get("/points")
def get_points(number: int, model: str):
    result = data.filter([pl.col("droni") == number, pl.col("modello") == model])

    result1 = (
        result.group_by(
            pl.col("Origin").alias("loc"),
        )
        .agg(
            [
                pl.col("lat_origin").first().alias("lat"),
                pl.col("lon_origin").first().alias("lon"),
            ]
        )
        .unique()
    )

    result2 = (
        result.group_by(pl.col("Destination").alias("loc"))
        .agg(
            [
                pl.col("lat_dest").first().alias("lat"),
                pl.col("lon_dest").first().alias("lon"),
            ]
        )
        .unique()
    )

    result = pl.concat([result1, result2]).unique().collect().to_dicts()

    results = []
    for row in result:
        results.append({"location": [row["lat"], row["lon"]], "label": row["loc"]})
    return results


def kpi_query(type: str):
    if type == "diverted":
        return pl.col("peso_diverted").alias("data").sum() / 1000
    if type == "co2":
        return pl.col("CO2_reduction").alias("data").sum() / 1000
    if type == "movements":
        return pl.col("nr_movs_replaced").alias("data").sum()


@drone_router.get("/kpi")
def get_kpi(model: str, type: str):
    result = (
        data.filter(pl.col("modello") == model)
        .group_by(
            [
                pl.col("droni").alias("value"),
            ]
        )
        .agg(kpi_query(type))
    )
    return result.sort(pl.col("value")).collect().to_dicts()


@drone_router.get("/kpi/table")
def get_kpi_table(model: str):
    max_diverted = 77845.22
    max_co2 = 4490981.01238192
    max_movements = 257

    result = (
        data.filter(pl.col("modello") == model)
        .group_by(
            [
                pl.col("droni").alias("value"),
            ]
        )
        .agg(
            [
                (pl.col("peso_diverted").alias("mass").sum() / 1000).round(2),
                (
                    pl.col("peso_diverted").alias("mass_perc").sum()
                    * 100
                    / max_diverted
                ).round(2),
                (pl.col("CO2_reduction").alias("co2").sum() / 1000).round(2),
                (pl.col("CO2_reduction").alias("co2_perc").sum() * 100 / max_co2).round(
                    2
                ),
                (pl.col("nr_movs_replaced").alias("movements").sum()).round(2),
                (
                    pl.col("nr_movs_replaced").alias("movements_perc").sum()
                    * 100
                    / max_movements
                ).round(2),
            ]
        )
        .filter(pl.col("value").is_in([10, 50, 90, 110, 150]))
    )
    return result.sort(pl.col("value")).collect().to_dicts()
