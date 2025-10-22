import polars as pl
from fastapi import APIRouter

socioeconomic_router = APIRouter()

data = pl.LazyFrame(pl.read_csv("socioeconomic.csv"))


@socioeconomic_router.get("/")
def get_data(distance: int, seats: int, mc: int):
    result = (
        data.filter(
            (pl.col("dist_threshold") == distance)
            & (pl.col("seat_threshold") == seats)
            & (pl.col("mcchange") == (mc / 100.0))
        )
        .select(["totaldeltaprof", "totaldeltacs", "totaldeltawelfare"])
        .collect()
    )

    return result.to_dicts()
