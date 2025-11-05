import { useEffect, useState } from "react";
import {
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type MonthlyData } from "./DemandGraph";

interface MonthlyGraphProps {
  mode: boolean;
  data: [MonthlyData];
  title: string;
  description: string;
  legend: string;
}

interface Colors {
  foreground: string;
  accent: string;
  muted: string;
  eighty: string;
  ninetyfive: string;
  predicted: string;
}

const defaultColors: Colors = {
  foreground: "#222222",
  accent: "#000000",
  muted: "#C2C2C2",
  eighty: "#FF64F7",
  ninetyfive: "#818181",
  predicted: "#3B6CCD",
};

const MonthlyGraph = (props: MonthlyGraphProps) => {
  const [color, setColor] = useState(defaultColors);

  useEffect(() => {
    console.log(props.mode);
    if (props.mode) {
      const cols: Colors = {
        foreground: "#dddddd",
        accent: "#ffffff",
        muted: "#545454FF",
        eighty: "#FF64F7",
        ninetyfive: "#D8D8D8",
        predicted: "#44BEFA",
      };
      setColor(cols);
    } else {
      setColor(defaultColors);
    }
  }, [props.mode]);

  // Transform data to include ranges for confidence intervals
  const chartData = props.data.map((d) => ({
    ...d,
    ci95_range:
      d.ninetyfive_lower !== null && d.ninetyfive_upper !== null
        ? [d.ninetyfive_lower, d.ninetyfive_upper]
        : null,
    ci80_range:
      d.eighty_lower !== null && d.eighty_upper !== null
        ? [d.eighty_lower, d.eighty_upper]
        : null,
  }));

  const formatXAxis = (dateStr: string) => {
    const year = dateStr.split("-")[0];
    const month = dateStr.split("-")[1];
    if (month === "01") return year;
    return "-";
  };

  const yearTicks = props.data
    .filter((d) => {
      const month = d.date.split("-")[1];
      if (month === "01") return true;
    })
    .map((d) => d.date);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) {
      return null;
    }

    try {
      const data = payload[0].payload;
      if (!data) return null;

      return (
        <div className="bg-muted border border-muted-foreground rounded shadow-lg p-2">
          <p className="font-semibold text-foreground">{data.date}</p>
          {data.data !== null && data.data !== undefined && (
            <p className="text-sm">
              <span className="text-foreground">Data: </span>
              <span className="font-medium">
                {Number(data.data).toFixed(1)}
              </span>
            </p>
          )}
          {data.forecasted !== null && data.forecasted !== undefined && (
            <>
              <p className="text-sm">
                <span className="text-blue-600">Forecast: </span>
                <span className="font-medium text-foreground">
                  {Number(data.forecasted).toFixed(1)}
                </span>
              </p>
              {data.eighty_lower !== null && data.eighty_upper !== null && (
                <p className="text-sm">
                  <span className="text-pink-400">80% CI: </span>
                  <span className="font-medium text-foreground">
                    [{Number(data.eighty_lower).toFixed(1)},{" "}
                    {Number(data.eighty_upper).toFixed(1)}]
                  </span>
                </p>
              )}
              {data.ninetyfive_lower !== null &&
                data.ninetyfive_upper !== null && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">95% CI: </span>
                    <span className="font-medium text-foreground">
                      [{Number(data.ninetyfive_lower).toFixed(1)},{" "}
                      {Number(data.ninetyfive_upper).toFixed(1)}]
                    </span>
                  </p>
                )}
            </>
          )}
        </div>
      );
    } catch (error) {
      console.error("Tooltip error:", error);
      return null;
    }
  };

  return (
    <Card className="w-full bg-background dark:bg-accent">
      <CardHeader>
        <CardTitle>{props.title}</CardTitle>
        <p className="text-sm text-foreground">{props.description}</p>
        <p className="text-xs text-foreground">{props.legend}</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 15, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={color.muted} />
            <XAxis
              dataKey="date"
              ticks={yearTicks}
              tickFormatter={formatXAxis}
              stroke={color.muted}
              color={color.muted}
            />
            <YAxis
              label={{
                value: "Number of passengers",
                angle: -90,
                position: "insideLeft",
                fill: color.foreground,
                offset: -3,
              }}
              stroke="#666"
            />
            <Tooltip content={<CustomTooltip />} />

            {/* 95% Confidence Interval */}
            <Area
              type="monotone"
              dataKey="ci95_range"
              stroke="none"
              fill={color.ninetyfive}
              fillOpacity={0.5}
            />

            {/* 80% Confidence Interval */}
            <Area
              type="monotone"
              dataKey="ci80_range"
              stroke="none"
              fill={color.eighty}
              fillOpacity={0.5}
            />

            {/* Actual Data Line */}
            <Line
              type="monotone"
              dataKey="data"
              stroke={color.foreground}
              strokeWidth={1}
              dot={{ fill: color.accent, r: 2 }}
              connectNulls={false}
            />

            {/* Forecast Line */}
            <Line
              type="monotone"
              dataKey="forecasted"
              stroke={color.predicted}
              strokeWidth={1}
              dot={{ fill: color.predicted, r: 2 }}
              connectNulls={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default MonthlyGraph;
