import {
	ArrowDownCircle,
	ArrowUpCircle,
	Pencil,
	Plus,
	Trash2,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import { FlatList, View } from "react-native";
import { PaginationControls } from "@/components/shared/PaginationControls";
import {
	EmptyState,
	ErrorState,
	LoadingState,
} from "@/components/shared/States";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Select } from "@/components/ui/Select";
import { Text } from "@/components/ui/Text";
import { formatCurrency } from "@/lib/utils";
import { useProducts } from "@/modules/products/presentation/hooks/useProducts";
import type { CreateStockMovimentDto } from "@/modules/stockMoviment/application/dtos/StockMovimentDto";
import type { StockMoviment } from "@/modules/stockMoviment/domain/entities/StockMoviment";
import { StockMovimentFormSheet } from "@/modules/stockMoviment/presentation/components/StockMovimentFormSheet";
import { useCreateStockMoviment } from "@/modules/stockMoviment/presentation/hooks/useCreateStockMoviment";
import { useDeleteStockMoviment } from "@/modules/stockMoviment/presentation/hooks/useDeleteStockMoviment";
import { useStockMoviments } from "@/modules/stockMoviment/presentation/hooks/useStockMoviments";
import { useUpdateStockMoviment } from "@/modules/stockMoviment/presentation/hooks/useUpdateStockMoviment";
import { TeamSelector } from "@/modules/teams/presentation/components/TeamSelector";
import { useTeamSelection } from "@/modules/teams/presentation/hooks/useTeamSelection";
import { useTeams } from "@/modules/teams/presentation/hooks/useTeams";
import { useAppNavigation } from "@/navigation/types";

const dateFormat = new Intl.DateTimeFormat("pt-BR", {
	day: "2-digit",
	month: "2-digit",
	year: "numeric",
});

const ALL_PRODUCTS = "all";

function TypeBadge({ type }: { type: string }) {
	const isEntrada = type === "entrada";
	return (
		<View
			className={`flex-row items-center gap-1 self-start rounded-full px-2.5 py-0.5 ${
				isEntrada ? "bg-emerald-600" : "bg-destructive"
			}`}
		>
			{isEntrada ? (
				<ArrowDownCircle size={12} color="white" />
			) : (
				<ArrowUpCircle size={12} color="white" />
			)}
			<Text className="text-xs font-medium text-white">
				{isEntrada ? "Entrada" : "Saída"}
			</Text>
		</View>
	);
}

export function StockMovimentsPage() {
	const navigation = useAppNavigation();
	const { data: teams = [], isLoading: teamsLoading } = useTeams();
	const { selection, isAllView, selectedTeamId, select } = useTeamSelection();
	const hasTeams = teams.length > 0;

	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [productFilter, setProductFilter] = useState("");

	useEffect(() => {
		setPage(1);
	}, [selection, productFilter]);

	function handleTeamChange(value: string) {
		select(value);
		setProductFilter("");
	}

	const scope = hasTeams ? selection : null;

	const { data: productsResult } = useProducts(scope, { limit: 100 });
	const productsForFilter = (productsResult?.data ?? []).map((product) => ({
		id: product.id,
		label: isAllView ? `${product.name} · ${product.team?.name}` : product.name,
	}));

	const {
		data: result,
		isLoading: movimentsLoading,
		isError,
		refetch,
	} = useStockMoviments(scope, {
		page,
		limit,
		productId: productFilter || undefined,
	});
	const isLoading = teamsLoading || movimentsLoading;

	const moviments = result?.data ?? [];
	const meta = result?.meta;
	const createMoviment = useCreateStockMoviment();
	const updateMoviment = useUpdateStockMoviment();
	const deleteMoviment = useDeleteStockMoviment();

	const [formOpen, setFormOpen] = useState(false);
	const [editingMoviment, setEditingMoviment] = useState<StockMoviment>();
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [deletingMoviment, setDeletingMoviment] =
		useState<StockMoviment | null>(null);

	function handleNew() {
		setEditingMoviment(undefined);
		setFormOpen(true);
	}

	function handleFormSubmit(dto: CreateStockMovimentDto) {
		if (editingMoviment) {
			updateMoviment.mutate(
				{ id: editingMoviment.id, dto },
				{ onSuccess: () => setFormOpen(false) },
			);
		} else {
			createMoviment.mutate(dto, { onSuccess: () => setFormOpen(false) });
		}
	}

	function handleDeleteConfirm() {
		if (!deletingMoviment) return;
		deleteMoviment.mutate(deletingMoviment.id, {
			onSuccess: () => {
				setDeleteDialogOpen(false);
				setDeletingMoviment(null);
			},
		});
	}

	const deletingLabel = deletingMoviment
		? `${deletingMoviment.type === "entrada" ? "Entrada" : "Saída"} de ${deletingMoviment.quantity} un.`
		: "";

	return (
		<View className="flex-1 bg-background">
			<View className="gap-3 border-b border-border p-4">
				<Button
					label="Nova movimentação"
					disabled={!hasTeams}
					onPress={handleNew}
					icon={<Plus size={18} color="rgb(250 250 250)" />}
				/>

				{hasTeams ? (
					<TeamSelector
						teams={teams}
						value={selection}
						onChange={handleTeamChange}
					/>
				) : null}

				{hasTeams ? (
					<Select
						label="Produto"
						value={productFilter || ALL_PRODUCTS}
						onValueChange={(value) =>
							setProductFilter(value === ALL_PRODUCTS ? "" : value)
						}
						options={[
							{ value: ALL_PRODUCTS, label: "Todos os produtos" },
							...productsForFilter.map((product) => ({
								value: product.id,
								label: product.label,
							})),
						]}
					/>
				) : null}
			</View>

			{isLoading ? (
				<LoadingState label="Carregando movimentações…" />
			) : !hasTeams ? (
				<EmptyState
					title="Você ainda não participa de nenhuma equipe."
					actionLabel="Gerenciar equipes"
					onAction={() => navigation.navigate("Equipes")}
				/>
			) : isError ? (
				<ErrorState
					message="Erro ao carregar movimentações."
					onRetry={() => refetch()}
				/>
			) : (
				<FlatList
					data={moviments}
					keyExtractor={(item) => item.id}
					contentContainerClassName="grow"
					ListEmptyComponent={
						<EmptyState
							title="Nenhuma movimentação registrada."
							actionLabel="Registrar primeira movimentação"
							onAction={handleNew}
						/>
					}
					ListFooterComponent={
						meta && moviments.length > 0 ? (
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
							<View className="min-w-0 flex-1 gap-1.5">
								<View className="flex-row items-center gap-2">
									<TypeBadge type={item.type} />
									<Text className="text-xs text-muted-foreground">
										{dateFormat.format(new Date(item.date))}
									</Text>
									{isAllView && item.team?.name ? (
										<Text
											className="min-w-0 flex-1 text-xs text-muted-foreground"
											numberOfLines={1}
										>
											· {item.team.name}
										</Text>
									) : null}
								</View>
								<Text className="font-medium" numberOfLines={1}>
									{item.product?.name ?? item.productId}
								</Text>
								<Text className="text-sm text-muted-foreground">
									{item.quantity} × {formatCurrency(item.price)} ={" "}
									<Text className="text-sm font-medium">
										{formatCurrency(item.quantity * item.price)}
									</Text>
								</Text>
							</View>

							<View className="shrink-0 gap-1">
								<Button
									variant="ghost"
									size="icon"
									className="size-9"
									accessibilityLabel="Editar movimentação"
									onPress={() => {
										setEditingMoviment(item);
										setFormOpen(true);
									}}
									icon={<Pencil size={18} color="rgb(113 113 122)" />}
								/>
								<Button
									variant="ghost"
									size="icon"
									className="size-9"
									accessibilityLabel="Excluir movimentação"
									onPress={() => {
										setDeletingMoviment(item);
										setDeleteDialogOpen(true);
									}}
									icon={<Trash2 size={18} color="rgb(220 38 38)" />}
								/>
							</View>
						</View>
					)}
				/>
			)}

			<StockMovimentFormSheet
				open={formOpen}
				onOpenChange={setFormOpen}
				moviment={editingMoviment}
				onSubmit={handleFormSubmit}
				isPending={createMoviment.isPending || updateMoviment.isPending}
				teamId={editingMoviment?.teamId ?? selectedTeamId}
				teamOptions={teams}
			/>

			<ConfirmDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				title="Excluir movimentação"
				description={`Tem certeza que deseja excluir a movimentação ${deletingLabel}? Esta ação não pode ser desfeita.`}
				confirmLabel={deleteMoviment.isPending ? "Excluindo…" : "Excluir"}
				destructive
				loading={deleteMoviment.isPending}
				onConfirm={handleDeleteConfirm}
			/>
		</View>
	);
}
