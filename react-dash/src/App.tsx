import "./App.css";
import { Typography } from "./components/ui/typography";
import { Slider } from "./components/ui/slider";
import LeafletMap from "./components/map";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function App() {
  const [passengers, setPassengers] = useState([30]);
  const [distance, setDistance] = useState([80]);

  const handlePassengerChange = (value: []) => {
    setPassengers(value);
    fetchData();
    fetchKpi();
  };

  const handleDistanceChange = (value: []) => {
    setDistance(value);
    fetchData();
    fetchKpi();
  };

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await fetch(
        "http://localhost:8000/routes_by?seats=" +
          passengers +
          "&distance=" +
          distance,
      );
      if (!response.ok) throw new Error("Network response was not ok");
      const result = await response.json();
      console.log(result);
      setData(result);
    } finally {
      setLoading(false);
    }
  };

  const [kpi, setKpi] = useState(null);
  const [kpiLoading, setKpiLoading] = useState(true);

  const fetchKpi = async () => {
    try {
      const response = await fetch(
        "http://localhost:8000/kpi?seats=" +
          passengers +
          "&distance=" +
          distance,
      );
      if (!response.ok) throw new Error("Network response was not ok");
      const result = await response.json();
      console.log(result);
      setKpi(result);
    } finally {
      setKpiLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchKpi();
  }, []);

  return (
    <div className="h-screen w-screen bg-background text-foreground p-8 color-scheme: dark">
      <Typography version="h1" className="m-16 p-8">
        MOST Dashboard
      </Typography>
      <div className="grid grid-cols-2 gap-8 mt-8 h-auto">
        <div className="flex flex-col space-y-16 h-auto">
          {/* Autonomia */}
          <div className="mx-16">
            <Typography version="h4">Autonomia: </Typography>
            <div className="flex flex-row">
              <Slider
                className="m-8 w-lg mx-16 px-2"
                value={distance}
                onValueChange={handleDistanceChange}
                defaultValue={[80]}
                min={1}
                max={300}
                step={1}
              ></Slider>
              <Typography version="p" className="p-8 m-8">
                {distance}
              </Typography>
            </div>
          </div>
          {/* Numero di passeggeri */}
          <div className="mx-16">
            <Typography version="h4">Numero di passeggeri: </Typography>
            <div className="flex flex-row">
              <Slider
                className="m-8 w-lg mx-16 px-2"
                value={passengers}
                onValueChange={handlePassengerChange}
                defaultValue={[20]}
                min={1}
                max={40}
                step={1}
              ></Slider>
              <Typography version="p" className="p-8 m-8">
                {passengers}
              </Typography>
            </div>
          </div>
        </div>
        <div className="flex flex-col space-y-4">
          <LeafletMap polylines={loading && data != null ? [] : data} />
        </div>
      </div>
      <div className="p-8">
        <Table>
          <TableCaption>
            KPI relativi all&apos;impiego di aeromobili elettrici.
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Metrica</TableHead>
              <TableHead>Quantità</TableHead>
              <TableHead>%</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Numero dei voli */}
            <TableRow>
              <TableCell>Numero voli</TableCell>
              <TableCell>{kpiLoading ? " " : kpi.flight_number}</TableCell>
              <TableCell>
                {kpiLoading
                  ? " "
                  : Math.round(kpi.flight_percentage * 100) / 100}
              </TableCell>
            </TableRow>
            {/* Km percorsi */}
            <TableRow>
              <TableCell>Km volati (migliaia)</TableCell>
              <TableCell>
                {kpiLoading ? " " : Math.round(kpi.km / 1000)}
              </TableCell>
              <TableCell>
                {kpiLoading ? " " : Math.round(kpi.km_percentage * 100) / 100}
              </TableCell>
            </TableRow>
            {/* Carburante risparmiato */}
            <TableRow>
              <TableCell>Carburante risparmiato</TableCell>
              <TableCell>
                {kpiLoading ? " " : Math.round(kpi.saved_fuel)}
              </TableCell>
              <TableCell>
                {kpiLoading
                  ? " "
                  : Math.round(kpi.saved_fuel_percentage * 100) / 100}
              </TableCell>
            </TableRow>
            {/* CO2 risparmiata */}
            <TableRow>
              <TableCell>CO2 risparmiata</TableCell>
              <TableCell>
                {kpiLoading ? " " : Math.round(kpi.saved_co2)}
              </TableCell>
              <TableCell>
                {kpiLoading
                  ? " "
                  : Math.round(kpi.saved_co2_percentage * 100) / 100}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default App;
