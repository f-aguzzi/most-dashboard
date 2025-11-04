import DemandGraph from "@/components/DemandGraph";
import TimeFrameSelector from "@/components/TimeFrameSelector";
import { Label } from "@/components/ui/label";
import { Typography } from "@/components/ui/typography";
import { Timer } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { type MonthlyData, type YearlyData } from "@/components/DemandGraph";

const url = import.meta.env.VITE_URL;
const apiUrl = url + "/demand";

const dummyMonthData: MonthlyData = {
  date: "",
  data: 0,
  predicted: 0,
  forecasted: 0,
  eighty_lower: 0,
  eighty_upper: 0,
  ninetyfive_lower: 0,
  ninetyfive_upper: 0,
};

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

  const [time, setTime] = useState("monthly");

  const handleTime = (value: string) => {
    setTime(value);
  };

  const [passengerMonthly, setPassengerMonthly] = useState<[MonthlyData]>([
    dummyMonthData,
  ]);
  const [passengerYearly, setPassengerYearly] = useState<[YearlyData]>([
    dummyYearlyData,
  ]);
  const [freightMonthly, setFreightMonthly] = useState<[MonthlyData]>([
    dummyMonthData,
  ]);
  const [freightYearly, setFreightYearly] = useState<[YearlyData]>([
    dummyYearlyData,
  ]);

  async function fetchData(
    endpoint: "passenger" | "freight",
    timeframe: "monthly" | "yearly",
  ) {
    try {
      const response = await fetch(
        `${apiUrl}/${endpoint}?timeframe=${timeframe}`,
      );
      if (!response.ok) throw new Error("Failed to fetch data");
      return response.json();
    } catch {
      if (timeframe === "monthly") return [dummyMonthData];
      else return [dummyYearlyData];
    }
  }

  const fetchPassengerMonthly = async () => {
    const result = await fetchData("passenger", "monthly");
    setPassengerMonthly(result);
  };

  const fetchPassengerYearly = async () => {
    const result = await fetchData("passenger", "yearly");
    setPassengerYearly(result);
  };

  const fetchFreightMonthly = async () => {
    const result = await fetchData("freight", "monthly");
    setFreightMonthly(result);
  };

  const fetchFreightYearly = async () => {
    const result = await fetchData("freight", "yearly");
    setFreightYearly(result);
  };

  useEffect(() => {
    fetchPassengerMonthly();
    fetchPassengerYearly();
    fetchFreightMonthly();
    fetchFreightYearly();
  }, []);

  return (
    <div className="h-max">
      <Typography version="h1" className="m-8 p-8">
        {t("demand.title")}
      </Typography>
      <Label className="mx-8">{t("captions.demand")}</Label>
      {/* Timeframe */}
      <div className="p-8">
        <div className="flex items-center gap-2">
          <Timer className="h-6 w-6 text-primary" />
          <Typography version="h4">{t("demand.timeframe.title")}</Typography>
        </div>
        <TimeFrameSelector className="py-4" handler={handleTime} />
      </div>
      <DemandGraph
        mode={time}
        darkmode={props.darkMode}
        passengerYearly={passengerYearly}
        passengerMonthly={passengerMonthly}
        freightYearly={freightYearly}
        freightMonthly={freightMonthly}
      />
    </div>
  );
}

export default DemandDashboard;
