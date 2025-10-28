import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";

interface EmissionsDisplaySelectorProps {
  handler: (perimeter: string) => void;
  className?: string;
  scenario: string;
  value: string;
}

const EmissionsDisplaySelector = (props: EmissionsDisplaySelectorProps) => {
  const { t } = useTranslation();
  return (
    <RadioGroup
      defaultValue="Frequenza"
      onValueChange={props.handler}
      className={props.className}
      value={props.value}
    >
      <div className="flex items-center gap-3">
        <RadioGroupItem value="Frequenza" />
        <Label className="font-normal">{t("emissions.frequency")}</Label>
      </div>
      {props.scenario === "s1" ? (
        <>
          <div className="flex items-center gap-3">
            <RadioGroupItem value="IT_19" />
            <Label className="font-normal">
              {t("emissions.savings")} (IT 2019)
            </Label>
          </div>
          <div className="flex items-center gap-3">
            <RadioGroupItem value="IT_LF" />
            <Label className="font-normal">
              {t("emissions.savings")} (IT LF)
            </Label>
          </div>
          <div className="flex items-center gap-3">
            <RadioGroupItem value="EU_19" />
            <Label className="font-normal">
              {t("emissions.savings")} (EU 2019)
            </Label>
          </div>
          <div className="flex items-center gap-3">
            <RadioGroupItem value="EU_LF" />
            <Label className="font-normal">
              {t("emissions.savings")} (EU LF)
            </Label>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <RadioGroupItem value="EU_35" />
            <Label className="font-normal">
              {t("emissions.savings")} (EU 2035)
            </Label>
          </div>
          <div className="flex items-center gap-3">
            <RadioGroupItem value="EU_FR" />
            <Label className="font-normal">
              {t("emissions.savings")} (EU Fully Renewable)
            </Label>
          </div>
        </>
      )}
    </RadioGroup>
  );
};

export default EmissionsDisplaySelector;
