"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export const description = "A line chart";

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

interface KpiData {
  value: number;
  data: number;
}

interface DrokeKpiGraphProps {
  chartData: [KpiData] | undefined;
  title: string;
  footer: string;
  x: string;
  y: string;
}

export function DroneKpiGraph(props: DrokeKpiGraphProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{props.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={props.chartData}
            margin={{
              left: 13,
              right: 8,
              bottom: 13,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="value"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value}
              label={{
                value: props.x,
                position: "insideBottom",
                offset: -7,
              }}
            />
            <YAxis
              dataKey="data"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              tickFormatter={(value) => value}
              label={{
                value: props.y,
                angle: -90,
                position: "outerLeft",
                width: 200,
                dx: -20,
              }}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Line
              dataKey="data"
              type="natural"
              stroke="var(--color-desktop)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="text-muted-foreground leading-none">{props.footer}</div>
      </CardFooter>
    </Card>
  );
}

export { type KpiData };
