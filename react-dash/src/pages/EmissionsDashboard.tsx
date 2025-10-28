import { Typography } from "@/components/ui/typography";
import { Slider } from "@/components/ui/slider";
import EmissionsMap, {
  type PolyLine,
  type Airport,
} from "@/components/EmissionsMap";
import { useEffect, useState } from "react";
import { Eye, RulerDimensionLine } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Label } from "@/components/ui/label";
import ScenarioPicker from "@/components/ScenarioPicker";
import { Separator } from "@/components/ui/separator";
import EmissionsDisplaySelector from "@/components/EmissionsDisplaySelector";
import EmissionsKpiTable, { type Kpi } from "@/components/EmissionsKpiTable";

const url = import.meta.env.VITE_URL;
const apiUrl = url + "/emissions";

const dummyKpi: Kpi = {
  number: 0,
  number_percentage: 0,
  flown: 0,
  flown_percentage: 0,
  IT_19: 0,
  IT_LF: 0,
  EU_19: 0,
  EU_LF: 0,
  EU_35: 0,
  EU_FR: 0,
};

function EmissionsDashboard() {
  const { t } = useTranslation();

  const [flights, setFlights] = useState<[PolyLine] | null | undefined>(null);

  const fetchFlights = async () => {
    try {
      const response = await fetch(
        apiUrl + "/routes?distance=" + committedDistance,
      );
      if (!response.ok) throw new Error("Route response was not ok");
      const result = await response.json();
      setFlights(result);
    } catch {
      setFlights(null);
    }
  };

  const [airports, setAirports] = useState<[Airport] | null | undefined>(null);

  const fetchAirports = async () => {
    try {
      const response = await fetch(
        apiUrl + "/airports?distance=" + committedDistance,
      );
      if (!response.ok) throw new Error("Airport response was not ok");
      const result = await response.json();
      setAirports(result);
    } catch {
      setAirports(null);
    }
  };

  const [kpi, setKpi] = useState(dummyKpi);

  const fetchKpi = async () => {
    try {
      const response = await fetch(
        apiUrl + "/kpi?distance=" + committedDistance,
      );
      if (!response.ok) throw new Error("KPI response was not ok");
      const result = await response.json();
      setKpi(result);
    } catch {
      setKpi(dummyKpi);
    }
  };

  // Scenario
  const [scenario, setScenario] = useState("s1");

  // Distance
  const [distance, setDistance] = useState([400]);
  const handleDistanceChange = (value: []) => {
    setDistance(value);
  };
  const [committedDistance, setCommittedDistance] = useState([400]);
  const commitDistance = (value: []) => {
    setCommittedDistance(value);
  };

  // Display
  const [display, setDisplay] = useState("Frequenza");
  const handleDisplay = async (value: string) => {
    setDisplay(value);
  };

  // Scenario handler
  const scenarioHandler = (value: string) => {
    if (value === "s1") {
      setDistance([400]);
      setCommittedDistance([400]);
      setScenario("s1");
    } else if (value === "s2") {
      setDistance([800]);
      setCommittedDistance([800]);
      setScenario("s2");
    } else {
      setDistance([1300]);
      setCommittedDistance([1300]);
      setScenario("s3");
    }
  };

  useEffect(() => {
    const isScenario1 = distance[0] <= 400;
    const isScenario2 = distance[0] > 400 && distance[0] <= 800;
    const isScenario3 = distance[0] > 800;

    if (isScenario1) setScenario("s1");
    if (isScenario2) setScenario("s2");
    if (isScenario3) setScenario("s3");

    if (isScenario1 && (display === "EU_35" || display === "EU_FR"))
      setDisplay("IT_19");

    if (!isScenario1 && display !== "Frequenza") setDisplay("EU_35");

    fetchFlights();
    fetchAirports();
    fetchKpi();
  }, [committedDistance]);

  return (
    <div className="h-max">
      <Typography version="h1" className="m-8 p-8">
        {t("emissions.title")}
      </Typography>
      <Label className="mx-8">{t("captions.emissions")}</Label>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] lg:grid-cols-[1fr_3fr] gap-6 mt-6 h-auto w-auto">
        <div className="flex flex-col space-y-6 h-auto mx-8">
          {/* Scenario Picker */}
          <ScenarioPicker handler={scenarioHandler} value={scenario} />
          <Separator />
          {/* Distance */}
          <div className="flex items-center gap-2">
            <RulerDimensionLine className="h-6 w-6 text-primary" />
            <Typography version="h4">{t("electric.range")}</Typography>
          </div>
          <div className="flex flex-row">
            <Slider
              className="m-8 w-lg mx-8 px-2"
              value={distance}
              onValueChange={handleDistanceChange}
              onValueCommit={commitDistance}
              defaultValue={[400]}
              min={200}
              max={1300}
              step={1}
              referenceLines={[
                {
                  value: 400,
                  label: "Scenario 1",
                  color: "#ff6b35",
                },
                {
                  value: 800,
                  label: "Scenario 2",
                  color: "#7cb342",
                },
                {
                  value: 1300,
                  label: "Scenario 3",
                  color: "#1f88e0",
                },
              ]}
            />
            <Typography version="p" className="p-8 m-4 w-4 text-center">
              {distance}
            </Typography>
          </div>
          <Separator />
          {/* Display mode */}
          <div className="flex flex-col gap-y-2">
            <div className="flex items-center gap-2">
              <Eye className="h-6 w-6 text-primary" />
              <Typography version="h4">
                {t("electric.display.title")}
              </Typography>
            </div>
            <EmissionsDisplaySelector
              handler={handleDisplay}
              scenario={scenario}
              value={display}
            />
          </div>
          {/* Tabella KPI */}
          <EmissionsKpiTable
            scenario={scenario}
            kpi={kpi}
            caption={t("emissions.kpi")}
          />
        </div>
        {/* Mappa */}
        <div className="flex flex-col space-y-4">
          <EmissionsMap
            center={[42.0, 14.0]}
            zoom={6}
            polylines={flights}
            airports={airports}
            display={display}
            scenario={scenario}
          />
        </div>
      </div>
    </div>
  );
}

export default EmissionsDashboard;
