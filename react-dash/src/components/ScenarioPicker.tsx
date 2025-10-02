import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "./ui/label";

interface ScenarioPickerProps {
  handler: (value: string) => void;
}

export function ScenarioPicker(props: ScenarioPickerProps) {
  return (
    <div className="flex flex-col">
      <Label className="m-4">Scenario: </Label>
      <Select onValueChange={props.handler}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Scenari di evoluzione" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Scenario</SelectLabel>
            <SelectItem value="s1">Scenario 1</SelectItem>
            <SelectItem value="s2">Scenario 2</SelectItem>
            <SelectItem value="s3">Scenario 3</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

export default ScenarioPicker;
