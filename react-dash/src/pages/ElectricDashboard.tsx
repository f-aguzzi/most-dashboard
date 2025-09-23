import { Typography } from "@/components/ui/typography";
import { Slider } from "@/components/ui/slider";
import LeafletMap, { type Airport, type PolyLine } from "@/components/map";
import { useEffect, useState } from "react";

import Perimetro from "@/components/Perimetro";
import { Armchair, Eye, FileKey2, Map, RulerDimensionLine } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import KpiTable, { type Kpi } from "@/components/KpiTable";
import { Button } from "@/components/ui/button";
import DisplaySelector from "@/components/DisplaySelector";

const apiUrl = import.meta.env.VITE_URL;

function ElectricDashboard() {
  const [passengers, setPassengers] = useState([20]);
  const [distance, setDistance] = useState([400]);
  const [committedPassengers, setCommittedPassengers] = useState([20]);
  const [committedDistance, setCommittedDistance] = useState([400]);

  const handlePassengerChange = (value: []) => {
    setPassengers(value);
  };

  const handleDistanceChange = (value: []) => {
    setDistance(value);
  };

  const commitPassengers = (value: []) => {
    setCommittedPassengers(value);
  };

  const commitDistance = (value: []) => {
    setCommittedDistance(value);
  };

  const [data, setData] = useState<[PolyLine] | null>(null);

  const fetchData = async () => {
    try {
      const response = await fetch(
        apiUrl +
          "/routes_by?seats=" +
          committedPassengers +
          "&distance=" +
          committedDistance +
          "&perimeter=" +
          perimetro,
      );
      if (!response.ok) throw new Error("Network response was not ok");
      const result = await response.json();
      setData(result);
    } catch {
      setData(null);
    }
  };

  const [airports, setAirports] = useState<[Airport] | null>(null);

  const fetchAirports = async () => {
    try {
      const response = await fetch(
        apiUrl +
          "/routes_by/airports?seats=" +
          committedPassengers +
          "&distance=" +
          committedDistance +
          "&perimeter=" +
          perimetro,
      );
      if (!response.ok) throw new Error("Network response was not ok");
      const result = await response.json();
      setAirports(result);
    } catch {
      setAirports(null);
    }
  };

  const [kpi, setKpi] = useState<[Kpi] | null>(null);

  const fetchKpi = async () => {
    try {
      const response = await fetch(
        apiUrl +
          "/kpi?seats=" +
          committedPassengers +
          "&distance=" +
          committedDistance +
          "&perimeter=" +
          perimetro,
      );
      if (!response.ok) throw new Error("Network response was not ok");
      const result = await response.json();
      setKpi(result);
    } catch {
      setKpi(null);
    }
  };

  const [perimetro, setPerimetro] = useState(true);

  const handlePerimetro = async (value: string) => {
    const perimeter = value === "Italia" ? true : false;
    setPerimetro(perimeter);
  };

  const [display, setDisplay] = useState("Frequenza");

  const handleDisplay = async (value: string) => {
    setDisplay(value);
  };

  useEffect(() => {
    fetchData();
    fetchAirports();
    fetchKpi();
  }, [perimetro, committedDistance, committedPassengers, display]);

  const fetchTable = async () => {
    try {
      // Build the query parameters
      const params = new URLSearchParams({
        distance: committedDistance.toString(),
        seats: committedPassengers.toString(),
        perimeter: perimetro.toString(),
      });

      // Make the request to your FastAPI endpoint
      const response = await fetch(process.env.URL + `/datasheet?${params}`);

      if (!response.ok) {
        throw new Error(
          `Download failed: ${response.status} ${response.statusText}`,
        );
      }

      // Get the filename from the Content-Disposition header
      const contentDisposition = response.headers.get("Content-Disposition");
      const filename = contentDisposition
        ? contentDisposition.split("filename=")[1]?.replace(/"/g, "")
        : `dataset-${distance}km-${passengers}seats-italy=${perimetro}.xlsx`;

      // Convert response to blob
      const blob = await response.blob();

      // Create download link and trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Download error:", err);
    }
  };

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
                onValueCommit={commitDistance}
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
              <Typography version="p" className="p-8 m-4 w-4 text-center">
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
                onValueCommit={commitPassengers}
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
              <Typography version="p" className="p-8 m-4 w-4 text-center">
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
          {/* Riga di controllo */}
          <div className="flex flex-row items-center gap-2">
            {/* Perimetro */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex flex-row gap-2">
                <Map className="h-6 w-6 text-primary" />
                <Typography version="h4">Perimetro</Typography>
              </div>
              <Perimetro handler={handlePerimetro} className="p-2 m-2" />
            </div>
            {/* Scarica i dati */}
            <Button className="mx-4" onClick={fetchTable}>
              {" "}
              Scarica i dati{" "}
            </Button>
            {/* Display */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex flex-row gap-2">
                <Eye className="h-6 w-6 text-primary" />
                <Typography version="h4">Visualizzazione</Typography>
              </div>
              <DisplaySelector handler={handleDisplay} className="p-2 m-2" />
            </div>
          </div>
          <Separator />
          <div className="p-4">
            <div className="flex items-center gap-2">
              <FileKey2 className="h-6 w-6 text-primary" />
              <Typography version="h3">Tabella dei KPI</Typography>
            </div>
            <KpiTable
              caption="KPI relativi all'impiego di aeromobili elettrici."
              kpis={kpi}
            />
          </div>
        </div>
        {/* Mappa */}
        <div className="flex flex-col space-y-4">
          <LeafletMap polylines={data} airports={airports} display={display} />
        </div>
      </div>
    </div>
  );
}

export default ElectricDashboard;
