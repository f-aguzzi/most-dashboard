import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface DisplaySelectorProps {
  handler: (perimeter: string) => void;
  className?: string;
}

const BiometricIdentitySelector = (props: DisplaySelectorProps) => {
  return (
    <RadioGroup
      defaultValue="Casa"
      onValueChange={props.handler}
      className={props.className}
    >
      <div className="flex items-center gap-3">
        <RadioGroupItem value="Casa" />
        <Label className="font-normal">A casa</Label>
      </div>
      <div className="flex items-center gap-3">
        <RadioGroupItem value="Aeroporto" />
        <Label className="font-normal">In aeroporto</Label>
      </div>
    </RadioGroup>
  );
};

export default BiometricIdentitySelector;
