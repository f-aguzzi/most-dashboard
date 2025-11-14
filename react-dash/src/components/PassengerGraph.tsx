import { useEffect, useState } from "react";
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type YearlyData } from "./DemandGraph";

interface FreightGraphProps {
  mode: boolean;
  data: [YearlyData];
  title: string;
  description: string;
}

interface Colors {
  foreground: string;
  accent: string;
  muted: string;
  predicted: string;
}

const defaultColors: Colors = {
  foreground: "#222222",
  accent: "#000000",
  muted: "#C2C2C2",
  predicted: "#3B6CCD",
};

const PassengerGraph = (props: FreightGraphProps) => {
  const [color, setColor] = useState(defaultColors);

  useEffect(() => {
    console.log(props.mode);
    if (props.mode) {
      const cols: Colors = {
        foreground: "#dddddd",
        accent: "#ffffff",
        muted: "#545454FF",
        predicted: "#44BEFA",
      };
      setColor(cols);
    } else {
      setColor(defaultColors);
    }
  }, [props.mode]);

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
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart
            data={props.data}
            margin={{ top: 5, right: 30, left: 15, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="2 2" stroke={color.muted} />
            <XAxis dataKey="date" stroke="#666" color={color.foreground} />
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

export default PassengerGraph;
