import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
	value?: number[];
	max?: number;
	step?: number;
	onValueChange?: (value: number[]) => void;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
	({ className, value = [0], max = 100, step = 1, onValueChange, ...props }, ref) => {
		const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			const newValue = [parseFloat(e.target.value)];
			onValueChange?.(newValue);
		};

		return (
			<input
				type="range"
				min={0}
				max={max}
				step={step}
				value={value[0] ?? 0}
				onChange={handleChange}
				className={cn(
					"w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer",
					"accent-primary",
					className
				)}
				ref={ref}
				{...props}
			/>
		);
	}
);
Slider.displayName = "Slider";

export { Slider }

