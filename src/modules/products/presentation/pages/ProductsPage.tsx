import {
	Pencil,
	Plus,
	ScanBarcode,
	SlidersHorizontal,
	Trash2,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import { FlatList, Pressable, View } from "react-native";
import { PaginationControls } from "@/components/shared/PaginationControls";
import {
	EmptyState,
	ErrorState,
	LoadingState,
} from "@/components/shared/States";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Sheet } from "@/components/ui/Sheet";
import { Switch } from "@/components/ui/Switch";
import { Text } from "@/components/ui/Text";
import { formatCurrency } from "@/lib/utils";
import type { CreateProductDto } from "@/modules/products/application/dtos/ProductDto";
import type { Product } from "@/modules/products/domain/entities/Product";
import { ProductDetailsSheet } from "@/modules/products/presentation/components/ProductDetailsSheet";
import { ProductFormSheet } from "@/modules/products/presentation/components/ProductFormSheet";
import { StockBadge } from "@/modules/products/presentation/components/StockBadge";
import { useCreateProduct } from "@/modules/products/presentation/hooks/useCreateProduct";
import { useDeleteProduct } from "@/modules/products/presentation/hooks/useDeleteProduct";
import { useProducts } from "@/modules/products/presentation/hooks/useProducts";
import { useUpdateProduct } from "@/modules/products/presentation/hooks/useUpdateProduct";
import { useDefaultTeam } from "@/modules/teams/presentation/hooks/useDefaultTeam";
import { useTeams } from "@/modules/teams/presentation/hooks/useTeams";
import { useAppNavigation } from "@/navigation/types";

export function ProductsPage() {
	const navigation = useAppNavigation();
	const { defaultTeamId } = useDefaultTeam();
	const hasDefault = defaultTeamId !== null;

	const { data: teams = [] } = useTeams();
	const [manualTeamId, setManualTeamId] = useState<string | null>(null);
	const selectedTeamId = hasDefault ? defaultTeamId : manualTeamId;

	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [categoryInput, setCategoryInput] = useState("");
	const [category, setCategory] = useState("");
	const [onlyPortioned, setOnlyPortioned] = useState(false);
	const [onlyBelowMinimum, setOnlyBelowMinimum] = useState(false);
	const [onlyOutOfStock, setOnlyOutOfStock] = useState(false);
	const [filtersOpen, setFiltersOpen] = useState(false);

	useEffect(() => {
		const timeout = setTimeout(() => setCategory(categoryInput.trim()), 400);
		return () => clearTimeout(timeout);
	}, [categoryInput]);

	useEffect(() => {
		setPage(1);
	}, [
		selectedTeamId,
		category,
		onlyPortioned,
		onlyBelowMinimum,
		onlyOutOfStock,
	]);

	function handleBelowMinimumChange(checked: boolean) {
		setOnlyBelowMinimum(checked);
		if (checked) setOnlyOutOfStock(false);
	}

	function handleOutOfStockChange(checked: boolean) {
		setOnlyOutOfStock(checked);
		if (checked) setOnlyBelowMinimum(false);
	}

	const {
		data: result,
		isLoading,
		isError,
		refetch,
	} = useProducts(selectedTeamId, {
		page,
		limit,
		category: category || undefined,
		isPortioned: onlyPortioned ? true : undefined,
		belowMinimum: onlyBelowMinimum ? true : undefined,
		outOfStock: onlyOutOfStock ? true : undefined,
	});

	const products = result?.data ?? [];
	const meta = result?.meta;
	const createProduct = useCreateProduct();
	const updateProduct = useUpdateProduct();
	const deleteProduct = useDeleteProduct();

	const [formOpen, setFormOpen] = useState(false);
	const [editingProduct, setEditingProduct] = useState<Product | undefined>();
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
	const [detailsOpen, setDetailsOpen] = useState(false);
	const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

	// Mantém o painel sincronizado após uma movimentação alterar a quantidade.
	const currentViewingProduct = viewingProduct
		? (products.find((item) => item.id === viewingProduct.id) ?? viewingProduct)
		: null;

	const activeFilterCount =
		(category ? 1 : 0) +
		(onlyPortioned ? 1 : 0) +
		(onlyBelowMinimum ? 1 : 0) +
		(onlyOutOfStock ? 1 : 0);

	function handleNewProduct() {
		setEditingProduct(undefined);
		setFormOpen(true);
	}

	function handleFormSubmit(dto: CreateProductDto) {
		if (!selectedTeamId) return;
		if (editingProduct) {
			updateProduct.mutate(
				{ id: editingProduct.id, dto },
				{ onSuccess: () => setFormOpen(false) },
			);
		} else {
			createProduct.mutate(
				{ teamId: selectedTeamId, dto },
				{ onSuccess: () => setFormOpen(false) },
			);
		}
	}

	function handleDeleteConfirm() {
		if (!deletingProduct) return;
		deleteProduct.mutate(deletingProduct.id, {
			onSuccess: () => {
				setDeleteDialogOpen(false);
				setDeletingProduct(null);
			},
		});
	}

	return (
		<View className="flex-1 bg-background">
			<View className="gap-3 border-b border-border p-4">
				<View className="flex-row items-center gap-2">
					<Button
						className="flex-1"
						label="Novo produto"
						disabled={!selectedTeamId}
						onPress={handleNewProduct}
						icon={<Plus size={18} color="rgb(250 250 250)" />}
					/>
					<Button
						variant="outline"
						size="icon"
						accessibilityLabel="Escanear código de barras"
						onPress={() => navigation.navigate("Scanner")}
						icon={<ScanBarcode size={20} color="rgb(113 113 122)" />}
					/>
					<Button
						variant="outline"
						size="icon"
						accessibilityLabel="Filtros"
						disabled={!selectedTeamId}
						onPress={() => setFiltersOpen(true)}
						icon={<SlidersHorizontal size={20} color="rgb(113 113 122)" />}
					/>
				</View>

				{!hasDefault ? (
					<Select
						label="Equipe"
						value={manualTeamId}
						onValueChange={(value) => setManualTeamId(value || null)}
						placeholder="Selecione uma equipe"
						options={teams.map((team) => ({
							value: team.id,
							label: team.name,
						}))}
					/>
				) : null}

				{activeFilterCount > 0 ? (
					<Text className="text-xs text-muted-foreground">
						{activeFilterCount}{" "}
						{activeFilterCount === 1 ? "filtro ativo" : "filtros ativos"}
					</Text>
				) : null}
			</View>

			{!selectedTeamId ? (
				<EmptyState
					title="Nenhuma equipe selecionada"
					description="Selecione uma equipe para ver os produtos."
				/>
			) : isLoading ? (
				<LoadingState label="Carregando produtos…" />
			) : isError ? (
				<ErrorState
					message="Erro ao carregar produtos."
					onRetry={() => refetch()}
				/>
			) : (
				<FlatList
					data={products}
					keyExtractor={(item) => item.id}
					contentContainerClassName="grow"
					ListEmptyComponent={
						<EmptyState
							title="Nenhum produto cadastrado."
							actionLabel="Cadastrar primeiro produto"
							onAction={handleNewProduct}
						/>
					}
					ListFooterComponent={
						meta && products.length > 0 ? (
							<PaginationControls
								page={meta.page}
								totalPages={meta.totalPages}
								total={meta.total}
								limit={limit}
								onPageChange={setPage}
								onLimitChange={(newLimit) => {
									setLimit(newLimit);
									setPage(1);
								}}
							/>
						) : null
					}
					renderItem={({ item }) => (
						<View className="flex-row items-center gap-2 border-b border-border p-4">
							<Pressable
								className="min-w-0 flex-1 gap-1.5"
								accessibilityRole="button"
								onPress={() => {
									setViewingProduct(item);
									setDetailsOpen(true);
								}}
							>
								<View className="flex-row items-start justify-between gap-2">
									<Text
										className="min-w-0 flex-1 font-medium"
										numberOfLines={1}
									>
										{item.name}
									</Text>
									<StockBadge quantity={item.quantity} minimum={item.minumum} />
								</View>
								<Text
									className="text-xs text-muted-foreground"
									numberOfLines={1}
								>
									{[item.category, item.subcategory, item.local]
										.filter(Boolean)
										.join(" · ")}
								</Text>
								<View className="flex-row flex-wrap items-center gap-x-3 gap-y-1">
									<Text className="text-sm">
										{item.quantity} {item.unity}
									</Text>
									<Text className="text-sm text-muted-foreground">
										{formatCurrency(item.price)}
									</Text>
									{item.isPortioned ? (
										<Badge variant="secondary" label="Porcionado" />
									) : null}
								</View>
							</Pressable>

							<View className="shrink-0 gap-1">
								<Button
									variant="ghost"
									size="icon"
									className="size-9"
									accessibilityLabel="Editar produto"
									onPress={() => {
										setEditingProduct(item);
										setFormOpen(true);
									}}
									icon={<Pencil size={18} color="rgb(113 113 122)" />}
								/>
								<Button
									variant="ghost"
									size="icon"
									className="size-9"
									accessibilityLabel="Excluir produto"
									onPress={() => {
										setDeletingProduct(item);
										setDeleteDialogOpen(true);
									}}
									icon={<Trash2 size={18} color="rgb(220 38 38)" />}
								/>
							</View>
						</View>
					)}
				/>
			)}

			<Sheet
				open={filtersOpen}
				onOpenChange={setFiltersOpen}
				title="Filtros"
				footer={
					<>
						<Button label="Aplicar" onPress={() => setFiltersOpen(false)} />
						<Button
							label="Limpar filtros"
							variant="outline"
							onPress={() => {
								setCategoryInput("");
								setOnlyPortioned(false);
								setOnlyBelowMinimum(false);
								setOnlyOutOfStock(false);
							}}
						/>
					</>
				}
			>
				<Input
					label="Categoria"
					value={categoryInput}
					onChangeText={setCategoryInput}
					placeholder="Filtrar por categoria"
				/>
				<Switch
					label="Somente porcionados"
					checked={onlyPortioned}
					onCheckedChange={setOnlyPortioned}
				/>
				<Switch
					label="Abaixo do mínimo"
					checked={onlyBelowMinimum}
					onCheckedChange={handleBelowMinimumChange}
				/>
				<Switch
					label="Sem estoque"
					checked={onlyOutOfStock}
					onCheckedChange={handleOutOfStockChange}
				/>
			</Sheet>

			<ProductFormSheet
				open={formOpen}
				onOpenChange={setFormOpen}
				product={editingProduct}
				onSubmit={handleFormSubmit}
				isPending={createProduct.isPending || updateProduct.isPending}
			/>

			<ConfirmDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				title="Excluir produto"
				description={`Tem certeza que deseja excluir ${deletingProduct?.name}? Esta ação não pode ser desfeita.`}
				confirmLabel={deleteProduct.isPending ? "Excluindo…" : "Excluir"}
				destructive
				loading={deleteProduct.isPending}
				onConfirm={handleDeleteConfirm}
			/>

			<ProductDetailsSheet
				open={detailsOpen}
				onOpenChange={setDetailsOpen}
				product={currentViewingProduct}
				teamId={selectedTeamId}
			/>
		</View>
	);
}
