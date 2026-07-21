import type { ReactNode } from "react";
import { View, type ViewProps } from "react-native";
import { Text } from "@/components/ui/Text";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: ViewProps) {
	return (
		<View
			className={cn("rounded-xl border border-border bg-card", className)}
			{...props}
		/>
	);
}

export function CardHeader({ className, ...props }: ViewProps) {
	return <View className={cn("gap-1.5 p-4", className)} {...props} />;
}

export function CardTitle({
	className,
	children,
}: {
	className?: string;
	children: ReactNode;
}) {
	return (
		<Text
			className={cn("text-lg font-semibold text-card-foreground", className)}
		>
			{children}
		</Text>
	);
}

export function CardDescription({
	className,
	children,
}: {
	className?: string;
	children: ReactNode;
}) {
	return (
		<Text className={cn("text-sm text-muted-foreground", className)}>
			{children}
		</Text>
	);
}

export function CardContent({ className, ...props }: ViewProps) {
	return <View className={cn("p-4 pt-0", className)} {...props} />;
}

export function CardFooter({ className, ...props }: ViewProps) {
	return (
		<View
			className={cn("flex-row items-center gap-2 p-4 pt-0", className)}
			{...props}
		/>
	);
}
