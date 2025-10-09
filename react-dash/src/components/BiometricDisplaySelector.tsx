import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface DisplaySelectorProps {
  handler: (perimeter: string) => void;
  className?: string;
}

const BiometricDisplaySelector = (props: DisplaySelectorProps) => {
  return (
    <RadioGroup
      defaultValue="Prezzi"
      onValueChange={props.handler}
      className={props.className}
    >
      <div className="flex items-center gap-3">
        <RadioGroupItem value="Prezzi" />
        <Label className="font-normal">Prezzo del biglietto</Label>
      </div>
      <div className="flex items-center gap-3">
        <RadioGroupItem value="Tempi" />
        <Label className="font-normal">Tempi di processamento</Label>
      </div>
    </RadioGroup>
  );
};

export default BiometricDisplaySelector;
