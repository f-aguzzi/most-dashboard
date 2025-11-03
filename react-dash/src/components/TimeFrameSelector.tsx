import { useTranslation } from "react-i18next";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

interface TimeFrameSelectorProps {
  handler: (time: string) => void;
  className?: string;
}

const TimeFrameSelector = (props: TimeFrameSelectorProps) => {
  const { t } = useTranslation();

  return (
    <RadioGroup
      defaultValue="monthly"
      onValueChange={props.handler}
      className={props.className}
    >
      <div className="flex items-center gap-3">
        <RadioGroupItem value="monthly" />
        <Label className="font-normal">{t("demand.timeframe.monthly")}</Label>
      </div>
      <div className="flex items-center gap-3">
        <RadioGroupItem value="yearly" />
        <Label className="font-normal">{t("demand.timeframe.yearly")}</Label>
      </div>
    </RadioGroup>
  );
};

export default TimeFrameSelector;
