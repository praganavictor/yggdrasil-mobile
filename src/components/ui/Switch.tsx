import { Switch as RNSwitch, View } from "react-native";
import { Label } from "@/components/ui/Label";

interface SwitchProps {
	checked: boolean;
	onCheckedChange: (checked: boolean) => void;
	label?: string;
	disabled?: boolean;
}

export function Switch({
	checked,
	onCheckedChange,
	label,
	disabled,
}: SwitchProps) {
	return (
		<View className="flex-row items-center justify-between gap-3">
			{label ? <Label className="flex-1">{label}</Label> : null}
			<RNSwitch
				value={checked}
				onValueChange={onCheckedChange}
				disabled={disabled}
				accessibilityLabel={label}
				trackColor={{ false: "rgb(161 161 170)", true: "rgb(16 185 129)" }}
				thumbColor="white"
			/>
		</View>
	);
}
