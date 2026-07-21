import { Modal, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";

interface ConfirmDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description?: string;
	confirmLabel?: string;
	cancelLabel?: string;
	destructive?: boolean;
	loading?: boolean;
	onConfirm: () => void;
}

export function ConfirmDialog({
	open,
	onOpenChange,
	title,
	description,
	confirmLabel = "Confirmar",
	cancelLabel = "Cancelar",
	destructive = false,
	loading = false,
	onConfirm,
}: ConfirmDialogProps) {
	return (
		<Modal
			visible={open}
			transparent
			animationType="fade"
			statusBarTranslucent
			onRequestClose={() => onOpenChange(false)}
		>
			<View className="flex-1 items-center justify-center bg-black/50 px-6">
				<View className="w-full max-w-sm gap-4 rounded-xl border border-border bg-background p-5">
					<View className="gap-1.5">
						<Text className="text-lg font-semibold">{title}</Text>
						{description ? (
							<Text className="text-sm text-muted-foreground">
								{description}
							</Text>
						) : null}
					</View>

					<View className="gap-2">
						<Button
							label={confirmLabel}
							variant={destructive ? "destructive" : "default"}
							loading={loading}
							onPress={onConfirm}
						/>
						<Button
							label={cancelLabel}
							variant="outline"
							disabled={loading}
							onPress={() => onOpenChange(false)}
						/>
					</View>
				</View>
			</View>
		</Modal>
	);
}
