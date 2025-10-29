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
  number: string;
  number_percentage: string;
  flown: string;
  flown_percentage: string;
  IT_19: string | null;
  IT_LF: string | null;
  EU_19: string | null;
  EU_LF: string | null;
  EU_35: string | null;
  EU_FR: string | null;
}

interface EmissionsKpiTableProps {
  caption: string;
  kpi: Kpi;
  scenario: string;
}

const EmissionsKpiTable = (props: EmissionsKpiTableProps) => {
  const { t } = useTranslation();

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
        <TableRow>
          <TableCell>{t("electric.kpi.number")}</TableCell>
          <TableCell>{props.kpi.number}</TableCell>
          <TableCell>{props.kpi.number_percentage} %</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>{t("electric.kpi.km")}</TableCell>
          <TableCell>{props.kpi.flown} km</TableCell>
          <TableCell>{props.kpi.flown_percentage} %</TableCell>
        </TableRow>

        {props.scenario === "s1" ? (
          <>
            <TableRow>
              <TableCell>{t("emissions.savings")} (IT 2019)</TableCell>
              <TableCell>{props.kpi.IT_19} ton</TableCell>
              <TableCell> </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{t("emissions.savings")} (IT LF)</TableCell>
              <TableCell>{props.kpi.IT_19} ton</TableCell>
              <TableCell> </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{t("emissions.savings")} (EU 2019)</TableCell>
              <TableCell>{props.kpi.EU_19} ton</TableCell>
              <TableCell> </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{t("emissions.savings")} (EU LF)</TableCell>
              <TableCell>{props.kpi.EU_LF} ton</TableCell>
              <TableCell> </TableCell>
            </TableRow>
          </>
        ) : (
          <>
            <TableRow>
              <TableCell>{t("emissions.savings")} (EU 2035)</TableCell>
              <TableCell>{props.kpi.EU_35} ton</TableCell>
              <TableCell> </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                {t("emissions.savings")} (EU Fully Renewable)
              </TableCell>
              <TableCell>{props.kpi.EU_FR} ton</TableCell>
              <TableCell> </TableCell>
            </TableRow>
          </>
        )}
      </TableBody>
    </Table>
  );
};

export default EmissionsKpiTable;
export type { Kpi };
