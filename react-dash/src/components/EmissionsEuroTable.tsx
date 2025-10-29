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

interface EuroKpi {
  IT_19: [string, string, string] | null;
  IT_LF: [string, string, string] | null;
  EU_19: [string, string, string] | null;
  EU_LF: [string, string, string] | null;
  EU_35: [string, string, string] | null;
  EU_FR: [string, string, string] | null;
}

interface EmissionsEuroTableProps {
  caption: string;
  kpi: EuroKpi;
  scenario: string;
}

const EmissionsEuroTable = (props: EmissionsEuroTableProps) => {
  const { t } = useTranslation();

  const fmteur = (value: [string, string, string] | null) => {
    if (value == null)
      return (
        <>
          <TableCell>0 €</TableCell>
          <TableCell>0 €</TableCell>
          <TableCell>0 €</TableCell>
        </>
      );
    return (
      <>
        <TableCell>{value[0]} €</TableCell>
        <TableCell>{value[1]} €</TableCell>
        <TableCell>{value[2]} €</TableCell>
      </>
    );
  };

  return (
    <Table>
      <TableCaption>{props.caption}</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>{t("electric.kpi.metric")}</TableHead>
          <TableHead>ICAP (2024)</TableHead>
          <TableHead>EPA (2023)</TableHead>
          <TableHead> National Bureau of Economic Research </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {props.scenario === "s1" ? (
          <>
            <TableRow>
              <TableCell>{t("emissions.eurokpi.header")} (IT 2019)</TableCell>
              {fmteur(props.kpi.IT_19)}
            </TableRow>
            <TableRow>
              <TableCell>{t("emissions.eurokpi.header")} (IT LF)</TableCell>
              {fmteur(props.kpi.IT_LF)}
            </TableRow>
            <TableRow>
              <TableCell>{t("emissions.eurokpi.header")} (EU 2019)</TableCell>
              {fmteur(props.kpi.EU_19)}
            </TableRow>
            <TableRow>
              <TableCell>{t("emissions.eurokpi.header")} (EU LF)</TableCell>
              {fmteur(props.kpi.EU_LF)}
            </TableRow>
          </>
        ) : (
          <>
            <TableRow>
              <TableCell>{t("emissions.eurokpi.header")} (EU 2035)</TableCell>
              {fmteur(props.kpi.EU_35)}
            </TableRow>
            <TableRow>
              <TableCell>
                {t("emissions.eurokpi.header")} (EU Fully Renewable)
              </TableCell>
              {fmteur(props.kpi.EU_FR)}
            </TableRow>
          </>
        )}
      </TableBody>
    </Table>
  );
};

export default EmissionsEuroTable;
export type { EuroKpi };
