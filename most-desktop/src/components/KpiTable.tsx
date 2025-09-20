import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Kpi {
  metric: string;
  value: number;
  percentage: number;
}

interface KpiTableProps {
  caption: string;
  kpis: [Kpi] | null;
}

const KpiTable = (props: KpiTableProps) => {
  return (
    <Table>
      <TableCaption>{props.caption}</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Metrica</TableHead>
          <TableHead>Quantità</TableHead>
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
                <TableCell key={index + "T1"}>{value.metric}</TableCell>
                <TableCell>{Math.round(value.value * 100) / 100}</TableCell>
                <TableCell key={index + "T2"}>
                  {Math.round(value.percentage * 100) / 100}
                </TableCell>
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
