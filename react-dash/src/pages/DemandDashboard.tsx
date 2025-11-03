import TimeFrameSelector from "@/components/TimeFrameSelector";
import { Label } from "@/components/ui/label";
import { Typography } from "@/components/ui/typography";
import { Timer } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

function DemandDashboard() {
  const { t } = useTranslation();

  const [time, setTime] = useState();

  const handleTime = (value: string) => {
    setTime(value);
  };

  return (
    <div className="h-max">
      <Typography version="h1" className="m-8 p-8">
        {t("demand.title")}
      </Typography>
      <Label className="mx-8">{t("captions.demand")}</Label>
      {/* Timeframe */}
      <div className="p-8">
        <div className="flex items-center gap-2">
          <Timer className="h-6 w-6 text-primary" />
          <Typography version="h4">{t("demand.timeframe.title")}</Typography>
        </div>
        <TimeFrameSelector className="py-4" handler={handleTime} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] lg:grid-cols-[1fr_3fr] gap-6 mt-6 h-auto w-auto">
        CONTENT
      </div>
    </div>
  );
}

export default DemandDashboard;
