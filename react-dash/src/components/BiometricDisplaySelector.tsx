import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";

interface DisplaySelectorProps {
  handler: (perimeter: string) => void;
  className?: string;
}

const BiometricDisplaySelector = (props: DisplaySelectorProps) => {
  const { t } = useTranslation();

  return (
    <RadioGroup
      defaultValue="Prezzi"
      onValueChange={props.handler}
      className={props.className}
    >
      <div className="flex items-center gap-3">
        <RadioGroupItem value="Prezzi" />
        <Label className="font-normal">{t("biometric.display.price")}</Label>
      </div>
      <div className="flex items-center gap-3">
        <RadioGroupItem value="Tempi" />
        <Label className="font-normal">{t("biometric.display.time")}</Label>
      </div>
    </RadioGroup>
  );
};

export default BiometricDisplaySelector;
