import { Minus, Plus } from "lucide-react-native";
import type { ReactNode } from "react";
import { View } from "react-native";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { Text } from "@/components/ui/Text";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/modules/products/domain/entities/Product";
import { StockBadge } from "@/modules/products/presentation/components/StockBadge";
import type { StockMovimentType } from "@/modules/stockMoviment/domain/entities/StockMoviment";
import { useCreateStockMoviment } from "@/modules/stockMoviment/presentation/hooks/useCreateStockMoviment";

interface ProductDetailsSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	product: Product | null;
	teamId: string | null;
}

function formatDate(value?: string) {
	if (!value) return null;
	return new Date(value).toLocaleDateString("pt-BR", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	});
}

function DetailItem({
	label,
	children,
}: {
	label: string;
	children: ReactNode;
}) {
	return (
		<View className="flex-1 gap-0.5">
			<Text className="text-xs text-muted-foreground">{label}</Text>
			<Text className="text-sm">{children}</Text>
		</View>
	);
}

export function ProductDetailsSheet({
	open,
	onOpenChange,
	product,
	teamId,
}: ProductDetailsSheetProps) {
	const createStockMoviment = useCreateStockMoviment();

	if (!product) return null;

	const createdAt = formatDate(product.createdAt);
	const updatedAt = formatDate(product.updatedAt);
	const isMoving = createStockMoviment.isPending;

	function handleMove(type: StockMovimentType) {
		if (!product || !teamId) return;
		createStockMoviment.mutate({
			type,
			quantity: 1,
			price: product.price,
			date: new Date().toISOString(),
			productId: product.id,
			teamId,
		});
	}

	return (
		<Sheet
			open={open}
			onOpenChange={onOpenChange}
			title={product.name}
			description={product.description || undefined}
		>
			<View className="flex-row flex-wrap items-center gap-2">
				<StockBadge quantity={product.quantity} minimum={product.minumum} />
				{product.isPortioned ? (
					<Badge variant="secondary" label="Porcionado" />
				) : null}
			</View>

			<View className="gap-4">
				<View className="flex-row gap-4">
					<DetailItem label="Categoria">{product.category}</DetailItem>
					<DetailItem label="Subcategoria">{product.subcategory}</DetailItem>
				</View>
				<View className="flex-row gap-4">
					<DetailItem label="Local">{product.local}</DetailItem>
					<DetailItem label="Unidade">{product.unity}</DetailItem>
				</View>
				<View className="flex-row gap-4">
					<DetailItem label="Quantidade mínima">{product.minumum}</DetailItem>
					<DetailItem label="Preço">{formatCurrency(product.price)}</DetailItem>
				</View>
			</View>

			<View className="gap-3 border-t border-border pt-4">
				<Text className="text-xs text-muted-foreground">Estoque atual</Text>
				<View className="flex-row items-center justify-center gap-6">
					<Button
						variant="outline"
						size="icon"
						className="size-14 rounded-full"
						accessibilityLabel="Registrar saída de 1 unidade"
						disabled={isMoving || !teamId || product.quantity === 0}
						onPress={() => handleMove("saída")}
						icon={<Minus size={24} color="rgb(113 113 122)" />}
					/>
					<Text className="min-w-16 text-center text-3xl font-semibold">
						{product.quantity}
					</Text>
					<Button
						variant="outline"
						size="icon"
						className="size-14 rounded-full"
						accessibilityLabel="Registrar entrada de 1 unidade"
						disabled={isMoving || !teamId}
						onPress={() => handleMove("entrada")}
						icon={<Plus size={24} color="rgb(113 113 122)" />}
					/>
				</View>
				<Text className="text-center text-xs text-muted-foreground">
					Cada toque gera uma movimentação de 1 {product.unity}
				</Text>
				{createStockMoviment.isError ? (
					<Text className="text-center text-xs text-destructive">
						Erro ao registrar movimentação. Tente novamente.
					</Text>
				) : null}
			</View>

			{createdAt || updatedAt ? (
				<View className="flex-row gap-4 border-t border-border pt-4">
					{createdAt ? (
						<DetailItem label="Cadastrado em">{createdAt}</DetailItem>
					) : null}
					{updatedAt ? (
						<DetailItem label="Atualizado em">{updatedAt}</DetailItem>
					) : null}
				</View>
			) : null}
		</Sheet>
	);
}
