import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTranslation } from "react-i18next";

interface KpiTableData {
  value: number;
  mass: number;
  mass_perc: number;
  co2: number;
  co2_perc: number;
  movements: number;
  movements_perc: number;
}

interface DroneKpiTableProps {
  data: [KpiTableData] | null;
}

const DroneKpiTable = (props: DroneKpiTableProps) => {
  const { t } = useTranslation();
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead> </TableHead>
          <TableHead colSpan={2}>{t("drone.table.diverted")}</TableHead>
          <TableHead colSpan={2}>{t("drone.table.movements")}</TableHead>
          <TableHead colSpan={2}>{t("drone.table.co2")}</TableHead>
        </TableRow>
        <TableRow>
          <TableHead>{t("drone.table.drones")}</TableHead>
          <TableHead>ton</TableHead>
          <TableHead>%</TableHead>
          <TableHead>no.</TableHead>
          <TableHead>%</TableHead>
          <TableHead>ton</TableHead>
          <TableHead>%</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {props.data != null &&
          props.data.map((row) => (
            <TableRow>
              <TableCell>{row.value}</TableCell>
              <TableCell>{row.mass}</TableCell>
              <TableCell>{row.mass_perc}</TableCell>
              <TableCell>{row.movements}</TableCell>
              <TableCell>{row.movements_perc}</TableCell>
              <TableCell>{row.co2}</TableCell>
              <TableCell>{row.co2_perc}</TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
};

export default DroneKpiTable;

export { type KpiTableData };
