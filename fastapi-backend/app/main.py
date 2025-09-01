from fastapi import FastAPI
import polars as pl

app = FastAPI()
data = pl.read_excel("data.xlsx")

@app.get("/airports")
def get_airports():
    airports = data.select([
        pl.col("Dep_apt").alias("IATA"),
        pl.col("Dep_apt_lon").alias("lon"),
        pl.col("Dep_apt_lat").alias("lat")
    ])
    airports = airports.unique().sort(by="IATA")
    return airports.to_dicts()

@app.get("/routes")
def get_routes():
    routes = data.group_by(pl.col("Dep_apt", "Arr_apt")).agg([
        pl.col("Dep_apt_lat").first(),
        pl.col("Dep_apt_lon").first(),
        pl.col("Arr_apt_lat").first(),
        pl.col("Arr_apt_lon").first(),
        pl.col("Flown_km").mean()
    ]).sort(by=pl.col("Dep_apt", "Arr_apt"))
    return routes.to_dicts()

@app.get("/routes_by")
def get_routes_by(distance, seats):
    routes = data.filter(pl.col("Flown_km") <= int(distance))
    routes = routes.filter(pl.col("Seats") <= int(seats))
    routes = routes.group_by(pl.col("Dep_apt", "Arr_apt")).agg([
        pl.col("Dep_apt_lat").first(),
        pl.col("Dep_apt_lon").first(),
        pl.col("Arr_apt_lat").first(),
        pl.col("Arr_apt_lon").first(),
    ]).select(pl.col(
        "Dep_apt_lat",
        "Dep_apt_lon",
        "Arr_apt_lat",
        "Arr_apt_lon"
    ))
    return routes.to_dicts()

@app.get("/routes_by/airports")
def get_routes_by_apts(distance, seats):
    routes = data.filter(pl.col("Flown_km") <= int(distance))
    routes = routes.filter(pl.col("Seats") <= int(seats))
    routes = routes.select([
        pl.col("Dep_apt").alias("IATA"),
        pl.col("Dep_apt_lat").alias("lat"),
        pl.col("Dep_apt_lon").alias("lon")
    ])
    return routes.to_dicts()

@app.get("/airport_info/{iata}")
def get_airport_info(iata):
    airport = "A"
    return airport
