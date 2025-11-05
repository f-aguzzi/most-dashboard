import { Label } from "@/components/ui/label";
import { Typography } from "@/components/ui/typography";
import { useTranslation } from "react-i18next";

function DroneDashboard() {
  const { t } = useTranslation();

  return (
    <div className="h-max">
      <Typography version="h1" className="m-8 p-8">
        {t("drone.title")}
      </Typography>
      <Label className="mx-8">{t("captions.drone")}</Label>
    </div>
  );
}

export default DroneDashboard;
