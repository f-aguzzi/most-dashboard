import { Label } from "@/components/ui/label";
import { Typography } from "@/components/ui/typography";
import { useTranslation } from "react-i18next";

function DemandDashboard() {
  const { t } = useTranslation();

  return (
    <div className="h-max">
      <Typography version="h1" className="m-8 p-8">
        {t("demand.title")}
      </Typography>
      <Label className="mx-8">{t("captions.demand")}</Label>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] lg:grid-cols-[1fr_3fr] gap-6 mt-6 h-auto w-auto">
        CONTENT
      </div>
    </div>
  );
}

export default DemandDashboard;
