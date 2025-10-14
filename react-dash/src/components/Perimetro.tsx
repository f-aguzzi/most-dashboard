import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";

interface PerimetroProps {
  handler: (perimeter: string) => void;
  className: string;
}

const Perimetro = (props: PerimetroProps) => {
  const { t } = useTranslation();

  return (
    <RadioGroup
      defaultValue="EU"
      onValueChange={props.handler}
      className={props.className}
    >
      <div className="flex items-center gap-3">
        <RadioGroupItem value="Italia" />
        <Label className="font-normal">{t("electric.perimeter.italy")}</Label>
      </div>
      <div className="flex items-center gap-3">
        <RadioGroupItem value="EU" />
        <Label className="font-normal">{t("electric.perimeter.eu")}</Label>
      </div>
    </RadioGroup>
  );
};

export default Perimetro;
