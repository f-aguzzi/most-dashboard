import DroneDisplaySelector from "@/components/DroneDisplaySelector";
import { DroneKpiGraph, type KpiData } from "@/components/DroneKpiGraph";
import DroneMap, { type Location, type PolyLine } from "@/components/DroneMap";
import ModelPicker from "@/components/ModelPicker";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Typography } from "@/components/ui/typography";
import { Drone, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const url = import.meta.env.VITE_URL;
const apiUrl = url + "/drone";

function DroneDashboard() {
  const { t } = useTranslation();

  const [model, setModel] = useState("cargo");
  const handleModel = (value: string) => {
    setModel(value);
  };

  const [display, setDisplay] = useState("flights");
  const handleDisplay = (value: string) => {
    setDisplay(value);
  };

  const [drones, setDrones] = useState([10]);
  const [committedDrones, setCommittedDrones] = useState([10]);

  const [routes, setRoutes] = useState<[PolyLine] | null | undefined>(null);

  const fetchRoutes = async () => {
    try {
      const response = await fetch(
        apiUrl + "/routes/?number=" + committedDrones + "&model=" + model,
      );
      if (!response.ok) throw new Error("Network response was not ok");
      const result = await response.json();
      setRoutes(result);
    } catch {
      setRoutes(null);
    }
  };

  const [locations, setLocations] = useState<[Location] | null | undefined>(
    null,
  );

  const fetchLocations = async () => {
    try {
      const response = await fetch(
        apiUrl + "/points?number=" + committedDrones + "&model=" + model,
      );
      if (!response.ok) throw new Error("Network response was not ok");
      const result = await response.json();
      setLocations(result);
    } catch {
      setLocations(null);
    }
  };

  const [diverted, setDiverted] = useState<[KpiData] | undefined>(undefined);
  const [co2, setCo2] = useState<[KpiData] | undefined>(undefined);
  const [movements, setMovements] = useState<[KpiData] | undefined>(undefined);

  const fetchDiverted = async () => {
    try {
      const response = await fetch(
        apiUrl + "/kpi?model=" + model + "&type=diverted",
      );
      if (!response.ok) throw new Error("Network response was not ok");
      const result = await response.json();
      setDiverted(result);
    } catch {
      setDiverted(undefined);
    }
  };

  const fetchCo2 = async () => {
    try {
      const response = await fetch(
        apiUrl + "/kpi?model=" + model + "&type=co2",
      );
      const result = await response.json();
      setCo2(result);
    } catch {
      setCo2(undefined);
    }
  };

  const fetchMovements = async () => {
    try {
      const response = await fetch(
        apiUrl + "/kpi?model=" + model + "&type=movements",
      );
      if (!response.ok) throw new Error("Network response was not ok");
      const result = await response.json();
      setMovements(result);
    } catch {
      setMovements(undefined);
    }
  };

  useEffect(() => {
    fetchRoutes();
    fetchLocations();
    fetchDiverted();
    fetchCo2();
    fetchMovements();
    console.log(co2, movements, diverted);
  }, [committedDrones, model]);

  const createFooter = () => {
    return t("drone.kpi.footer.base") + t("drone.kpi.footer." + model);
  };

  return (
    <div className="h-max">
      <Typography version="h1" className="m-8 p-8">
        {t("drone.title")}
      </Typography>
      <Label className="mx-8">{t("captions.drone")}</Label>
      <div className="grid grid-cols-4 gap-4 p-8">
        <div className="col-span-1 h-full space-y-8">
          {/* Scelta modello */}
          <ModelPicker handler={handleModel} value={model} />
          {/* Visualizzazione */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Eye className="h-6 w-6 text-primary" />
              <Typography version="h4">{t("drone.display.title")}</Typography>
            </div>
            <DroneDisplaySelector handler={handleDisplay} />
          </div>
          {display} {committedDrones}
          {/* Slider */}
          <div>
            <div className="flex items-center gap-2">
              <Drone className="h-6 w-6 text-primary" />
              <Typography version="h4">{t("drone.number")}:</Typography>
            </div>
            <div className="flex flex-row">
              <Slider
                className="m-8 w-auto mx-8 px-2"
                value={drones}
                onValueChange={setDrones}
                onValueCommit={setCommittedDrones}
                defaultValue={[10]}
                min={10}
                max={210}
                step={10}
              ></Slider>
              <Typography version="p" className="p-8 m-4 w-4 text-center">
                {drones}
              </Typography>
            </div>
          </div>
        </div>
        <div className="col-span-2">
          <DroneMap
            polylines={routes}
            locations={locations}
            display={display}
            center={[44.132, 11.05]}
            zoom={8}
          />
        </div>
        <div className="col-span-1 space-y-4 px-4">
          <DroneKpiGraph
            chartData={diverted}
            title={t("drone.kpi.diverted.title")}
            footer={createFooter()}
            x={t("drone.kpi.x")}
            y={t("drone.kpi.diverted.y")}
          />
          <DroneKpiGraph
            chartData={co2}
            title={t("drone.kpi.co2.title")}
            footer={createFooter()}
            x={t("drone.kpi.x")}
            y={t("drone.kpi.co2.y")}
          />
          <DroneKpiGraph
            chartData={movements}
            title={t("drone.kpi.movements.title")}
            footer={createFooter()}
            x={t("drone.kpi.x")}
            y={t("drone.kpi.movements.y")}
          />
        </div>
      </div>
    </div>
  );
}

export default DroneDashboard;
