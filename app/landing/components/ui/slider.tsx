"use client";

import * as React from "react";

type SliderProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "onChange"> & {
  value?: number[];
  defaultValue?: number[];
  onValueChange?: (value: number[]) => void;
};

function cn(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

function toNumber(value: number | string | undefined, fallback: number) {
  if (typeof value === "number") return Number.isFinite(value) ? value : fallback;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

export function Slider({
  value,
  defaultValue,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  className,
  ...props
}: SliderProps) {
  const minValue = toNumber(min, 0);
  const maxValue = toNumber(max, 100);
  const stepValue = toNumber(step, 1);
  const [internalValue, setInternalValue] = React.useState<number>(
    toNumber(defaultValue?.[0] ?? (Array.isArray(value) ? value[0] : minValue), minValue)
  );

  const currentValue = Array.isArray(value) ? value[0] : internalValue;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = Number(event.target.value);
    if (!Number.isFinite(nextValue)) return;
    setInternalValue(nextValue);
    onValueChange?.([nextValue]);
  };

  return (
    <div className={cn("flex w-full items-center", className)}>
      <input
        type="range"
        role="slider"
        value={currentValue}
        min={minValue}
        max={maxValue}
        step={stepValue}
        onChange={handleChange}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted"
        {...props}
      />
    </div>
  );
}
