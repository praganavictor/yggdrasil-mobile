import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, Text } from "react-native";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
	"flex-row items-center justify-center gap-2 rounded-lg active:opacity-80",
	{
		variants: {
			variant: {
				default: "bg-primary",
				destructive: "bg-destructive",
				outline: "border border-border bg-transparent",
				secondary: "bg-secondary",
				ghost: "bg-transparent",
			},
			size: {
				default: "h-11 px-4",
				sm: "h-9 px-3",
				lg: "h-13 px-6",
				icon: "h-11 w-11 px-0",
			},
		},
		defaultVariants: { variant: "default", size: "default" },
	},
);

const labelVariants = cva("text-center font-medium", {
	variants: {
		variant: {
			default: "text-primary-foreground",
			destructive: "text-destructive-foreground",
			outline: "text-foreground",
			secondary: "text-secondary-foreground",
			ghost: "text-foreground",
		},
		size: {
			default: "text-base",
			sm: "text-sm",
			lg: "text-lg",
			icon: "text-base",
		},
	},
	defaultVariants: { variant: "default", size: "default" },
});

interface ButtonProps extends VariantProps<typeof buttonVariants> {
	label?: string;
	icon?: ReactNode;
	onPress?: () => void;
	disabled?: boolean;
	loading?: boolean;
	className?: string;
	labelClassName?: string;
	accessibilityLabel?: string;
	children?: ReactNode;
}

export function Button({
	label,
	icon,
	onPress,
	disabled,
	loading,
	variant,
	size,
	className,
	labelClassName,
	accessibilityLabel,
	children,
}: ButtonProps) {
	const isDisabled = disabled || loading;

	return (
		<Pressable
			onPress={onPress}
			disabled={isDisabled}
			accessibilityRole="button"
			accessibilityLabel={accessibilityLabel ?? label}
			accessibilityState={{ disabled: isDisabled, busy: loading }}
			className={cn(
				buttonVariants({ variant, size }),
				isDisabled && "opacity-50",
				className,
			)}
		>
			{loading ? <ActivityIndicator size="small" /> : icon}
			{label ? (
				<Text className={cn(labelVariants({ variant, size }), labelClassName)}>
					{label}
				</Text>
			) : null}
			{children}
		</Pressable>
	);
}
