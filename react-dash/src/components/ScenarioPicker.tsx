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
import { Typography } from "./ui/typography";

interface ScenarioPickerProps {
  handler: (value: string) => void;
  value: string;
}

export function ScenarioPicker(props: ScenarioPickerProps) {
  const handleItemClick = (value: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    props.handler(value);
  };

  return (
    <div className="flex flex-col">
      <div className="flex flex-col my-4">
        <Typography version="h4">Scenario: </Typography>
      </div>
      <Select onValueChange={props.handler} value={props.value}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Scenario..." />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Scenario</SelectLabel>
            <SelectItem value="s1" onMouseDown={handleItemClick("s1")}>
              Scenario 1
            </SelectItem>
            <SelectItem value="s2" onMouseDown={handleItemClick("s2")}>
              Scenario 2
            </SelectItem>
            <SelectItem value="s3" onMouseDown={handleItemClick("s3")}>
              Scenario 3
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      <div className="flex flex-col space-y-2 my-4">
        <Label>Scenario 1 – Heart Aerospace ES-19</Label>
        <Label>Scenario 2 – Elysian E9X</Label>
        <Label>Scenario 3 – Wright Project</Label>
      </div>
    </div>
  );
}

export default ScenarioPicker;
