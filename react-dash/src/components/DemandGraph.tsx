import MonthlyGraph from "./MonthlyGraph";
import { Typography } from "./ui/typography";

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
  if (props.mode === "monthly")
    return (
      <div className="grid grid-cols-2 gap-x-8">
        <div className="grid grid-cols-1 gap-y-4">
          <Typography version="h3">Passenger Monthly</Typography>
          <MonthlyGraph data={props.passengerMonthly} mode={props.darkmode} />
        </div>
        <div className="grid grid-cols-1 gap-y-4">
          <Typography version="h3">Freight Monthly</Typography>
          <MonthlyGraph data={props.freightMonthly} mode={props.darkmode} />
        </div>
      </div>
    );
  else
    return (
      <div className="columns-2">
        <Typography version="h3">Passenger Yearly</Typography>
        <Typography version="h3">Freight Yearly</Typography>
      </div>
    );
};

export default DemandGraph;

export { type MonthlyData, type YearlyData };
