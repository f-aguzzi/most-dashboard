import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";

interface DisplaySelectorProps {
  handler: (perimeter: string) => void;
  className?: string;
}

const DisplaySelector = (props: DisplaySelectorProps) => {
  const { t } = useTranslation();
  return (
    <RadioGroup
      defaultValue="Frequenza"
      onValueChange={props.handler}
      className={props.className}
    >
      <div className="flex items-center gap-3">
        <RadioGroupItem value="Frequenza" />
        <Label className="font-normal">{t("electric.display.frequency")}</Label>
      </div>
      <div className="flex items-center gap-3">
        <RadioGroupItem value="Consumo" />
        <Label className="font-normal">{t("electric.display.usage")}</Label>
      </div>
      <div className="flex items-center gap-3">
        <RadioGroupItem value="Emissioni" />
        <Label className="font-normal">{t("electric.display.emissions")}</Label>
      </div>
    </RadioGroup>
  );
};

export default DisplaySelector;
