import { Typography } from "@/components/ui/typography";
import EmissionsMap, { type PolyLine } from "@/components/EmissionsMap";
import ScenarioPicker from "@/components/ScenarioPicker";
import { useEffect, useState } from "react";

const url = import.meta.env.VITE_URL;
const apiUrl = url + "/emissions";

function EmissionsDashboard() {
  const [scenario, setScenario] = useState("s2");

  const handleScenario = (value: string) => {
    setScenario(value);
  };

  const [flights, setFlights] = useState<[PolyLine] | null | undefined>(null);

  const fetchFlights = async () => {
    try {
      const response = await fetch(apiUrl + "/routes?scenario=" + scenario);
      if (!response.ok) throw new Error("Network response was not ok");
      const result = await response.json();
      setFlights(result);
    } catch {
      setFlights(null);
    }
  };

  useEffect(() => {
    fetchFlights();
  }, [scenario]);

  return (
    <div className="h-max">
      <Typography version="h1" className="m-8 p-8">
        Electric Aircraft - Emissioni per scenario
      </Typography>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] lg:grid-cols-[1fr_3fr] gap-6 mt-6 h-auto w-auto">
        <div className="flex flex-col space-y-6 h-auto mx-8">
          {/* Scenario */}
          <ScenarioPicker handler={handleScenario} />
        </div>
        {/* Mappa */}
        <div className="flex flex-col space-y-4">
          <EmissionsMap center={[42.0, 14.0]} zoom={6} polylines={flights} />
        </div>
      </div>
    </div>
  );
}

export default EmissionsDashboard;
