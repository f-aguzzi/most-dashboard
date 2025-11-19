import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";

interface DisplaySelectorProps {
  handler: (perimeter: string) => void;
  className?: string;
}

const BiometricIdentitySelector = (props: DisplaySelectorProps) => {
  const { t } = useTranslation();

  return (
    <RadioGroup
      defaultValue="Casa"
      onValueChange={props.handler}
      className={props.className}
    >
      <div className="flex items-center gap-2">
        <RadioGroupItem value="Casa" />
        <Label className="font-normal">{t("biometric.biotype.home")}</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="Aeroporto" />
        <Label className="font-normal">{t("biometric.biotype.airport")}</Label>
      </div>
    </RadioGroup>
  );
};

export default BiometricIdentitySelector;
