import DroneDisplaySelector from "@/components/DroneDisplaySelector";
import { DroneKpiGraph, type KpiData } from "@/components/DroneKpiGraph";
import type { KpiTableData } from "@/components/DroneKpiTable";
import DroneKpiTable from "@/components/DroneKpiTable";
import DroneMap, { type Location, type PolyLine } from "@/components/DroneMap";
import ModelPicker from "@/components/ModelPicker";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Typography } from "@/components/ui/typography";
import { Drone, Eye, Key } from "lucide-react";
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

  const [kpi, setKpi] = useState<[KpiTableData] | null>(null);

  const fetchKpi = async () => {
    try {
      const response = await fetch(apiUrl + "/kpi/table?model=" + model);
      if (!response.ok) throw new Error("Network response was not ok");
      const result = await response.json();
      setKpi(result);
    } catch {
      setKpi(null);
    }
  };

  useEffect(() => {
    fetchRoutes();
    fetchLocations();
    fetchDiverted();
    fetchCo2();
    fetchMovements();
    fetchKpi();
  }, [committedDrones, model]);

  const createFooter = () => {
    return t("drone.kpi.footer.base") + t("drone.kpi.footer." + model);
  };

  return (
    <div className="h-max">
      <Typography version="h1" className="m-8 p-8">
        {t("drone.title")}
      </Typography>
      <Card>
        <Label className="mx-8">{t("captions.drone")}</Label>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr] gap-4 mt-6">
        <Card className="col-span-1 h-auto space-y-4 md:space-y-8 px-6">
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
                step={20}
              ></Slider>
              <Typography version="p" className="p-8 m-4 w-4 text-center">
                {drones}
              </Typography>
            </div>
          </div>
        </Card>
        <div className="flex flex-col space-y-4">
          <Card className="p-4 md:p-8">
            <DroneMap
              polylines={routes}
              locations={locations}
              display={display}
              center={[44.132, 11.05]}
              zoom={8}
            />
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mx-auto">
              <Key className="h-6 w-6 text-primary" />
              <Typography version="h4">{t("drone.table.title")}:</Typography>
            </div>
            <DroneKpiTable data={kpi} />
            <Label className="text-sm text-muted-foreground mx-auto">
              {createFooter()}
            </Label>
          </Card>
        </div>
        <div className="col-span-1 space-y-4 h-auto">
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
