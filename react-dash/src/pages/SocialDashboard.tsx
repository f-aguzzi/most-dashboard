import SocialGraph from "@/components/SocialGraph";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Typography } from "@/components/ui/typography";
import { Armchair, DollarSign, RulerDimensionLine } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const url = import.meta.env.VITE_URL;
const apiUrl = url + "/socioeconomic";

function SocialDashboard() {
  const { t } = useTranslation();

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
  const [passengers, setPassengers] = useState([20]);
  const handlePassengerChange = (value: []) => {
    setPassengers(value);
  };
  const [committedPassengers, setCommittedPassengers] = useState([20]);
  const commitPassengers = (value: []) => {
    setCommittedPassengers(value);
  };

  // Marginal Cost
  const [mc, setMc] = useState([-10]);
  const handleMcChange = (value: []) => {
    if (value.toString() !== "0") setMc(value);
    else setMc([1]);
  };
  const [committedMc, setCommittedMc] = useState([-10]);
  const commitMc = (value: []) => {
    if (value.toString() !== "0") setCommittedMc(value);
    else setCommittedMc([1]);
  };

  // Results
  const [deltaprof, setDeltaprof] = useState(0);
  const [deltacs, setDeltacs] = useState(0);
  const [deltawelfare, setDeltawelfare] = useState(0);

  const fetchResults = async () => {
    const params = new URLSearchParams({
      distance: committedDistance.toString(),
      seats: committedPassengers.toString(),
      mc: (-committedMc).toString(),
    });

    interface Result {
      totaldeltaprof: number;
      totaldeltacs: number;
      totaldeltawelfare: number;
    }

    const oldDeltaprof = deltaprof;
    const oldDeltacs = deltacs;
    const oldDeltawelfare = deltawelfare;

    try {
      const response = await fetch(apiUrl + `/?${params}`);

      if (!response.ok) throw new Error("Network response was not ok");
      const resultArray: [Result] = await response.json();
      const result: Result = resultArray[0];

      setDeltaprof(Math.round(result.totaldeltaprof * 100) / 100.0);
      setDeltacs(Math.round(result.totaldeltacs * 100) / 100.0);
      setDeltawelfare(Math.round(result.totaldeltawelfare * 100) / 100.0);
    } catch {
      setDeltaprof(oldDeltaprof);
      setDeltacs(oldDeltacs);
      setDeltawelfare(oldDeltawelfare);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [committedPassengers, committedDistance, committedMc]);

  return (
    <div className="h-max">
      <Typography version="h1" className="m-8 p-8">
        {t("social.title")}
      </Typography>
      <Card>
        <Label className="mx-8">{t("captions.social")}</Label>
      </Card>
      {/* Struttura principale */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] lg:grid-cols-[1fr_3fr] gap-8 mt-6 h-auto w-full">
        {/* Colonna sinistra */}
        <Card>
          <div className="flex flex-col space-y-6 h-auto mx-8">
            {/* Distance */}
            <div className="flex items-center gap-2">
              <RulerDimensionLine className="h-6 w-6 text-primary" />
              <Typography version="h4">{t("social.range")}</Typography>
            </div>
            <div className="flex flex-row">
              <Slider
                className="m-8 w-lg mx-8 px-2"
                value={distance}
                onValueChange={handleDistanceChange}
                onValueCommit={commitDistance}
                defaultValue={[400]}
                min={400}
                max={800}
                step={10}
              />
              <Typography version="p" className="p-8 m-4 w-4 text-center">
                {distance}
              </Typography>
            </div>
            {/* Passengers */}
            <div className="flex items-center gap-2">
              <Armchair className="h-6 w-6 text-primary" />
              <Typography version="h4">{t("social.capacity")}</Typography>
            </div>
            <div className="flex flex-row">
              <Slider
                className="m-8 w-lg mx-8 px-2"
                value={passengers}
                onValueChange={handlePassengerChange}
                onValueCommit={commitPassengers}
                defaultValue={[20]}
                min={20}
                max={90}
                step={1}
              ></Slider>
              <Typography version="p" className="p-8 m-4 w-4 text-center">
                {passengers}
              </Typography>
            </div>
            {/* Marginal Cost */}
            <div className="flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-primary" />
              <Typography version="h4">{t("social.mc")}</Typography>
            </div>
            <div className="flex flex-row">
              <Slider
                className="m-8 w-lg mx-8 px-2"
                value={mc}
                onValueChange={handleMcChange}
                onValueCommit={commitMc}
                defaultValue={[-10]}
                min={-10}
                max={10}
                step={1}
              ></Slider>
              <Typography version="p" className="p-8 m-4 w-4 text-center">
                {mc}%
              </Typography>
            </div>
          </div>
        </Card>

        {/* Colonna destra */}
        <div className="flex flex-col w-full">
          <SocialGraph
            deltaprof={deltaprof}
            deltacs={deltacs}
            deltawelfare={deltawelfare}
          />
        </div>
      </div>
    </div>
  );
}

export default SocialDashboard;
