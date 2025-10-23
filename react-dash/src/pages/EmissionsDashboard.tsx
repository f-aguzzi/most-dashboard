import { Typography } from "@/components/ui/typography";
import { Slider } from "@/components/ui/slider";
import EmissionsMap, {
  type PolyLine,
  type Airport,
} from "@/components/EmissionsMap";
import { useEffect, useState } from "react";
import { Armchair, Eye, RulerDimensionLine } from "lucide-react";
import DisplaySelector from "@/components/DisplaySelector";
import { useTranslation } from "react-i18next";
import { Label } from "@/components/ui/label";
import ScenarioPicker from "@/components/ScenarioPicker";
import { Separator } from "@/components/ui/separator";

const url = import.meta.env.VITE_URL;
const apiUrl = url + "/emissions";

function EmissionsDashboard() {
  const { t } = useTranslation();

  const [flights, setFlights] = useState<[PolyLine] | null | undefined>(null);

  const fetchFlights = async () => {
    try {
      const response = await fetch(
        apiUrl +
          "/routes?distance=" +
          committedDistance +
          "&passengers=" +
          committedPassengers,
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
        apiUrl +
          "/airports?distance=" +
          committedDistance +
          "&passengers=" +
          committedPassengers,
      );
      if (!response.ok) throw new Error("Airport response was not ok");
      const result = await response.json();
      setAirports(result);
    } catch {
      setAirports(null);
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

  // Passengers
  const [passengers, setPassengers] = useState([21]);
  const handlePassengerChange = (value: []) => {
    setPassengers(value);
  };
  const [committedPassengers, setCommittedPassengers] = useState([21]);
  const commitPassengers = (value: []) => {
    setCommittedPassengers(value);
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
      setPassengers([21]);
      setCommittedDistance([400]);
      setCommittedPassengers([21]);
      setScenario("s1");
    } else if (value === "s2") {
      setDistance([800]);
      setPassengers([86]);
      setCommittedDistance([800]);
      setCommittedPassengers([86]);
      setScenario("s2");
    } else if (value === "s3") {
      setDistance([1300]);
      setPassengers([100]);
      setCommittedDistance([1300]);
      setCommittedPassengers([100]);
      setScenario("s3");
    } else {
      setScenario("s4");
      return;
    }
  };

  useEffect(() => {
    const isScenario1 = distance[0] === 400 && passengers[0] === 21;
    const isScenario2 = distance[0] === 800 && passengers[0] === 86;
    const isScenario3 = distance[0] === 1300 && passengers[0] === 100;

    if (!isScenario1 && !isScenario2 && !isScenario3) {
      setScenario("s4");
    } else {
      if (isScenario1) setScenario("s1");
      if (isScenario2) setScenario("s2");
      if (isScenario3) setScenario("s3");
    }

    fetchFlights();
    fetchAirports();
  }, [committedPassengers, committedDistance]);

  return (
    <div className="h-max">
      <Typography version="h1" className="m-8 p-8">
        {t("emissions")}
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
              max={1400}
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
          {/* Passengers */}
          <div className="flex items-center gap-2">
            <Armchair className="h-6 w-6 text-primary" />
            <Typography version="h4">{t("electric.capacity")}</Typography>
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
                  value: 21,
                  label: "Scenario 1",
                  color: "#ff6b35",
                },
                {
                  value: 86,
                  label: "Scenario 2",
                  color: "#7cb342",
                },
                {
                  value: 100,
                  label: "Scenario 3",
                  color: "#1f88e0",
                },
              ]}
            ></Slider>
            <Typography version="p" className="p-8 m-4 w-4 text-center">
              {passengers}
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
            <DisplaySelector handler={handleDisplay} />
          </div>
        </div>
        {/* Mappa */}
        <div className="flex flex-col space-y-4">
          <EmissionsMap
            center={[42.0, 14.0]}
            zoom={6}
            polylines={flights}
            airports={airports}
            display={display}
          />
        </div>
      </div>
    </div>
  );
}

export default EmissionsDashboard;
