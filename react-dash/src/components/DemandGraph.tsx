import { useTranslation } from "react-i18next";
import FreightGraph from "./FreightGraph";
import PassengerGraph from "./PassengerGraph";

interface YearlyData {
  date: string;
  data: number | null;
  forecasted: number | null;
  lower_bound: number | null;
  upper_bound: number | null;
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
        "grid grid-cols-1 md:grid-cols-2 gap-8" +
        (props.className ? " " + props.className : "")
      }
    >
      <div className="grid grid-cols-1 gap-y-4">
        <PassengerGraph
          data={props.passenger}
          mode={props.darkmode}
          title={t("demand.yearly.passenger")}
          description={t("demand.yearly.description.passenger")}
          axisLabel={t("demand.yearly.axis.passenger")}
        />
      </div>
      <div className="grid grid-cols-1 gap-y-4">
        <FreightGraph
          data={props.freight}
          mode={props.darkmode}
          title={t("demand.yearly.freight")}
          description={t("demand.yearly.description.freight")}
          legend={t("demand.yearly.legend")}
          axisLabel={t("demand.yearly.axis.freight")}
        />
      </div>
    </div>
  );
};

export default DemandGraph;

export { type YearlyData };
