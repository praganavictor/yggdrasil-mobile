import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { View } from "react-native";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Text } from "@/components/ui/Text";

interface PaginationControlsProps {
	page: number;
	totalPages: number;
	total: number;
	limit: number;
	onPageChange: (page: number) => void;
	onLimitChange: (limit: number) => void;
	limitOptions?: number[];
}

export function PaginationControls({
	page,
	totalPages,
	total,
	limit,
	onPageChange,
	onLimitChange,
	limitOptions = [10, 20, 50],
}: PaginationControlsProps) {
	const safeTotalPages = Math.max(totalPages, 1);
	const start = total === 0 ? 0 : (page - 1) * limit + 1;
	const end = Math.min(page * limit, total);

	return (
		<View className="gap-3 border-t border-border px-4 py-3">
			<View className="flex-row items-center justify-between gap-3">
				<Text className="text-sm text-muted-foreground">Itens por página:</Text>
				<Select
					className="w-24"
					value={String(limit)}
					onValueChange={(value) => onLimitChange(Number(value))}
					options={limitOptions.map((option) => ({
						value: String(option),
						label: String(option),
					}))}
				/>
			</View>

			<View className="flex-row items-center justify-between gap-3">
				<Text className="text-sm text-muted-foreground">
					{total === 0 ? "0 resultados" : `${start}–${end} de ${total}`}
				</Text>
				<View className="flex-row items-center gap-1">
					<Button
						variant="outline"
						size="icon"
						className="size-9"
						accessibilityLabel="Página anterior"
						disabled={page <= 1}
						onPress={() => onPageChange(page - 1)}
						icon={<ChevronLeft size={18} color="rgb(113 113 122)" />}
					/>
					<Text className="w-20 text-center text-sm text-muted-foreground">
						{page} de {safeTotalPages}
					</Text>
					<Button
						variant="outline"
						size="icon"
						className="size-9"
						accessibilityLabel="Próxima página"
						disabled={page >= safeTotalPages}
						onPress={() => onPageChange(page + 1)}
						icon={<ChevronRight size={18} color="rgb(113 113 122)" />}
					/>
				</View>
			</View>
		</View>
	);
}
