import type { TextProps } from "react-native";
import { Text } from "@/components/ui/Text";
import { cn } from "@/lib/utils";

export function Label({ className, ...props }: TextProps) {
	return (
		<Text
			className={cn("text-sm font-medium text-foreground", className)}
			{...props}
		/>
	);
}
