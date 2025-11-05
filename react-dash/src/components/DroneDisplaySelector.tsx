import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";

interface DisplaySelectorProps {
  handler: (perimeter: string) => void;
  className?: string;
}

const DroneDisplaySelector = (props: DisplaySelectorProps) => {
  const { t } = useTranslation();

  return (
    <RadioGroup
      defaultValue="flights"
      onValueChange={props.handler}
      className={props.className}
    >
      <div className="flex items-center gap-3">
        <RadioGroupItem value="flights" />
        <Label className="font-normal">{t("drone.display.flights")}</Label>
      </div>
      <div className="flex items-center gap-3">
        <RadioGroupItem value="freight" />
        <Label className="font-normal">{t("drone.display.freight")}</Label>
      </div>
    </RadioGroup>
  );
};

export default DroneDisplaySelector;
