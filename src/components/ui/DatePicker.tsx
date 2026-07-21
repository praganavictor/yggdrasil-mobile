import DateTimePicker from "@react-native-community/datetimepicker";
import { Calendar } from "lucide-react-native";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { Label } from "@/components/ui/Label";
import { Text } from "@/components/ui/Text";
import { cn } from "@/lib/utils";

interface DatePickerProps {
	/** Data em ISO 8601 — mesmo formato aceito pela API. */
	value: string;
	onChange: (isoDate: string) => void;
	label?: string;
	disabled?: boolean;
	className?: string;
}

const dateFormat = new Intl.DateTimeFormat("pt-BR", {
	day: "2-digit",
	month: "2-digit",
	year: "numeric",
});

export function DatePicker({
	value,
	onChange,
	label,
	disabled,
	className,
}: DatePickerProps) {
	const [open, setOpen] = useState(false);
	const parsed = value ? new Date(value) : new Date();
	const date = Number.isNaN(parsed.getTime()) ? new Date() : parsed;

	return (
		<View className={cn("gap-1.5", className)}>
			{label ? <Label>{label}</Label> : null}

			<Pressable
				onPress={() => setOpen(true)}
				disabled={disabled}
				accessibilityRole="button"
				accessibilityLabel={label ?? "Selecionar data"}
				className={cn(
					"h-12 flex-row items-center justify-between rounded-lg border border-input bg-background px-3",
					disabled && "opacity-50",
				)}
			>
				<Text>{dateFormat.format(date)}</Text>
				<Calendar size={18} color="rgb(113 113 122)" />
			</Pressable>

			{open ? (
				<DateTimePicker
					value={date}
					mode="date"
					onChange={(event, selected) => {
						setOpen(false);
						if (event.type === "set" && selected) {
							onChange(selected.toISOString());
						}
					}}
				/>
			) : null}
		</View>
	);
}
