from fastapi import FastAPI
import polars as pl
from app.service import get_all_flights, filter_routes
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
def get_routes_by(distance, seats, perimeter):
    if perimeter == "true":
        route_data = data.filter(pl.col("Perimetro") == "Italia")
    else:
        route_data = data
    routes = filter_routes(route_data, distance, seats)

    result = []
    for row in routes.to_dicts():
        route = [
            [row["Dep_apt_lat"], row["Dep_apt_lon"]],
            [row["Arr_apt_lat"], row["Arr_apt_lon"]]
        ]
        result.append({
            "route" : route,
            "label" : row["Dep_apt"] + "-" + row["Arr_apt"]
        })

    return result

@app.get("/routes_by/airports")
def get_routes_by_apts(distance, seats, perimeter):
    if perimeter == "true":
        route_data = data.filter(pl.col("Perimetro") == "Italia")
    else:
        route_data = data

    routes = route_data.filter(pl.col("GCD") <= int(distance))
    routes = routes.filter(pl.col("Seats") <= int(seats))
    routes1 = routes.select([
        pl.col("Dep_apt").alias("IATA"),
        pl.col("Dep_apt_lat").alias("lat"),
        pl.col("Dep_apt_lon").alias("lon")
    ])

    routes2 = routes.select([
        pl.col("Arr_apt").alias("IATA"),
        pl.col("Arr_apt_lat").alias("lat"),
        pl.col("Arr_apt_lon").alias("lon")
    ])

    routes = pl.concat([routes1, routes2]).unique()

    results = []
    for row in routes.to_dicts():
        location = [row["lat"], row["lon"]]
        results.append({
            "location" : location,
            "label" : row["IATA"]
        })

    return results

@app.get("/airport_info/{iata}")
def get_airport_info(iata):
    airport = "A"
    return airport

@app.get("/kpi")
def get_kpi(distance, seats, perimeter):
    if perimeter == "true":
        route_data = data.filter(pl.col("Perimetro") == "Italia")
    else:
        route_data = data
    filtered_data = route_data.filter(pl.col("GCD") <= int(distance))
    filtered_data = filtered_data.filter(pl.col("Seats") <= int(seats))

    kpi_tot = get_all_flights(route_data)
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
