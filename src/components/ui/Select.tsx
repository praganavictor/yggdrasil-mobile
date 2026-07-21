import { Check, ChevronDown } from "lucide-react-native";
import { useState } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";
import { Label } from "@/components/ui/Label";
import { Text } from "@/components/ui/Text";
import { cn } from "@/lib/utils";

export interface SelectOption<T extends string> {
	value: T;
	label: string;
}

interface SelectProps<T extends string> {
	value: T | null;
	onValueChange: (value: T) => void;
	options: SelectOption<T>[];
	label?: string;
	placeholder?: string;
	disabled?: boolean;
	className?: string;
}

export function Select<T extends string>({
	value,
	onValueChange,
	options,
	label,
	placeholder = "Selecione…",
	disabled,
	className,
}: SelectProps<T>) {
	const [open, setOpen] = useState(false);
	const selected = options.find((option) => option.value === value);

	return (
		<View className={cn("gap-1.5", className)}>
			{label ? <Label>{label}</Label> : null}

			<Pressable
				onPress={() => setOpen(true)}
				disabled={disabled}
				accessibilityRole="button"
				accessibilityLabel={label ?? placeholder}
				className={cn(
					"h-12 flex-row items-center justify-between rounded-lg border border-input bg-background px-3",
					disabled && "opacity-50",
				)}
			>
				<Text
					className={cn("flex-1", selected ? "" : "text-muted-foreground")}
					numberOfLines={1}
				>
					{selected?.label ?? placeholder}
				</Text>
				<ChevronDown size={18} color="rgb(113 113 122)" />
			</Pressable>

			<Modal
				visible={open}
				transparent
				animationType="fade"
				statusBarTranslucent
				onRequestClose={() => setOpen(false)}
			>
				<Pressable
					className="flex-1 justify-center bg-black/50 px-6"
					onPress={() => setOpen(false)}
				>
					<View className="max-h-[60%] overflow-hidden rounded-xl border border-border bg-background">
						<ScrollView>
							{options.map((option) => {
								const isSelected = option.value === value;
								return (
									<Pressable
										key={option.value}
										onPress={() => {
											onValueChange(option.value);
											setOpen(false);
										}}
										accessibilityRole="button"
										accessibilityState={{ selected: isSelected }}
										className="flex-row items-center justify-between gap-3 border-b border-border px-4 py-3.5 active:bg-muted"
									>
										<Text className="flex-1">{option.label}</Text>
										{isSelected ? (
											<Check size={18} color="rgb(16 185 129)" />
										) : null}
									</Pressable>
								);
							})}
						</ScrollView>
					</View>
				</Pressable>
			</Modal>
		</View>
	);
}
