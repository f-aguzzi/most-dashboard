import DemandGraph from "@/components/DemandGraph";
import { Label } from "@/components/ui/label";
import { Typography } from "@/components/ui/typography";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { type YearlyData } from "@/components/DemandGraph";

const url = import.meta.env.VITE_URL;
const apiUrl = url + "/demand";

const dummyYearlyData: YearlyData = {
  date: "",
  data: 0,
  forecasted: 0,
  eighty_upper: 0,
  eighty_lower: 0,
  ninetyfive_upper: 0,
  ninetyfive_lower: 0,
};

interface DemandDashboardProps {
  darkMode: boolean;
}

function DemandDashboard(props: DemandDashboardProps) {
  const { t } = useTranslation();

  const [passenger, setPassenger] = useState<[YearlyData]>([dummyYearlyData]);

  const [freight, setFreight] = useState<[YearlyData]>([dummyYearlyData]);

  async function fetchData(endpoint: "passenger" | "freight") {
    try {
      const response = await fetch(`${apiUrl}/${endpoint}`);
      if (!response.ok) throw new Error("Failed to fetch data");
      return response.json();
    } catch {
      return [dummyYearlyData];
    }
  }

  const fetchPassenger = async () => {
    const result = await fetchData("passenger");
    setPassenger(result);
  };

  const fetchFreight = async () => {
    const result = await fetchData("freight");
    setFreight(result);
  };

  useEffect(() => {
    fetchPassenger();
    fetchFreight();
  }, []);

  return (
    <div className="h-max">
      <Typography version="h1" className="m-8 p-8">
        {t("demand.title")}
      </Typography>
      <Label className="mx-8">{t("captions.demand")}</Label>
      <DemandGraph
        className="my-8"
        darkmode={props.darkMode}
        passenger={passenger}
        freight={freight}
      />
    </div>
  );
}

export default DemandDashboard;
