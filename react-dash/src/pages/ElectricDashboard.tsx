import { Typography } from "@/components/ui/typography";
import { Slider } from "@/components/ui/slider";
import LeafletMap from "@/components/map";
import { useEffect, useState } from "react";

import Perimetro from "@/components/Perimetro";
import { Armchair, FileKey2, Map, RulerDimensionLine } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import KpiTable from "@/components/KpiTable";

function ElectricDashboard() {
  const [passengers, setPassengers] = useState([20]);
  const [distance, setDistance] = useState([400]);

  const handlePassengerChange = (value: []) => {
    setPassengers(value);
  };

  const handleDistanceChange = (value: []) => {
    setDistance(value);
  };

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await fetch(
        "http://localhost:8000/routes_by?seats=" +
          passengers +
          "&distance=" +
          distance +
          "&perimeter=" +
          perimetro,
      );
      if (!response.ok) throw new Error("Network response was not ok");
      const result = await response.json();
      setData(result);
    } finally {
      setLoading(false);
    }
  };

  const [airports, setAirports] = useState(null);
  const [airportsLoading, setAirportsLoading] = useState(true);

  const fetchAirports = async () => {
    try {
      const response = await fetch(
        "http://localhost:8000/routes_by/airports?seats=" +
          passengers +
          "&distance=" +
          distance +
          "&perimeter=" +
          perimetro,
      );
      if (!response.ok) throw new Error("Network response was not ok");
      const result = await response.json();
      setAirports(result);
    } finally {
      setAirportsLoading(false);
    }
  };

  const [kpi, setKpi] = useState([]);
  const [kpiLoading, setKpiLoading] = useState(true);

  const fetchKpi = async () => {
    try {
      const response = await fetch(
        "http://localhost:8000/kpi?seats=" +
          passengers +
          "&distance=" +
          distance +
          "&perimeter=" +
          perimetro,
      );
      if (!response.ok) throw new Error("Network response was not ok");
      const result = await response.json();
      setKpi(result);
    } finally {
      setKpiLoading(false);
    }
  };

  const [perimetro, setPerimetro] = useState(true);

  const handlePerimetro = async (value: string) => {
    const perimeter = value === "Italia" ? true : false;
    setPerimetro(perimeter);
  };

  useEffect(() => {
    fetchData();
    fetchAirports();
    fetchKpi();
  }, [perimetro, distance, passengers]);

  return (
    <div className="h-max">
      <Typography version="h1" className="m-8 p-8">
        Electric Aircraft - Rotte Sostituibili
      </Typography>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] lg:grid-cols-[1fr_3fr] gap-6 mt-6 h-auto w-auto">
        <div className="flex flex-col space-y-6 h-auto mx-8">
          {/* Autonomia */}
          <div>
            <div className="flex items-center gap-2">
              <RulerDimensionLine className="h-6 w-6 text-primary" />
              <Typography version="h4">Range operativo (km):</Typography>
            </div>
            <div className="flex flex-row">
              <Slider
                className="m-8 w-lg mx-8 px-2"
                value={distance}
                onValueChange={handleDistanceChange}
                defaultValue={[400]}
                min={100}
                max={1500}
                step={1}
                referenceLines={[
                  {
                    value: 400,
                    label: "FGEA/SGEA",
                    color: "#ff6b35",
                  },
                ]}
              ></Slider>
              <Typography version="p" className="p-8 m-4">
                {distance}
              </Typography>
            </div>
          </div>
          {/* Numero di passeggeri */}
          <div>
            <div className="flex items-center gap-2">
              <Armchair className="h-6 w-6 text-primary" />
              <Typography version="h4">Capacità aeromobile: </Typography>
            </div>
            <div className="flex flex-row">
              <Slider
                className="m-8 w-lg mx-8 px-2"
                value={passengers}
                onValueChange={handlePassengerChange}
                defaultValue={[20]}
                min={10}
                max={100}
                step={1}
                referenceLines={[
                  {
                    value: 20,
                    label: "FGEA",
                    color: "#ff6b35",
                  },
                  {
                    value: 45,
                    label: "SGEA",
                    color: "#7cb342",
                  },
                ]}
              ></Slider>
              <Typography version="p" className="p-8 m-4">
                {passengers}
              </Typography>
            </div>
          </div>
          {/* Legenda */}
          <Typography version="p" className="m-2">
            <i>FGEA = First Generation Electric Aircraft</i>
            <br />
            <i>SGEA = Second Generation Electric Aircraft</i>
          </Typography>
          {/* Perimetro */}
          <div>
            <div className="flex items-center gap-2">
              <Map className="h-6 w-6 text-primary" />
              <Typography version="h4">Perimetro</Typography>
            </div>
            <Perimetro handler={handlePerimetro} className="p-2 m-2" />
          </div>
          <Separator />
          <div className="p-4">
            <div className="flex items-center gap-2">
              <FileKey2 className="h-6 w-6 text-primary" />
              <Typography version="h3">Tabella dei KPI</Typography>
            </div>
            <KpiTable
              caption="KPI relativi all'impiego di aeromobili elettrici."
              loading={kpiLoading}
              kpis={kpi}
            />
          </div>
        </div>
        {/* Mappa */}
        <div className="flex flex-col space-y-4">
          <LeafletMap
            polylines={loading && data != null ? [] : data}
            airports={airportsLoading && airports != null ? [] : airports}
          />
        </div>
      </div>
    </div>
  );
}

export default ElectricDashboard;
