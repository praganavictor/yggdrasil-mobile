import { Pressable, View } from "react-native";
import { Label } from "@/components/ui/Label";
import { Text } from "@/components/ui/Text";
import { cn } from "@/lib/utils";

export interface RadioOption<T extends string> {
	value: T;
	label: string;
}

interface RadioGroupProps<T extends string> {
	value: T;
	onValueChange: (value: T) => void;
	options: RadioOption<T>[];
	label?: string;
	disabled?: boolean;
	/** Distribui as opções lado a lado — bom para 2 ou 3 escolhas curtas. */
	horizontal?: boolean;
	className?: string;
}

export function RadioGroup<T extends string>({
	value,
	onValueChange,
	options,
	label,
	disabled,
	horizontal = false,
	className,
}: RadioGroupProps<T>) {
	return (
		<View className={cn("gap-1.5", className)}>
			{label ? <Label>{label}</Label> : null}
			<View className={cn("gap-2", horizontal && "flex-row")}>
				{options.map((option) => {
					const isSelected = option.value === value;
					return (
						<Pressable
							key={option.value}
							onPress={() => onValueChange(option.value)}
							disabled={disabled}
							accessibilityRole="radio"
							accessibilityState={{ selected: isSelected, disabled }}
							className={cn(
								"flex-row items-center gap-2.5 rounded-lg border px-3 py-3",
								horizontal && "flex-1 justify-center",
								isSelected
									? "border-primary bg-primary/10"
									: "border-input bg-background",
								disabled && "opacity-50",
							)}
						>
							<View
								className={cn(
									"size-5 items-center justify-center rounded-full border-2",
									isSelected ? "border-primary" : "border-input",
								)}
							>
								{isSelected ? (
									<View className="size-2.5 rounded-full bg-primary" />
								) : null}
							</View>
							<Text className={cn(isSelected && "font-medium")}>
								{option.label}
							</Text>
						</Pressable>
					);
				})}
			</View>
		</View>
	);
}
