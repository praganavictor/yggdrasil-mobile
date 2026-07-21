import { X } from "lucide-react-native";
import type { ReactNode } from "react";
import {
	KeyboardAvoidingView,
	Modal,
	Platform,
	Pressable,
	ScrollView,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "@/components/ui/Text";
import { cn } from "@/lib/utils";

interface SheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description?: string;
	children: ReactNode;
	/** Rodapé fixo, fora da área rolável — ideal para botões de ação. */
	footer?: ReactNode;
	className?: string;
}

/**
 * Painel deslizante inferior — equivalente mobile do <Sheet> usado na web.
 * O conteúdo rola e o rodapé fica fixo acima do teclado.
 */
export function Sheet({
	open,
	onOpenChange,
	title,
	description,
	children,
	footer,
	className,
}: SheetProps) {
	const insets = useSafeAreaInsets();

	return (
		<Modal
			visible={open}
			transparent
			animationType="slide"
			statusBarTranslucent
			onRequestClose={() => onOpenChange(false)}
		>
			<View className="flex-1 justify-end bg-black/50">
				<Pressable
					className="flex-1"
					accessibilityLabel="Fechar"
					onPress={() => onOpenChange(false)}
				/>
				<KeyboardAvoidingView
					behavior={Platform.OS === "ios" ? "padding" : undefined}
				>
					<View
						className={cn(
							"max-h-[90%] rounded-t-2xl border-t border-border bg-background",
							className,
						)}
					>
						<View className="flex-row items-start justify-between gap-3 border-b border-border p-4">
							<View className="flex-1 gap-1">
								<Text className="text-lg font-semibold">{title}</Text>
								{description ? (
									<Text className="text-sm text-muted-foreground">
										{description}
									</Text>
								) : null}
							</View>
							<Pressable
								onPress={() => onOpenChange(false)}
								accessibilityRole="button"
								accessibilityLabel="Fechar"
								hitSlop={12}
								className="size-8 items-center justify-center rounded-lg active:bg-muted"
							>
								<X size={20} color="rgb(113 113 122)" />
							</Pressable>
						</View>

						<ScrollView
							className="px-4"
							contentContainerClassName="gap-4 py-4"
							keyboardShouldPersistTaps="handled"
						>
							{children}
						</ScrollView>

						{footer ? (
							<View
								className="gap-2 border-t border-border p-4"
								style={{ paddingBottom: insets.bottom + 16 }}
							>
								{footer}
							</View>
						) : (
							<View style={{ height: insets.bottom }} />
						)}
					</View>
				</KeyboardAvoidingView>
			</View>
		</Modal>
	);
}
