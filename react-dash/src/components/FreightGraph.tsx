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
import { type YearlyData } from "./DemandGraph";
import { useTranslation } from "react-i18next";

interface FreightGraphProps {
  mode: boolean;
  data: [YearlyData];
  title: string;
  description: string;
  legend: string;
  axisLabel: string;
}

interface Colors {
  foreground: string;
  accent: string;
  muted: string;
  confidence: string;
  predicted: string;
}

const defaultColors: Colors = {
  foreground: "#222222",
  accent: "#000000",
  muted: "#C2C2C2",
  confidence: "#FF64F7",
  predicted: "#3B6CCD",
};

const FreightGraph = (props: FreightGraphProps) => {
  const { t } = useTranslation();

  const [color, setColor] = useState(defaultColors);

  useEffect(() => {
    console.log(props.mode);
    if (props.mode) {
      const cols: Colors = {
        foreground: "#dddddd",
        accent: "#ffffff",
        muted: "#545454FF",
        confidence: "#FF64F7",
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
    ci_range:
      d.lower_bound !== null && d.upper_bound !== null
        ? [d.lower_bound, d.upper_bound]
        : null,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) {
      return null;
    }

    try {
      const data = payload[0].payload;
      if (!data) return null;

      return (
        <div className="bg-background p-3 border border-muted-foreground text-foreground rounded shadow-lg">
          <p className="font-semibold">{data.date}</p>
          {data.data !== null && data.data !== undefined && (
            <p className="text-sm">
              <span>{props.axisLabel}: </span>
              <span className="font-medium">
                {Number(data.data).toFixed(1)} mln ton
              </span>
            </p>
          )}
          {data.forecasted !== null && data.forecasted !== undefined && (
            <>
              <p className="text-sm">
                <span className="text-blue-600 dark:text-blue-400">
                  {props.axisLabel} ({t("demand.forecast")}):{" "}
                </span>
                <span className="font-medium">
                  {Number(data.forecasted).toFixed(1)} k ton
                </span>
              </p>
              {data.lower_bound !== null && data.upper_bound !== null && (
                <p className="text-sm">
                  <span className="text-pink-400 dark:text-pink-300">
                    {t("demand.CI")}:{" "}
                  </span>
                  <span className="font-medium">
                    [{Number(data.lower_bound).toFixed(1)},{" "}
                    {Number(data.upper_bound).toFixed(1)}] k ton
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
            <CartesianGrid strokeDasharray="2 2" stroke={color.muted} />
            <XAxis dataKey="date" stroke="#666" color={color.foreground} />
            <YAxis
              label={{
                value: props.axisLabel,
                angle: -90,
                position: "insideLeft",
                fill: color.foreground,
                offset: -3,
              }}
              stroke="#666"
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Confidence Interval */}
            <Area
              type="monotone"
              dataKey="ci_range"
              stroke="none"
              fill={color.confidence}
              fillOpacity={0.5}
            />

            {/* Actual Data Line */}
            <Line
              type="monotone"
              dataKey="data"
              stroke={color.foreground}
              strokeWidth={1}
              dot={{ fill: color.accent, r: 2 }}
              connectNulls={true}
            />

            {/* Forecast Line */}
            <Line
              type="monotone"
              dataKey="forecasted"
              stroke={color.predicted}
              strokeWidth={1}
              dot={{ fill: color.predicted, r: 2 }}
              connectNulls={true}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default FreightGraph;
