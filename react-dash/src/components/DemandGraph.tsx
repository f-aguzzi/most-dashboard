import { useTranslation } from "react-i18next";
import YearlyGraph from "./YearlyGraph";

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
  className?: string;
  passenger: [YearlyData];
  freight: [YearlyData];
  darkmode: boolean;
}

const DemandGraph = (props: DemandGraphProps) => {
  const { t } = useTranslation();

  return (
    <div
      className={
        "grid grid-cols-2 gap-x-8" +
        (props.className ? " " + props.className : "")
      }
    >
      <div className="grid grid-cols-1 gap-y-4">
        <YearlyGraph
          data={props.passenger}
          mode={props.darkmode}
          title={t("demand.yearly.passenger")}
          description={t("demand.yearly.description")}
          legend={t("demand.yearly.legend")}
        />
      </div>
      <div className="grid grid-cols-1 gap-y-4">
        <YearlyGraph
          data={props.freight}
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

export { type YearlyData };
