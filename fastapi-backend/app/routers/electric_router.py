from fastapi import APIRouter
from fastapi.responses import StreamingResponse
import io
import polars as pl
from app.service import get_all_flights, filter_routes, fmt, pfmt

electric_router = APIRouter()

data = pl.LazyFrame(pl.read_excel("data.xlsx"))


@electric_router.get("/routes_by")
def get_routes_by(distance: int, seats: int, perimeter: bool):
    """
    Restituisce una lista di dati sulle rotte.
    """
    if perimeter is True:
        route_data = data.filter(pl.col("Perimetro") == "Italia")
    else:
        route_data = data
    routes = filter_routes(route_data, distance, seats).collect()

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
                "deltaco2": row["delta_co2_tot"],
            }
        )

    return result


@electric_router.get("/routes_by/airports")
def get_routes_by_apts(distance: int, seats: int, perimeter: bool):
    """
    Restituisce una lista di dati sugli aeroporti.
    """
    if perimeter is True:
        route_data = data.filter(pl.col("Perimetro") == "Italia")
    else:
        route_data = data

    routes = route_data.filter([pl.col("GCD") <= distance, pl.col("Seats") <= seats])

    routes1 = routes.select(
        [
            pl.col("Dep_apt").alias("IATA"),
            pl.col("Dep_apt_lat").alias("lat"),
            pl.col("Dep_apt_lon").alias("lon"),
        ]
    )

    routes2 = routes.select(
        [
            pl.col("Arr_apt").alias("IATA"),
            pl.col("Arr_apt_lat").alias("lat"),
            pl.col("Arr_apt_lon").alias("lon"),
        ]
    )

    routes = pl.concat([routes1, routes2]).unique().collect()

    results = []
    for row in routes.to_dicts():
        location = [row["lat"], row["lon"]]
        results.append(
            {
                "location": location,
                "label": row["IATA"],
            }
        )

    return results


@electric_router.get("/kpi")
def get_kpi(distance: int, seats: int, perimeter: bool):
    """
    Restituisce un dizionario di KPI sui voli.
    """
    if perimeter == "true":
        route_data = data.filter(pl.col("Perimetro") == "Italia")
    else:
        route_data = data
    filtered_data = route_data.filter(
        [pl.col("GCD") <= distance, pl.col("Seats") <= seats]
    )

    kpi_tot = get_all_flights(route_data).collect().to_dicts()[0]
    kpi_part = get_all_flights(filtered_data).collect().to_dicts()[0]

    result = [
        {
            "metric": "number",
            "value": fmt(kpi_part["flight_number"]),
            "percentage": pfmt(kpi_part["flight_number"] / kpi_tot["flight_number"]),
        },
        {
            "metric": "km",
            "value": fmt(kpi_part["total_km"] / 1000.0),
            "percentage": pfmt(kpi_part["total_km"] / kpi_tot["total_km"]),
        },
        {
            "metric": "fuel",
            "value": fmt(kpi_part["total_fuel"]),
            "percentage": pfmt(kpi_part["total_fuel"] / kpi_tot["total_fuel"]),
        },
        {
            "metric": "co2",
            "value": fmt(
                (kpi_part["total_emissions"] - kpi_part["electric_emissions"])
            ),
            "percentage": pfmt(
                (kpi_part["total_emissions"] - kpi_part["electric_emissions"])
                / kpi_tot["total_emissions"]
            ),
        },
    ]

    if seats <= 50 and distance <= 500:
        result.append(
            {
                "metric": "delta",
                "value": fmt(
                    (kpi_part["cost_conventional"] - kpi_part["cost_electric"])
                    / kpi_tot["cost_conventional"]
                ),
                "percentage": pfmt(
                    (kpi_part["cost_conventional"] - kpi_part["cost_electric"])
                    / kpi_tot["cost_conventional"]
                ),
            }
        )

    return result


@electric_router.get("/datasheet")
def get_datasheet(distance: int, seats: int, perimeter: bool):
    """
    Restituisce i dati sotto forma di file Excel scaricabile.
    """
    if perimeter == "true":
        route_data = data.filter(pl.col("Perimetro") == "Italia")
    else:
        route_data = data
    filtered_data = route_data.filter(
        [pl.col("GCD") <= distance, pl.col("Seats") <= seats]
    )

    result = filtered_data.group_by(pl.col("Dep_apt", "Arr_apt")).agg(
        [
            pl.col("Dep_apt_region").first(),
            pl.col("Arr_apt_region").first(),
            pl.col("GCD").first(),
            pl.col("Frequency").sum().alias("Flights_number"),
            pl.col("Flown_km").sum(),
            pl.col("co2_tot").sum(),
            (pl.col("delta_co2_tot").sum() / pl.col("co2_tot").sum()).alias(
                "delta_co2_tot_%"
            ),
        ]
    )

    # Convert to Excel format in memory
    excel_buffer = io.BytesIO()

    # Write DataFrame to Excel buffer using xlsxwriter engine
    result.collect().write_excel(excel_buffer)

    # Reset buffer position to the beginning
    excel_buffer.seek(0)

    # Create filename with timestamp
    filename = f"dataset-{distance}km-{seats}seats-italy={perimeter}.xlsx"

    # Return as streaming response
    return StreamingResponse(
        io.BytesIO(excel_buffer.read()),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0",
        },
    )
