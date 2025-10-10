import { Typography } from "@/components/ui/typography";
import { Slider } from "@/components/ui/slider";
import EmissionsMap, {
  type PolyLine,
  type Airport,
} from "@/components/EmissionsMap";
import { useEffect, useState } from "react";
import { Armchair, RulerDimensionLine } from "lucide-react";

const url = import.meta.env.VITE_URL;
const apiUrl = url + "/emissions";

function EmissionsDashboard() {
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

  // Distance
  const [distance, setDistance] = useState([307]);
  const handleDistanceChange = (value: []) => {
    setDistance(value);
  };
  const [committedDistance, setCommittedDistance] = useState([307]);
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

  useEffect(() => {
    fetchFlights();
    fetchAirports();
  }, [committedPassengers, committedDistance]);

  return (
    <div className="h-max">
      <Typography version="h1" className="m-8 p-8">
        Electric Aircraft - Emissioni per scenario
      </Typography>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] lg:grid-cols-[1fr_3fr] gap-6 mt-6 h-auto w-auto">
        <div className="flex flex-col space-y-6 h-auto mx-8">
          {/* Distance */}
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
              defaultValue={[307]}
              min={200}
              max={1050}
              step={1}
              referenceLines={[
                {
                  value: 307,
                  label: "Scenario 1",
                  color: "#ff6b35",
                },
                {
                  value: 787,
                  label: "Scenario 2",
                  color: "#7cb342",
                },
                {
                  value: 1044,
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
        </div>
        {/* Mappa */}
        <div className="flex flex-col space-y-4">
          <EmissionsMap
            center={[42.0, 14.0]}
            zoom={6}
            polylines={flights}
            airports={airports}
          />
        </div>
      </div>
    </div>
  );
}

export default EmissionsDashboard;
