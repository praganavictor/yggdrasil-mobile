import type { ReactNode } from "react";
import { TextInput, type TextInputProps, View } from "react-native";
import { Label } from "@/components/ui/Label";
import { Text } from "@/components/ui/Text";
import { cn } from "@/lib/utils";

interface InputProps extends TextInputProps {
	label?: string;
	error?: string | null;
	containerClassName?: string;
	/** Elemento posicionado à direita dentro do campo (ex: botão de ver senha). */
	rightSlot?: ReactNode;
}

export function Input({
	label,
	error,
	className,
	containerClassName,
	rightSlot,
	editable = true,
	...props
}: InputProps) {
	return (
		<View className={cn("gap-1.5", containerClassName)}>
			{label ? <Label>{label}</Label> : null}
			<View className="relative justify-center">
				<TextInput
					editable={editable}
					placeholderTextColor="rgb(113 113 122)"
					className={cn(
						"h-12 rounded-lg border border-input bg-background px-3 text-base text-foreground",
						rightSlot != null && "pr-12",
						error != null && "border-destructive",
						!editable && "opacity-50",
						className,
					)}
					{...props}
				/>
				{rightSlot ? (
					<View className="absolute right-1 h-full justify-center">
						{rightSlot}
					</View>
				) : null}
			</View>
			{error ? <Text className="text-sm text-destructive">{error}</Text> : null}
		</View>
	);
}

export function Textarea({ className, ...props }: InputProps) {
	return (
		<Input
			multiline
			textAlignVertical="top"
			className={cn("h-24 py-3", className)}
			{...props}
		/>
	);
}
