import { cva, type VariantProps } from "class-variance-authority";
import { View } from "react-native";
import { Text } from "@/components/ui/Text";
import { cn } from "@/lib/utils";

const badgeVariants = cva("self-start rounded-full px-2.5 py-0.5", {
	variants: {
		variant: {
			default: "bg-primary",
			secondary: "bg-secondary",
			destructive: "bg-destructive",
			outline: "border border-border bg-transparent",
			success: "bg-emerald-600",
			warning: "bg-amber-500",
		},
	},
	defaultVariants: { variant: "default" },
});

const badgeTextVariants = cva("text-xs font-medium", {
	variants: {
		variant: {
			default: "text-primary-foreground",
			secondary: "text-secondary-foreground",
			destructive: "text-destructive-foreground",
			outline: "text-foreground",
			success: "text-white",
			warning: "text-white",
		},
	},
	defaultVariants: { variant: "default" },
});

interface BadgeProps extends VariantProps<typeof badgeVariants> {
	label: string;
	className?: string;
}

export function Badge({ label, variant, className }: BadgeProps) {
	return (
		<View className={cn(badgeVariants({ variant }), className)}>
			<Text className={badgeTextVariants({ variant })}>{label}</Text>
		</View>
	);
}
