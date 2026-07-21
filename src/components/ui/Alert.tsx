import type { ReactNode } from "react";
import { View } from "react-native";
import { Text } from "@/components/ui/Text";
import { cn } from "@/lib/utils";

interface AlertProps {
	variant?: "default" | "destructive";
	children: ReactNode;
	className?: string;
}

export function Alert({
	variant = "default",
	children,
	className,
}: AlertProps) {
	return (
		<View
			accessibilityRole="alert"
			className={cn(
				"gap-1 rounded-lg border p-3",
				variant === "destructive"
					? "border-destructive/50 bg-destructive/10"
					: "border-border bg-muted",
				className,
			)}
		>
			{children}
		</View>
	);
}

export function AlertDescription({
	children,
	variant = "default",
}: {
	children: ReactNode;
	variant?: "default" | "destructive";
}) {
	return (
		<Text
			className={cn(
				"text-sm",
				variant === "destructive" ? "text-destructive" : "text-foreground",
			)}
		>
			{children}
		</Text>
	);
}
