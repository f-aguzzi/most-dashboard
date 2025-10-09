import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface PerimetroProps {
  handler: (perimeter: string) => void;
  className: string;
}

const Perimetro = (props: PerimetroProps) => {
  return (
    <RadioGroup
      defaultValue="EU"
      onValueChange={props.handler}
      className={props.className}
    >
      <div className="flex items-center gap-3">
        <RadioGroupItem value="Italia" />
        <Label className="font-normal">Italia</Label>
      </div>
      <div className="flex items-center gap-3">
        <RadioGroupItem value="EU" />
        <Label className="font-normal">EU</Label>
      </div>
    </RadioGroup>
  );
};

export default Perimetro;
