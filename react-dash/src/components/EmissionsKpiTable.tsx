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
  number: number;
  number_percentage: number;
  flown: number;
  flown_percentage: number;
  IT_19: number | null;
  IT_LF: number | null;
  EU_19: number | null;
  EU_LF: number | null;
  EU_35: number | null;
  EU_FR: number | null;
}

interface EmissionsKpiTableProps {
  caption: string;
  kpi: Kpi;
  scenario: string;
}

const EmissionsKpiTable = (props: EmissionsKpiTableProps) => {
  const { t } = useTranslation();

  const fmtco2 = (value: number | null) => {
    if (value == null) return 0;
    return Math.round(value / 1000);
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
        <TableRow>
          <TableCell>{t("electric.kpi.number")}</TableCell>
          <TableCell>{props.kpi.number}</TableCell>
          <TableCell>
            {Math.round(props.kpi.number_percentage * 100) / 100} %
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>{t("electric.kpi.km")}</TableCell>
          <TableCell>{props.kpi.flown} km</TableCell>
          <TableCell>
            {Math.round(props.kpi.flown_percentage * 100) / 100} %
          </TableCell>
        </TableRow>

        {props.scenario === "s1" ? (
          <>
            <TableRow>
              <TableCell>{t("emissions.savings")} (IT 2019)</TableCell>
              <TableCell>{fmtco2(props.kpi.IT_19)} ton</TableCell>
              <TableCell> </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{t("emissions.savings")} (IT LF)</TableCell>
              <TableCell>{fmtco2(props.kpi.IT_19)} ton</TableCell>
              <TableCell> </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{t("emissions.savings")} (EU 2019)</TableCell>
              <TableCell>{fmtco2(props.kpi.EU_19)} ton</TableCell>
              <TableCell> </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{t("emissions.savings")} (EU LF)</TableCell>
              <TableCell>{fmtco2(props.kpi.EU_LF)} ton</TableCell>
              <TableCell> </TableCell>
            </TableRow>
          </>
        ) : (
          <>
            <TableRow>
              <TableCell>{t("emissions.savings")} (EU 2035)</TableCell>
              <TableCell>{fmtco2(props.kpi.EU_35)} ton</TableCell>
              <TableCell> </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                {t("emissions.savings")} (EU Fully Renewable)
              </TableCell>
              <TableCell>{fmtco2(props.kpi.EU_FR)} ton</TableCell>
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
