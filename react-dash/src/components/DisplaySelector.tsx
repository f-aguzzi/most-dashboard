import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface DisplaySelectorProps {
  handler: (perimeter: string) => void;
  className?: string;
}

const DisplaySelector = (props: DisplaySelectorProps) => {
  return (
    <RadioGroup
      defaultValue="Frequenza"
      onValueChange={props.handler}
      className={props.className}
    >
      <div className="flex items-center gap-3">
        <RadioGroupItem value="Frequenza" />
        <Label className="font-normal">Frequenza</Label>
      </div>
      <div className="flex items-center gap-3">
        <RadioGroupItem value="Consumo" />
        <Label className="font-normal">Consumo</Label>
      </div>
      <div className="flex items-center gap-3">
        <RadioGroupItem value="Emissioni" />
        <Label className="font-normal">Emissioni</Label>
      </div>
    </RadioGroup>
  );
};

export default DisplaySelector;
