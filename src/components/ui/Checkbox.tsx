import { Check } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { Label } from "@/components/ui/Label";
import { cn } from "@/lib/utils";

interface CheckboxProps {
	checked: boolean;
	onCheckedChange: (checked: boolean) => void;
	label?: string;
	disabled?: boolean;
	className?: string;
}

export function Checkbox({
	checked,
	onCheckedChange,
	label,
	disabled,
	className,
}: CheckboxProps) {
	return (
		<Pressable
			onPress={() => onCheckedChange(!checked)}
			disabled={disabled}
			accessibilityRole="checkbox"
			accessibilityState={{ checked, disabled }}
			accessibilityLabel={label}
			className={cn(
				"flex-row items-center gap-2",
				disabled && "opacity-50",
				className,
			)}
		>
			<View
				className={cn(
					"size-5 items-center justify-center rounded border",
					checked ? "border-primary bg-primary" : "border-input bg-background",
				)}
			>
				{checked ? <Check size={14} color="white" /> : null}
			</View>
			{label ? <Label className="font-normal">{label}</Label> : null}
		</Pressable>
	);
}
