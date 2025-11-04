import React, { useEffect, useState } from "react";
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

interface MonthlyGraphProps {
  mode: boolean;
  data: [MonthlyData];
}

const MonthlyGraph = (props: MonthlyGraphProps) => {
  const [foreground, setForeground] = useState("#222222");
  const [accent, setAccent] = useState("#000000");

  useEffect(() => {
    console.log(props.mode);
    if (props.mode) {
      setForeground("#dddddd");
      setAccent("#ffffff");
    } else {
      setForeground("#222222");
      setAccent("#000000");
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
    if (month === "01") return `${year} Jan`;
    return "";
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) {
      return null;
    }

    try {
      const data = payload[0].payload;
      if (!data) return null;

      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-semibold">{data.date}</p>
          {data.data !== null && data.data !== undefined && (
            <p className="text-sm">
              <span className="text-black">Data: </span>
              <span className="font-medium">
                {Number(data.data).toFixed(1)}
              </span>
            </p>
          )}
          {data.forecasted !== null && data.forecasted !== undefined && (
            <>
              <p className="text-sm">
                <span className="text-blue-600">Forecast: </span>
                <span className="font-medium">
                  {Number(data.forecasted).toFixed(1)}
                </span>
              </p>
              {data.eighty_lower !== null && data.eighty_upper !== null && (
                <p className="text-sm">
                  <span className="text-pink-400">80% CI: </span>
                  <span className="font-medium">
                    [{Number(data.eighty_lower).toFixed(1)},{" "}
                    {Number(data.eighty_upper).toFixed(1)}]
                  </span>
                </p>
              )}
              {data.ninetyfive_lower !== null &&
                data.ninetyfive_upper !== null && (
                  <p className="text-sm">
                    <span className="text-gray-400">95% CI: </span>
                    <span className="font-medium">
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
        <CardTitle>Monthly Number of Passengers</CardTitle>
        <p className="text-sm text-foreground">
          (Black Points, in Millions), Fitted and Forecasted Values up to
          December 2035
        </p>
        <p className="text-xs text-foreground">
          Point Estimate in Blue, 80% Confidence Interval in Pink, 95%
          Confidence Interval in Grey
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="2 2" stroke={foreground} />
            <XAxis
              dataKey="date"
              tickFormatter={formatXAxis}
              stroke="#666"
              color={foreground}
            />
            <YAxis
              label={{
                value: "Number of passengers",
                angle: -90,
                position: "insideLeft",
                fill: foreground,
              }}
              stroke="#666"
            />
            <Tooltip content={<CustomTooltip />} />

            {/* 95% Confidence Interval */}
            <Area
              type="monotone"
              dataKey="ci95_range"
              stroke="none"
              fill="#d0d0d0"
              fillOpacity={0.5}
            />

            {/* 80% Confidence Interval */}
            <Area
              type="monotone"
              dataKey="ci80_range"
              stroke="none"
              fill="#ffc0cb"
              fillOpacity={0.5}
            />

            {/* Actual Data Line */}
            <Line
              type="monotone"
              dataKey="data"
              stroke={foreground}
              strokeWidth={1}
              dot={{ fill: accent, r: 2 }}
              connectNulls={false}
            />

            {/* Forecast Line */}
            <Line
              type="monotone"
              dataKey="forecasted"
              stroke="#3b82f6"
              strokeWidth={1}
              dot={{ fill: "#3b82f6", r: 2 }}
              connectNulls={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default MonthlyGraph;
