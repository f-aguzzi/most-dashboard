import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTranslation } from "react-i18next";

interface Kpi {
  metric: string;
  value: string;
  percentage: string;
}

interface KpiTableProps {
  caption: string;
  kpis: [Kpi] | null;
}

const KpiTable = (props: KpiTableProps) => {
  const { t } = useTranslation();

  const mapMetricName = (key: string) => {
    if (key === "number") return t("electric.kpi.number");
    if (key === "km") return t("electric.kpi.km");
    if (key === "fuel") return t("electric.kpi.fuel");
    if (key === "co2") return t("electric.kpi.co2");
    if (key === "delta") return t("electric.kpi.delta");
  };

  return (
    <Table>
      <TableCaption>{props.caption}</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>{t("electric.kpi.metric")}</TableHead>
          <TableHead>{t("electric.kpi.amount")}</TableHead>
          <TableHead>%</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {props.kpis === null ? (
          <TableRow />
        ) : (
          props.kpis.map((value, index) => {
            return (
              <TableRow key={index}>
                <TableCell key={index + "T1"}>
                  {mapMetricName(value.metric)}
                </TableCell>
                <TableCell>{value.value}</TableCell>
                <TableCell key={index + "T2"}>{value.percentage}</TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
};

export default KpiTable;
export type { Kpi };
