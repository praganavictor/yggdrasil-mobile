import { Text as RNText, type TextProps } from "react-native";
import { cn } from "@/lib/utils";

/** Text com a cor de tema aplicada por padrão. */
export function Text({ className, ...props }: TextProps) {
	return (
		<RNText className={cn("text-base text-foreground", className)} {...props} />
	);
}
