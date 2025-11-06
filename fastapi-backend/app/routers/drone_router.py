import polars as pl
from fastapi import APIRouter

drone_router = APIRouter()

data = pl.LazyFrame(pl.read_excel("droni.xlsx"))


@drone_router.get("/routes")
def get_data(number: int, model: str):
    result = data.filter([pl.col("droni") >= number, pl.col("modello") == model])
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
    result = data.filter([pl.col("droni") >= number, pl.col("modello") == model])

    result1 = result.select(
        [
            pl.col("Origin").alias("loc"),
            pl.col("lat_origin").first().alias("lat"),
            pl.col("lon_origin").first().alias("lon"),
        ]
    )

    result2 = result.select(
        [
            pl.col("Destination").alias("loc"),
            pl.col("lat_dest").alias("lat"),
            pl.col("lon_dest").alias("lon"),
        ]
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
def get_diverted(model: str, type: str):
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
