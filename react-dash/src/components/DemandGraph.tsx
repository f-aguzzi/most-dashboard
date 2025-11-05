import { useTranslation } from "react-i18next";
import MonthlyGraph from "./MonthlyGraph";
import YearlyGraph from "./YearlyGraph";

interface MonthlyData {
  date: string;
  data: number | null;
  predicted: number | null;
  forecasted: number | null;
  eighty_lower: number | null;
  eighty_upper: number | null;
  ninetyfive_lower: number | null;
  ninetyfive_upper: number | null;
}

interface YearlyData {
  date: string;
  data: number | null;
  forecasted: number | null;
  eighty_lower: number | null;
  eighty_upper: number | null;
  ninetyfive_lower: number | null;
  ninetyfive_upper: number | null;
}

interface DemandGraphProps {
  passengerMonthly: [MonthlyData];
  passengerYearly: [YearlyData];
  freightMonthly: [MonthlyData];
  freightYearly: [YearlyData];
  mode: string;
  darkmode: boolean;
}

const DemandGraph = (props: DemandGraphProps) => {
  const { t } = useTranslation();

  if (props.mode === "monthly")
    return (
      <div className="grid grid-cols-2 gap-x-8">
        <div className="grid grid-cols-1 gap-y-4">
          <MonthlyGraph
            data={props.passengerMonthly}
            mode={props.darkmode}
            title={t("demand.monthly.passenger")}
            description={t("demand.monthly.description")}
            legend={t("demand.monthly.legend")}
          />
        </div>
        <div className="grid grid-cols-1 gap-y-4">
          <MonthlyGraph
            data={props.freightMonthly}
            mode={props.darkmode}
            title={t("demand.monthly.freight")}
            description={t("demand.monthly.description")}
            legend={t("demand.monthly.legend")}
          />
        </div>
      </div>
    );
  else
    return (
      <div className="grid grid-cols-2 gap-x-8">
        <div className="grid grid-cols-1 gap-y-4">
          <YearlyGraph
            data={props.passengerYearly}
            mode={props.darkmode}
            title={t("demand.yearly.passenger")}
            description={t("demand.yearly.description")}
            legend={t("demand.yearly.legend")}
          />
        </div>
        <div className="grid grid-cols-1 gap-y-4">
          <YearlyGraph
            data={props.freightYearly}
            mode={props.darkmode}
            title={t("demand.yearly.freight")}
            description={t("demand.yearly.description")}
            legend={t("demand.yearly.legend")}
          />
        </div>
      </div>
    );
};

export default DemandGraph;

export { type MonthlyData, type YearlyData };
