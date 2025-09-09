from fastapi import FastAPI
import polars as pl
from app.service import get_all_flights

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
    routes = data.filter(pl.col("GCD") <= int(distance))
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

    result = []
    for row in routes.to_dicts():
        route = [
            [row["Dep_apt_lat"], row["Dep_apt_lon"]],
            [row["Arr_apt_lat"], row["Arr_apt_lon"]]
        ]
        result.append(route)

    return result

@app.get("/routes_by/airports")
def get_routes_by_apts(distance, seats):
    routes = data.filter(pl.col("GCD") <= int(distance))
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

@app.get("/kpi")
def get_kpi(distance, seats):
    filtered_data = data.filter(pl.col("GCD") <= int(distance))
    filtered_data = filtered_data.filter(pl.col("Seats") <= int(seats))

    kpi_tot = get_all_flights(data)
    kpi_part = get_all_flights(filtered_data)

    return {
        "flight_number" : kpi_part["flight_number"],
        "flight_percentage" : 100 * kpi_part["flight_number"]/kpi_tot["flight_number"],
        "km" : kpi_part["total_km"],
        "km_percentage" : 100 * kpi_part["total_km"] / kpi_tot["total_km"],
        "saved_fuel" : kpi_part["total_fuel"],
        "saved_fuel_percentage" : 100 * kpi_part["total_fuel"] / kpi_tot["total_fuel"],
        "saved_co2" : kpi_part["total_emissions"] - kpi_part["electric_emissions"],
        "saved_co2_percentage" : 100*(kpi_part["total_emissions"] - kpi_part["electric_emissions"]) / kpi_tot["total_emissions"]
    }
