import { Plus } from "lucide-react-native";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Sheet } from "@/components/ui/Sheet";
import { Text } from "@/components/ui/Text";
import type { CreateProductDto } from "@/modules/products/application/dtos/ProductDto";
import type { Product } from "@/modules/products/domain/entities/Product";
import { ProductFormSheet } from "@/modules/products/presentation/components/ProductFormSheet";
import { StockBadge } from "@/modules/products/presentation/components/StockBadge";
import { useCreateProduct } from "@/modules/products/presentation/hooks/useCreateProduct";
import { useProducts } from "@/modules/products/presentation/hooks/useProducts";
import { useUpdateProduct } from "@/modules/products/presentation/hooks/useUpdateProduct";

interface AssociateBarcodeSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	barcode: string;
	teamId: string | null;
	currentProductId?: string;
}

export function AssociateBarcodeSheet({
	open,
	onOpenChange,
	barcode,
	teamId,
	currentProductId,
}: AssociateBarcodeSheetProps) {
	const [search, setSearch] = useState("");
	const [createOpen, setCreateOpen] = useState(false);
	const { data: productsResult, isLoading } = useProducts(
		open ? teamId : null,
		{ limit: 1000 },
	);
	const updateProduct = useUpdateProduct();
	const createProduct = useCreateProduct();

	const products = productsResult?.data ?? [];
	const filtered = search.trim()
		? products.filter((product) =>
				product.name.toLowerCase().includes(search.trim().toLowerCase()),
			)
		: products;

	const isPending = updateProduct.isPending || createProduct.isPending;

	async function handleSelect(product: Product) {
		if (product.id === currentProductId) {
			onOpenChange(false);
			return;
		}
		try {
			// O código é único por equipe: libera o produto atual antes de
			// associar ao novo, senão o backend rejeita por duplicidade.
			if (currentProductId) {
				await updateProduct.mutateAsync({
					id: currentProductId,
					dto: { barcode: null },
				});
			}
			await updateProduct.mutateAsync({ id: product.id, dto: { barcode } });
			onOpenChange(false);
			setSearch("");
		} catch {
			// updateProduct.isError já exibe a mensagem de erro no painel
		}
	}

	async function handleCreate(dto: CreateProductDto) {
		if (!teamId) return;
		try {
			// O código é único por equipe: libera o produto atual antes de
			// criar o novo, senão o backend rejeita por duplicidade.
			if (currentProductId) {
				await updateProduct.mutateAsync({
					id: currentProductId,
					dto: { barcode: null },
				});
			}
			await createProduct.mutateAsync({ teamId, dto: { ...dto, barcode } });
			setCreateOpen(false);
			onOpenChange(false);
			setSearch("");
		} catch {
			// createProduct.isError exibe a mensagem de erro no formulário
		}
	}

	return (
		<>
			<Sheet
				open={open}
				onOpenChange={onOpenChange}
				title="Associar código de barras"
				description={`Escolha o produto que receberá o código ${barcode}`}
			>
				<Input
					value={search}
					onChangeText={setSearch}
					placeholder="Buscar produto pelo nome"
				/>

				<Button
					label="Cadastrar novo produto com este código"
					variant="outline"
					disabled={isPending}
					onPress={() => setCreateOpen(true)}
					icon={<Plus size={16} color="rgb(113 113 122)" />}
				/>

				{updateProduct.isError ? (
					<Text className="text-xs text-destructive">
						Erro ao associar o código de barras. Verifique se este código já não
						está em uso por outro produto.
					</Text>
				) : null}

				{isLoading ? (
					<Text className="py-8 text-center text-sm text-muted-foreground">
						Carregando produtos…
					</Text>
				) : filtered.length === 0 ? (
					<Text className="py-8 text-center text-sm text-muted-foreground">
						Nenhum produto encontrado.
					</Text>
				) : (
					<View className="overflow-hidden rounded-lg border border-border">
						{filtered.map((product) => (
							<Pressable
								key={product.id}
								onPress={() => handleSelect(product)}
								disabled={isPending}
								accessibilityRole="button"
								className="flex-row items-center justify-between gap-3 border-b border-border p-3 active:bg-muted"
							>
								<View className="min-w-0 flex-1 gap-0.5">
									<Text className="text-sm font-medium" numberOfLines={1}>
										{product.name}
									</Text>
									<Text
										className="text-xs text-muted-foreground"
										numberOfLines={1}
									>
										{product.category}
										{product.barcode
											? ` · código atual: ${product.barcode}`
											: ""}
									</Text>
								</View>
								<StockBadge
									quantity={product.quantity}
									minimum={product.minumum}
								/>
							</Pressable>
						))}
					</View>
				)}
			</Sheet>

			<ProductFormSheet
				open={createOpen}
				onOpenChange={setCreateOpen}
				onSubmit={handleCreate}
				isPending={isPending}
				errorMessage={
					createProduct.isError
						? "Erro ao cadastrar o produto. Tente novamente."
						: undefined
				}
			/>
		</>
	);
}
