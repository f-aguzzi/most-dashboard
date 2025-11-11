import polars as pl
from fastapi import APIRouter
from xlsxwriter.workbook import Dict

from app.service import price, fmt, pfmt

emissions_router = APIRouter()

scenario1 = pl.LazyFrame(pl.read_excel("scenario1.xlsx"))

scenario2 = pl.LazyFrame(pl.read_excel("scenario2.xlsx"))

scenario3 = pl.LazyFrame(pl.read_excel("scenario3.xlsx"))


@emissions_router.get("/routes")
def get_routes(distance: int, passengers: int):
    aggregation = [
        pl.col("lat_Dep").first().alias("Dep_apt_lat"),
        pl.col("lon_Dep").first().alias("Dep_apt_lon"),
        pl.col("lat_Arr").first().alias("Arr_apt_lat"),
        pl.col("lon_Arr").first().alias("Arr_apt_lon"),
        pl.col("GCD_km").first().alias("GCD"),
        pl.col("GCD_km").count().alias("Number"),
        pl.col("Seats_Total").mean().alias("Seats"),
        pl.col("GCD_km").sum().alias("Total_flown"),
    ]

    aggregation1 = [
        pl.col("sv_tr_IT_19").sum().alias("IT_19"),
        pl.col("sv_tr_IT_LF").sum().alias("IT_LF"),
        pl.col("sv_tr_EU_19").sum().alias("EU_19"),
        pl.col("sv_tr_EU_LF").sum().alias("EU_LF"),
    ]

    aggregation2 = [
        pl.col("sv_tr_EU_35").sum().alias("EU_35"),
        pl.col("sv_tr_EU_FR").sum().alias("EU_FR"),
    ]

    if distance <= 400 and passengers <= 21:
        data = scenario1
        aggregation += aggregation1
        extracols = True
    elif 400 < distance <= 800 or 21 < passengers <= 90:
        data = scenario2
        aggregation += aggregation2
        extracols = False
    else:
        data = scenario3
        aggregation += aggregation2
        extracols = False

    routes = (
        data.filter([pl.col("GCD_km") <= distance, pl.col("Seats_Total") <= passengers])
        .group_by(
            [
                pl.col("Dep_Airport_Code").alias("Dep_apt"),
                pl.col("Arr_Airport_Code").alias("Arr_apt"),
            ]
        )
        .agg(aggregation)
        .collect()
    )

    result = []
    for row in routes.to_dicts():
        route = [
            [row["Dep_apt_lat"], row["Dep_apt_lon"]],
            [row["Arr_apt_lat"], row["Arr_apt_lon"]],
        ]
        dict = {
            "route": route,
            "label": row["Dep_apt"] + "-" + row["Arr_apt"],
            "count": int(row["Number"]),
            "distance": int(row["GCD"]),
            "seats": int(row["Seats"]),
            "flown": row["Total_flown"],
        }

        if extracols:
            dict = dict | {
                "IT_19": row["IT_19"],
                "IT_LF": row["IT_LF"],
                "EU_19": row["EU_19"],
                "EU_LF": row["EU_LF"],
                "EU_35": None,
                "EU_FR": None,
            }
        else:
            dict = dict | {
                "IT_19": None,
                "IT_LF": None,
                "EU_19": None,
                "EU_LF": None,
                "EU_35": row["EU_35"],
                "EU_FR": row["EU_FR"],
            }

        result.append(dict)

    return result


@emissions_router.get("/airports")
def get_airports(distance: int, passengers: int):
    if distance <= 400 and passengers <= 21:
        data = scenario1
    elif 400 < distance <= 800 or 21 < passengers <= 90:
        data = scenario2
    else:
        data = scenario3

    data = data.filter(
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


@emissions_router.get("/kpi")
def get_kpi(distance: int, passengers: int):
    base_query = [
        pl.col("GCD_km").count().alias("number"),
        pl.col("GCD_km").sum().alias("flown"),
    ]

    scenario1_query = [
        pl.col("sv_tr_IT_19").sum().alias("IT_19"),
        pl.col("sv_tr_IT_LF").sum().alias("IT_LF"),
        pl.col("sv_tr_EU_19").sum().alias("EU_19"),
        pl.col("sv_tr_EU_LF").sum().alias("EU_LF"),
    ]

    scenario2_query = [
        pl.col("sv_tr_EU_35").sum().alias("EU_35"),
        pl.col("sv_tr_EU_FR").sum().alias("EU_FR"),
    ]

    if distance <= 400 and passengers <= 21:
        data = scenario1
        query = base_query + scenario1_query
        is_scenario1 = True
    elif 400 < distance <= 800 or 21 < passengers <= 90:
        data = scenario2
        query = base_query + scenario2_query
        is_scenario1 = False
    else:
        data = scenario3
        query = base_query + scenario2_query
        is_scenario1 = False

    data_filtered = data.filter(
        [pl.col("GCD_km") <= distance, pl.col("Seats_Total") <= passengers]
    )

    data = scenario3.select(base_query).collect().to_dicts()[0]
    data_filtered = data_filtered.select(query).collect().to_dicts()[0]

    if is_scenario1:
        return {
            "number": fmt(data_filtered["number"]),
            "number_percentage": pfmt(data_filtered["number"] / data["number"]),
            "flown": data_filtered["flown"],
            "flown_percentage": pfmt(data_filtered["flown"] / data["flown"]),
            "IT_19": fmt(data_filtered["IT_19"] / 1000),
            "IT_LF": fmt(data_filtered["IT_LF"] / 1000),
            "EU_19": fmt(data_filtered["EU_19"] / 1000),
            "EU_LF": fmt(data_filtered["EU_LF"] / 1000),
            "EU_35": None,
            "EU_FR": None,
        }
    else:
        return {
            "number": data_filtered["number"],
            "number_percentage": pfmt(data_filtered["number"] / data["number"]),
            "flown": data_filtered["flown"],
            "flown_percentage": pfmt(data_filtered["flown"] / data["flown"]),
            "IT_19": None,
            "IT_LF": None,
            "EU_19": None,
            "EU_LF": None,
            "EU_35": fmt(data_filtered["EU_35"] / 1000),
            "EU_FR": fmt(data_filtered["EU_FR"] / 1000),
        }


@emissions_router.get("/euro_kpi")
def get_euro_kpi(distance: int, passengers: int):
    scenario1_query = [
        pl.col("sv_tr_IT_19").sum().alias("IT_19"),
        pl.col("sv_tr_IT_LF").sum().alias("IT_LF"),
        pl.col("sv_tr_EU_19").sum().alias("EU_19"),
        pl.col("sv_tr_EU_LF").sum().alias("EU_LF"),
    ]

    scenario2_query = [
        pl.col("sv_tr_EU_35").sum().alias("EU_35"),
        pl.col("sv_tr_EU_FR").sum().alias("EU_FR"),
    ]

    if distance <= 400 and passengers <= 21:
        data = scenario1
        query = scenario1_query
        is_scenario1 = True
    elif 400 < distance <= 800 or 21 < passengers <= 80:
        data = scenario2
        query = scenario2_query
        is_scenario1 = False
    else:
        data = scenario3
        query = scenario2_query
        is_scenario1 = False

    data_filtered = data.filter(
        [pl.col("GCD_km") <= distance, pl.col("Seats_Total") <= passengers]
    )

    data_filtered = data_filtered.select(query).collect().to_dicts()[0]

    if is_scenario1:
        return {
            "IT_19": price(data_filtered["IT_19"]),
            "IT_LF": price(data_filtered["IT_LF"]),
            "EU_19": price(data_filtered["EU_19"]),
            "EU_LF": price(data_filtered["EU_LF"]),
            "EU_35": None,
            "EU_FR": None,
        }
    else:
        return {
            "IT_19": None,
            "IT_LF": None,
            "EU_19": None,
            "EU_LF": None,
            "EU_35": price(data_filtered["EU_35"]),
            "EU_FR": price(data_filtered["EU_FR"]),
        }
