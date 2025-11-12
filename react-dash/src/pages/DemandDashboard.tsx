import DemandGraph from "@/components/DemandGraph";
import { Label } from "@/components/ui/label";
import { Typography } from "@/components/ui/typography";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { type YearlyData } from "@/components/DemandGraph";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";

const url = import.meta.env.VITE_URL;
const apiUrl = url + "/demand";

const dummyYearlyData: YearlyData = {
  date: "",
  data: 0,
  forecasted: 0,
  eighty_upper: 0,
  eighty_lower: 0,
  ninetyfive_upper: 0,
  ninetyfive_lower: 0,
};

interface DemandDashboardProps {
  darkMode: boolean;
}

function DemandDashboard(props: DemandDashboardProps) {
  const { t } = useTranslation();

  const [passenger, setPassenger] = useState<[YearlyData]>([dummyYearlyData]);

  const [freight, setFreight] = useState<[YearlyData]>([dummyYearlyData]);

  async function fetchData(endpoint: "passenger" | "freight") {
    try {
      const response = await fetch(`${apiUrl}/${endpoint}`);
      if (!response.ok) throw new Error("Failed to fetch data");
      return response.json();
    } catch {
      return [dummyYearlyData];
    }
  }

  const fetchPassenger = async () => {
    const result = await fetchData("passenger");
    setPassenger(result);
  };

  const fetchFreight = async () => {
    const result = await fetchData("freight");
    setFreight(result);
  };

  useEffect(() => {
    fetchPassenger();
    fetchFreight();
  }, []);

  const KpiTable = () => {
    return (
      <>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead> </TableHead>
              <TableHead colSpan={2}>
                <b>{t("demand.table.passengers")}</b>
              </TableHead>
              <TableHead colSpan={2}>
                <b>{t("demand.table.freight")}</b>
              </TableHead>
            </TableRow>
            <TableRow>
              <TableHead> </TableHead>
              <TableHead>
                <b>mln</b>
              </TableHead>
              <TableHead>
                <b>% vs 2024</b>
              </TableHead>
              <TableHead>
                <b>K tons</b>
              </TableHead>
              <TableHead>
                <b>% vs 2024</b>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>2030</TableCell>
              <TableCell>249,1</TableCell>
              <TableCell>13,7%</TableCell>
              <TableCell>1.430</TableCell>
              <TableCell>14,5%</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>2035</TableCell>
              <TableCell>265,4</TableCell>
              <TableCell>21,1%</TableCell>
              <TableCell>1.589</TableCell>
              <TableCell>27,2%</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </>
    );
  };

  return (
    <div className="h-max">
      <Typography version="h1" className="m-8 p-8">
        {t("demand.title")}
      </Typography>
      <Card>
        <Label className="mx-8">{t("captions.demand")}</Label>
      </Card>
      <DemandGraph
        className="my-8"
        darkmode={props.darkMode}
        passenger={passenger}
        freight={freight}
      />
      <Card className="p-4 w-auto">
        <KpiTable />
      </Card>
    </div>
  );
}

export default DemandDashboard;
