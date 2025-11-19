import { useTranslation } from "react-i18next";

import { Typography } from "@/components/ui/typography";
import { Slider } from "@/components/ui/slider";
import ElectricMap, {
  type Airport,
  type PolyLine,
} from "@/components/ElectricMap";
import { useEffect, useState } from "react";

import { Armchair, Eye, FileKey2, RulerDimensionLine } from "lucide-react";
import KpiTable, { type Kpi } from "@/components/KpiTable";
import { Button } from "@/components/ui/button";
import DisplaySelector from "@/components/DisplaySelector";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

const url = import.meta.env.VITE_URL;
const apiUrl = url + "/electric";

function ElectricDashboard() {
  const { t } = useTranslation();

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
          committedDistance,
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
          committedDistance,
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
          committedDistance,
      );
      if (!response.ok) throw new Error("Network response was not ok");
      const result = await response.json();
      setKpi(result);
    } catch {
      setKpi(null);
    }
  };

  const [display, setDisplay] = useState("Frequenza");

  const handleDisplay = async (value: string) => {
    setDisplay(value);
  };

  useEffect(() => {
    fetchData();
    fetchAirports();
    fetchKpi();
  }, [committedDistance, committedPassengers, display]);

  const fetchTable = async () => {
    try {
      const params = new URLSearchParams({
        distance: committedDistance.toString(),
        seats: committedPassengers.toString(),
        _t: Date.now().toString(),
      });

      const response = await fetch(apiUrl + `/datasheet?${params}`, {
        cache: "no-store", // Force no caching
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Download failed: ${response.status} ${response.statusText}`,
        );
      }

      // Get the filename from the Content-Disposition header
      const contentDisposition = response.headers.get("Content-Disposition");
      const filename = contentDisposition
        ? contentDisposition.split("filename=")[1]?.replace(/"/g, "")
        : `dataset-${distance}km-${passengers}seats.xlsx`;

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
        {t("electric.title")}
      </Typography>
      <Card>
        <Label className="mx-8">{t("captions.electric")}</Label>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] lg:grid-cols-[1fr_3fr] gap-6 mt-6 h-auto w-auto">
        <div className="flex flex-col space-y-6 h-auto">
          <Card className="p-8">
            {/* Autonomia */}
            <div>
              <div className="flex items-center gap-2">
                <RulerDimensionLine className="h-6 w-6 text-primary" />
                <Typography version="h4">{t("electric.range")}</Typography>
              </div>
              <div className="flex flex-row">
                <Slider
                  className="m-8 w-auto lg:w-lg mx-8 px-2"
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
                <Typography version="h4"> {t("electric.capacity")} </Typography>
              </div>
              <div className="flex flex-row">
                <Slider
                  className="m-8 w-auto lg:w-lg mx-8 px-2"
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
            <div className="flex flex-row items-center gap-4">
              {/* Display */}
              <div className="flex flex-col items-center gap-2">
                <div className="flex flex-row gap-2">
                  <Eye className="h-6 w-6 text-primary" />
                  <Typography version="h4">
                    {t("electric.display.title")}
                  </Typography>
                </div>
                <DisplaySelector handler={handleDisplay} className="p-2 m-2" />
              </div>
              {/* Scarica i dati */}
              <Button className="mx-auto" onClick={fetchTable}>
                {t("electric.download")}
              </Button>
            </div>
          </Card>
          <Card className="p-8">
            <div className="p-4">
              <div className="flex items-center gap-2">
                <FileKey2 className="h-6 w-6 text-primary" />
                <Typography version="h3">{t("electric.kpi.title")}</Typography>
              </div>
              <KpiTable caption={t("electric.kpi.desc")} kpis={kpi} />
            </div>
          </Card>
        </div>
        {/* Mappa */}
        <div className="flex flex-col space-y-4">
          <Card className="p-8 h-auto">
            <ElectricMap
              center={[55.505, 13.0]}
              zoom={4}
              polylines={data}
              airports={airports}
              display={display}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ElectricDashboard;
