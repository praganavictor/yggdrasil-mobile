import type { LucideIcon } from "lucide-react-native";
import { ActivityIndicator, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";

export function LoadingState({ label = "Carregando…" }: { label?: string }) {
	return (
		<View className="flex-1 items-center justify-center gap-3 p-8">
			<ActivityIndicator size="large" />
			<Text className="text-sm text-muted-foreground">{label}</Text>
		</View>
	);
}

export function EmptyState({
	icon: Icon,
	title,
	description,
	actionLabel,
	onAction,
}: {
	icon?: LucideIcon;
	title: string;
	description?: string;
	actionLabel?: string;
	onAction?: () => void;
}) {
	return (
		<View className="flex-1 items-center justify-center gap-3 p-8">
			{Icon ? <Icon size={40} color="rgb(161 161 170)" /> : null}
			<Text className="text-center text-base font-medium">{title}</Text>
			{description ? (
				<Text className="text-center text-sm text-muted-foreground">
					{description}
				</Text>
			) : null}
			{actionLabel && onAction ? (
				<Button label={actionLabel} onPress={onAction} className="mt-2" />
			) : null}
		</View>
	);
}

export function ErrorState({
	message = "Não foi possível carregar os dados.",
	onRetry,
}: {
	message?: string;
	onRetry?: () => void;
}) {
	return (
		<View className="flex-1 items-center justify-center gap-3 p-8">
			<Text className="text-center text-base font-medium text-destructive">
				{message}
			</Text>
			{onRetry ? (
				<Button label="Tentar novamente" variant="outline" onPress={onRetry} />
			) : null}
		</View>
	);
}
