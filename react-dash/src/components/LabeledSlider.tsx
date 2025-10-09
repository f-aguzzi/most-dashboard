import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { Typography } from "./ui/typography";

interface LabeledSliderProps {
  title: string;
  value: number[];
  onValueChange: ((value: number[]) => void) | undefined;
  defaultValue: number[];
  min: number;
  max: number;
}

export default function LabeledSlider(props: LabeledSliderProps) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <Label>{props.title}</Label>
      </div>
      <div className="flex flex-row">
        <Slider
          className="m-8 w-lg mx-8 px-2"
          value={props.value}
          onValueChange={props.onValueChange}
          defaultValue={props.defaultValue}
          min={props.min}
          max={props.max}
          step={1}
          referenceLines={[]}
        ></Slider>
        <Typography version="p" className="p-8 m-4 w-4 text-center text-sm">
          {props.value}
        </Typography>
      </div>
    </div>
  );
}
