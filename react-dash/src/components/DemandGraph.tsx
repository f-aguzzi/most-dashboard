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
}

const DemandGraph = (props: DemandGraphProps) => {
  if (props.mode === "monthly")
    return (
      <div className="columns-2">
        <Typography version="h3">Passenger Monthly</Typography>
        <Typography version="h3">Freight Monthly</Typography>
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
