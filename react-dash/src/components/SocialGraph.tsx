import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  return (
    <Card className="w-full mx-auto max-w-2xl bg-background text-foreground">
      <CardHeader>
        <CardTitle>{t("social.graph.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis width={80} />
            <Tooltip />
            <Bar dataKey="value" fill="#ff6b35" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export default SocialGraph;
