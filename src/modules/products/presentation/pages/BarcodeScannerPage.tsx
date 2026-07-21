import { useNavigation } from "@react-navigation/native";
import {
	Check,
	Link2,
	Minus,
	PackageSearch,
	Plus,
	X,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Text } from "@/components/ui/Text";
import type { CreateProductDto } from "@/modules/products/application/dtos/ProductDto";
import type { Product } from "@/modules/products/domain/entities/Product";
import { AssociateBarcodeSheet } from "@/modules/products/presentation/components/AssociateBarcodeSheet";
import { BarcodeScannerCamera } from "@/modules/products/presentation/components/BarcodeScannerCamera";
import { ProductFormSheet } from "@/modules/products/presentation/components/ProductFormSheet";
import { StockBadge } from "@/modules/products/presentation/components/StockBadge";
import { useCreateProduct } from "@/modules/products/presentation/hooks/useCreateProduct";
import { useProductByBarcode } from "@/modules/products/presentation/hooks/useProductByBarcode";
import type { StockMovimentType } from "@/modules/stockMoviment/domain/entities/StockMoviment";
import { useCreateStockMoviment } from "@/modules/stockMoviment/presentation/hooks/useCreateStockMoviment";
import { useDefaultTeam } from "@/modules/teams/presentation/hooks/useDefaultTeam";

function ScannedProductCard({
	product,
	teamId,
}: {
	product: Product;
	teamId: string | null;
}) {
	const createStockMoviment = useCreateStockMoviment();
	const [baseline, setBaseline] = useState(product.quantity);
	const [quantityInput, setQuantityInput] = useState("0");
	const [direction, setDirection] = useState<StockMovimentType | null>(null);

	useEffect(() => {
		setBaseline(product.quantity);
		setQuantityInput("0");
		setDirection(null);
	}, [product.quantity]);

	function handleMove(type: StockMovimentType, quantity: number) {
		if (!teamId || quantity <= 0) return;
		const target =
			type === "entrada" ? baseline + quantity : baseline - quantity;
		createStockMoviment.mutate(
			{
				type,
				quantity,
				price: product.price,
				date: new Date().toISOString(),
				productId: product.id,
				teamId,
			},
			{
				onSuccess: () => {
					setBaseline(target);
					setQuantityInput("0");
					setDirection(null);
				},
				onError: () => {
					setQuantityInput("0");
					setDirection(null);
				},
			},
		);
	}

	const isMoving = createStockMoviment.isPending;
	const parsedInput = Number.parseInt(quantityInput, 10);
	const amount = Number.isNaN(parsedInput) ? 0 : parsedInput;
	const exceedsStock = direction === "saída" && amount > baseline;
	const hasPending = direction !== null && amount > 0;

	return (
		<Card>
			<CardHeader className="border-b border-border">
				<View className="flex-row items-center justify-between gap-2">
					<CardTitle className="flex-1">{product.name}</CardTitle>
					<StockBadge quantity={baseline} minimum={product.minumum} />
				</View>
			</CardHeader>
			<CardContent className="gap-4 pt-4">
				<View className="flex-row flex-wrap items-center gap-x-4 gap-y-1">
					<Text className="text-sm text-muted-foreground">
						Estoque atual:{" "}
						<Text className="text-sm font-medium">
							{baseline} {product.unity}
						</Text>
					</Text>
					{product.isPortioned ? (
						<Badge variant="secondary" label="Porcionado" />
					) : null}
				</View>

				<View className="flex-row items-center justify-center gap-2">
					<Button
						variant={direction === "saída" ? "default" : "outline"}
						size="icon"
						className="size-12"
						accessibilityLabel="Retirar do estoque"
						disabled={isMoving || !teamId}
						onPress={() => setDirection("saída")}
						icon={
							<Minus
								size={20}
								color={
									direction === "saída"
										? "rgb(250 250 250)"
										: "rgb(113 113 122)"
								}
							/>
						}
					/>
					<Input
						value={quantityInput}
						onChangeText={(value) =>
							setQuantityInput(value.replace(/\D/g, "") || "0")
						}
						editable={!isMoving && !!teamId}
						keyboardType="number-pad"
						accessibilityLabel="Quantidade a movimentar"
						containerClassName="w-24"
						className="h-12 text-center text-xl font-semibold"
					/>
					<Button
						variant={direction === "entrada" ? "default" : "outline"}
						size="icon"
						className="size-12"
						accessibilityLabel="Adicionar ao estoque"
						disabled={isMoving || !teamId}
						onPress={() => setDirection("entrada")}
						icon={
							<Plus
								size={20}
								color={
									direction === "entrada"
										? "rgb(250 250 250)"
										: "rgb(113 113 122)"
								}
							/>
						}
					/>
				</View>

				{hasPending ? (
					<View className="gap-1">
						<Button
							label={`${direction === "entrada" ? "Adicionar" : "Retirar"} ${amount} ${product.unity} ${direction === "entrada" ? "ao" : "do"} estoque`}
							loading={isMoving}
							disabled={!teamId || exceedsStock}
							onPress={() => direction && handleMove(direction, amount)}
							icon={<Check size={16} color="rgb(250 250 250)" />}
						/>
						{exceedsStock ? (
							<Text className="text-center text-xs text-destructive">
								Quantidade maior que o estoque atual ({baseline} {product.unity}
								).
							</Text>
						) : null}
						<Button
							label="Cancelar"
							variant="ghost"
							size="sm"
							disabled={isMoving}
							onPress={() => {
								setQuantityInput("0");
								setDirection(null);
							}}
						/>
					</View>
				) : (
					<Text className="text-center text-xs text-muted-foreground">
						Digite a quantidade e toque em − para retirar ou + para adicionar.
						Nada é registrado até você confirmar.
					</Text>
				)}

				{createStockMoviment.isError ? (
					<Text className="text-xs text-destructive">
						Erro ao registrar movimentação. Tente novamente.
					</Text>
				) : null}
			</CardContent>
		</Card>
	);
}

export function BarcodeScannerPage() {
	const navigation = useNavigation();
	const { defaultTeamId } = useDefaultTeam();
	const [barcode, setBarcode] = useState<string | null>(null);
	const [manualCode, setManualCode] = useState("");
	const [associateOpen, setAssociateOpen] = useState(false);
	const [createOpen, setCreateOpen] = useState(false);
	const createProduct = useCreateProduct();

	const {
		data: product,
		isLoading,
		isFetching,
		isError,
		isNotFound,
	} = useProductByBarcode(defaultTeamId, barcode);

	useEffect(() => {
		const code = manualCode.trim();
		if (!code) {
			setBarcode(null);
			return;
		}
		const timeout = setTimeout(() => setBarcode(code), 500);
		return () => clearTimeout(timeout);
	}, [manualCode]);

	function handleDetected(code: string) {
		setManualCode(code);
		setBarcode(code);
	}

	async function handleCreate(dto: CreateProductDto) {
		if (!defaultTeamId || !barcode) return;
		try {
			await createProduct.mutateAsync({
				teamId: defaultTeamId,
				dto: { ...dto, barcode },
			});
			setCreateOpen(false);
		} catch {
			// createProduct.isError exibe a mensagem de erro no formulário
		}
	}

	return (
		<SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
			<View className="flex-row items-center justify-between gap-3 border-b border-border px-4 py-3">
				<View className="flex-1">
					<Text className="text-lg font-semibold">Escanear produto</Text>
					<Text className="text-xs text-muted-foreground">
						Leia o código com a câmera ou digite-o para buscar.
					</Text>
				</View>
				<Pressable
					onPress={() => navigation.goBack()}
					accessibilityRole="button"
					accessibilityLabel="Fechar scanner"
					hitSlop={12}
					className="size-9 items-center justify-center rounded-lg active:bg-muted"
				>
					<X size={22} color="rgb(113 113 122)" />
				</Pressable>
			</View>

			<ScrollView
				contentContainerClassName="gap-4 p-4"
				keyboardShouldPersistTaps="handled"
			>
				{!defaultTeamId ? (
					<Alert variant="destructive">
						<AlertDescription variant="destructive">
							Nenhuma equipe selecionada. Defina uma equipe padrão em
							Configurações para buscar produtos.
						</AlertDescription>
					</Alert>
				) : null}

				<BarcodeScannerCamera
					onDetected={handleDetected}
					paused={associateOpen || createOpen}
				/>

				<Input
					value={manualCode}
					onChangeText={setManualCode}
					placeholder="Digite o código de barras"
					keyboardType="number-pad"
					autoCorrect={false}
				/>

				{barcode ? (
					<View className="flex-row flex-wrap items-center justify-between gap-2">
						<Text className="text-sm text-muted-foreground">
							Código lido:{" "}
							<Text className="text-sm font-medium">{barcode}</Text>
						</Text>
						<View className="flex-row items-center gap-1">
							{product ? (
								<Button
									label="Associar a outro"
									variant="ghost"
									size="sm"
									onPress={() => setAssociateOpen(true)}
									icon={<Link2 size={14} color="rgb(113 113 122)" />}
								/>
							) : null}
							<Button
								label="Limpar"
								variant="ghost"
								size="sm"
								onPress={() => {
									setBarcode(null);
									setManualCode("");
								}}
								icon={<X size={14} color="rgb(113 113 122)" />}
							/>
						</View>
					</View>
				) : null}

				{barcode && isLoading ? (
					<View className="flex-row items-center justify-center gap-2 py-6">
						<ActivityIndicator size="small" />
						<Text className="text-sm text-muted-foreground">
							Buscando produto…
						</Text>
					</View>
				) : null}

				{barcode && product ? (
					<ScannedProductCard product={product} teamId={defaultTeamId} />
				) : null}

				{barcode && !isFetching && isNotFound ? (
					<Card>
						<CardContent className="items-center gap-3 p-6">
							<PackageSearch size={32} color="rgb(161 161 170)" />
							<View className="gap-0.5">
								<Text className="text-center font-medium">
									Nenhum produto encontrado
								</Text>
								<Text className="text-center text-sm text-muted-foreground">
									Este código de barras ainda não está associado a um produto da
									equipe.
								</Text>
							</View>
							<View className="w-full gap-2">
								<Button
									label="Cadastrar novo produto"
									onPress={() => setCreateOpen(true)}
									icon={<Plus size={16} color="rgb(250 250 250)" />}
								/>
								<Button
									label="Associar a um produto existente"
									variant="outline"
									onPress={() => setAssociateOpen(true)}
									icon={<Link2 size={16} color="rgb(113 113 122)" />}
								/>
							</View>
						</CardContent>
					</Card>
				) : null}

				{barcode && !isFetching && isError && !isNotFound && !product ? (
					<Alert variant="destructive">
						<AlertDescription variant="destructive">
							Não foi possível consultar o código de barras. Tente novamente.
						</AlertDescription>
					</Alert>
				) : null}
			</ScrollView>

			{barcode ? (
				<AssociateBarcodeSheet
					open={associateOpen}
					onOpenChange={setAssociateOpen}
					barcode={barcode}
					teamId={defaultTeamId}
					currentProductId={product?.id}
				/>
			) : null}

			<ProductFormSheet
				open={createOpen}
				onOpenChange={setCreateOpen}
				onSubmit={handleCreate}
				isPending={createProduct.isPending}
				errorMessage={
					createProduct.isError
						? "Erro ao cadastrar o produto. Tente novamente."
						: undefined
				}
			/>
		</SafeAreaView>
	);
}
