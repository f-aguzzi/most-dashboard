import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

interface ReferenceLine {
  value: number;
  label: string;
  color?: string;
  labelColor?: string;
}

interface SliderProps
  extends React.ComponentProps<typeof SliderPrimitive.Root> {
  referenceLines?: ReferenceLine[];
}

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  referenceLines = [],
  ...props
}: SliderProps) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max],
  );

  // Calculate position percentage for reference lines
  const getPositionPercentage = (lineValue: number) => {
    return ((lineValue - min) / (max - min)) * 100;
  };

  return (
    <div className="relative w-full mt-8 md:mt-0">
      <SliderPrimitive.Root
        data-slot="slider"
        defaultValue={defaultValue}
        value={value}
        min={min}
        max={max}
        className={cn(
          "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col cursor-pointer",
          className,
        )}
        {...props}
      >
        <SliderPrimitive.Track
          data-slot="slider-track"
          className={cn(
            "bg-muted relative grow overflow-visible rounded-full data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5",
          )}
        >
          <SliderPrimitive.Range
            data-slot="slider-range"
            className={cn(
              "bg-primary absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full",
            )}
          />

          {/* Reference Lines */}
          {referenceLines.map((line, index) => {
            const position = getPositionPercentage(line.value);

            return (
              <div key={index}>
                {/* Vertical Line */}
                <div
                  className="absolute top-3 w-0.5 h-8 -translate-y-3 pointer-events-none"
                  style={{
                    left: `${position}%`,
                    backgroundColor: line.color || "#ff6b35",
                    transform: `translateX(-50%) translateY(-12px)`,
                  }}
                />

                {/* Label */}
                <div
                  className="absolute -translate-y-12 sm:-translate-y-1 text-xs font-semibold pointer-events-none whitespace-nowrap -rotate-45 sm:rotate-0"
                  style={{
                    left: `${position}%`,
                    color: line.labelColor || line.color || "#ff6b35",
                    transform: `translateX(-50%) translateY(-24px)`,
                  }}
                >
                  {line.label}
                </div>
              </div>
            );
          })}
        </SliderPrimitive.Track>

        {Array.from({ length: _values.length }, (_, index) => (
          <SliderPrimitive.Thumb
            data-slot="slider-thumb"
            key={index}
            className="border-primary bg-background ring-ring/50 block size-4 shrink-0 rounded-full border shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
          />
        ))}
      </SliderPrimitive.Root>
    </div>
  );
}

export { Slider };
export type { ReferenceLine };
