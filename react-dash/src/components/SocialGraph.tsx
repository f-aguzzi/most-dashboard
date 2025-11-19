import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTranslation } from "react-i18next";

interface SocialGraphProps {
  deltaprof: number;
  deltacs: number;
  deltawelfare: number;
}

function SocialGraph(props: SocialGraphProps) {
  const { t } = useTranslation();

  const data = [
    {
      name: t("social.graph.profit"),
      value: props.deltaprof,
    },
    {
      name: t("social.graph.cs"),
      value: props.deltacs,
    },
    {
      name: t("social.graph.welfare"),
      value: props.deltawelfare,
    },
  ];

  const formatNumber = (num: number) => {
    const parts = num.toFixed(2).split(".");
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, "˙");
    return `${integerPart},${parts[1]} USD`;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="font-semibold text-foreground mb-1">
            {payload[0].payload.name}
          </p>
          <p className="text-sm text-muted-foreground">
            {formatNumber(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="w-full mx-auto bg-background text-foreground">
      <CardHeader>
        <CardTitle>{t("social.graph.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis width={140} tickFormatter={formatNumber} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" fill="#ff6b35" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
      <CardFooter>
        <CardContent>{t("social.graph.caption")}</CardContent>
      </CardFooter>
    </Card>
  );
}

export default SocialGraph;
