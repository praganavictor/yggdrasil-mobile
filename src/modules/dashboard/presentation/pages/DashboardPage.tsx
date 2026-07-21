import {
	ArrowDownCircle,
	ArrowUpCircle,
	ChevronRight,
	Package,
	ScanBarcode,
	TriangleAlert,
	Users,
} from "lucide-react-native";
import type { ReactNode } from "react";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Text } from "@/components/ui/Text";
import { cn, formatCurrency } from "@/lib/utils";
import { useAuthState } from "@/modules/auth/presentation/hooks/useAuthState";
import {
	type TeamSummary,
	useTeamsSummaries,
} from "@/modules/dashboard/presentation/hooks/useTeamsSummaries";
import { useProducts } from "@/modules/products/presentation/hooks/useProducts";
import { useStockMoviments } from "@/modules/stockMoviment/presentation/hooks/useStockMoviments";
import { useDefaultTeam } from "@/modules/teams/presentation/hooks/useDefaultTeam";
import { useTeams } from "@/modules/teams/presentation/hooks/useTeams";
import { useAppNavigation } from "@/navigation/types";

const ALL_TEAMS = "all";

const dateFormat = new Intl.DateTimeFormat("pt-BR", {
	day: "2-digit",
	month: "2-digit",
	year: "numeric",
});

function StatCard({
	label,
	value,
	icon,
	variant = "default",
	onPress,
}: {
	label: string;
	value: string;
	icon?: ReactNode;
	variant?: "default" | "warning" | "danger";
	onPress?: () => void;
}) {
	const valueClass =
		variant === "danger"
			? "text-destructive"
			: variant === "warning"
				? "text-amber-500"
				: "text-foreground";

	const content = (
		<Card className="flex-1">
			<CardHeader className="gap-2 p-3">
				<View className="flex-row items-center justify-between gap-1">
					<Text
						className="flex-1 text-xs text-muted-foreground"
						numberOfLines={2}
					>
						{label}
					</Text>
					{icon}
				</View>
				<Text className={cn("text-xl font-semibold", valueClass)}>{value}</Text>
			</CardHeader>
		</Card>
	);

	if (onPress) {
		return (
			<Pressable
				className="flex-1"
				accessibilityRole="button"
				onPress={onPress}
			>
				{content}
			</Pressable>
		);
	}
	return content;
}

function TypeBadge({ type }: { type: string }) {
	const isEntrada = type === "entrada";
	return (
		<View
			className={cn(
				"flex-row items-center gap-1 self-start rounded-full px-2.5 py-0.5",
				isEntrada ? "bg-emerald-600" : "bg-destructive",
			)}
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

function SummaryRow({
	label,
	value,
	variant = "default",
}: {
	label: string;
	value: string;
	variant?: "default" | "warning" | "danger";
}) {
	return (
		<View className="flex-row items-center justify-between">
			<Text className="text-sm text-muted-foreground">{label}</Text>
			<Text
				className={cn(
					"text-sm font-medium",
					variant === "danger"
						? "text-destructive"
						: variant === "warning"
							? "text-amber-500"
							: "text-foreground",
				)}
			>
				{value}
			</Text>
		</View>
	);
}

function TeamSummaryCard({
	summary,
	onSelect,
}: {
	summary: TeamSummary;
	onSelect: () => void;
}) {
	const { team, products, moviments, isLoading } = summary;
	const lowStock = products.filter(
		(product) => product.quantity > 0 && product.quantity <= product.minumum,
	).length;
	const outOfStock = products.filter(
		(product) => product.quantity === 0,
	).length;
	const totalEntradas = moviments
		.filter((moviment) => moviment.type === "entrada")
		.reduce((acc, moviment) => acc + moviment.quantity * moviment.price, 0);
	const totalSaidas = moviments
		.filter((moviment) => moviment.type === "saída")
		.reduce((acc, moviment) => acc + moviment.quantity * moviment.price, 0);

	return (
		<Pressable accessibilityRole="button" onPress={onSelect}>
			<Card>
				<CardHeader className="border-b border-border p-3">
					<View className="flex-row items-center justify-between gap-2">
						<View className="min-w-0 flex-1 flex-row items-center gap-2">
							<Users size={16} color="rgb(113 113 122)" />
							<Text className="flex-1 font-medium" numberOfLines={1}>
								{team.name}
							</Text>
						</View>
						<ChevronRight size={16} color="rgb(113 113 122)" />
					</View>
				</CardHeader>
				<CardContent className="gap-1.5 p-3">
					{isLoading ? (
						<Text className="text-sm text-muted-foreground">
							Carregando resumo…
						</Text>
					) : (
						<>
							<SummaryRow label="Produtos" value={String(products.length)} />
							<SummaryRow
								label="Estoque baixo"
								value={String(lowStock)}
								variant={lowStock > 0 ? "warning" : "default"}
							/>
							<SummaryRow
								label="Sem estoque"
								value={String(outOfStock)}
								variant={outOfStock > 0 ? "danger" : "default"}
							/>
							<SummaryRow
								label="Entradas"
								value={formatCurrency(totalEntradas)}
							/>
							<SummaryRow label="Saídas" value={formatCurrency(totalSaidas)} />
						</>
					)}
				</CardContent>
			</Card>
		</Pressable>
	);
}

export function DashboardPage() {
	const navigation = useAppNavigation();
	const { user } = useAuthState();
	const { defaultTeamId, setDefault } = useDefaultTeam();
	const { data: teams = [] } = useTeams();

	const [selection, setSelection] = useState<string>(ALL_TEAMS);
	const isAllView = selection === ALL_TEAMS;
	const selectedTeamId = isAllView ? null : selection;
	const activeTeamName = teams.find((team) => team.id === selectedTeamId)?.name;

	function handleSelectionChange(value: string) {
		if (!value) return;
		setSelection(value);
		if (value !== ALL_TEAMS && value !== defaultTeamId) {
			setDefault(value);
		}
	}

	const { data: productsResult } = useProducts(selectedTeamId, { limit: 1000 });
	const { data: movimentsResult } = useStockMoviments(selectedTeamId, {
		limit: 1000,
	});
	const { summaries, isLoading: summariesLoading } = useTeamsSummaries(
		isAllView ? teams : [],
	);

	const products = isAllView
		? summaries.flatMap((summary) => summary.products)
		: (productsResult?.data ?? []);

	const moviments = isAllView
		? summaries.flatMap((summary) =>
				summary.moviments.map((moviment) => ({
					...moviment,
					teamName: summary.team.name,
				})),
			)
		: (movimentsResult?.data ?? []).map((moviment) => ({
				...moviment,
				teamName: undefined as string | undefined,
			}));

	const lowStock = products.filter(
		(product) => product.quantity > 0 && product.quantity <= product.minumum,
	);
	const outOfStock = products.filter((product) => product.quantity === 0);

	const totalEntradas = moviments
		.filter((moviment) => moviment.type === "entrada")
		.reduce((acc, moviment) => acc + moviment.quantity * moviment.price, 0);
	const totalSaidas = moviments
		.filter((moviment) => moviment.type === "saída")
		.reduce((acc, moviment) => acc + moviment.quantity * moviment.price, 0);

	const recentMoviments = [...moviments]
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
		.slice(0, 5);

	const firstName = user?.name?.split(" ")[0] ?? "usuário";

	return (
		<View className="flex-1 bg-background">
			<ScrollView contentContainerClassName="gap-5 p-4 pb-28">
				<View className="gap-3">
					<View>
						<Text className="text-2xl font-semibold">Olá, {firstName}</Text>
						<Text className="mt-0.5 text-sm text-muted-foreground">
							Resumo do seu estoque —{" "}
							<Text className="text-sm font-medium">
								{isAllView ? "Todas as equipes" : (activeTeamName ?? "Equipe")}
							</Text>
						</Text>
					</View>

					<Select
						label="Equipe"
						value={selection}
						onValueChange={handleSelectionChange}
						options={[
							{ value: ALL_TEAMS, label: "Todas as equipes" },
							...teams.map((team) => ({ value: team.id, label: team.name })),
						]}
					/>
				</View>

				<View className="gap-2">
					<Text className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
						Produtos
					</Text>
					<View className="flex-row gap-3">
						<StatCard
							label="Total de produtos"
							value={String(products.length)}
							icon={<Package size={16} color="rgb(113 113 122)" />}
							onPress={() => navigation.navigate("Produtos")}
						/>
						<StatCard
							label="Estoque baixo"
							value={String(lowStock.length)}
							icon={<TriangleAlert size={16} color="rgb(245 158 11)" />}
							variant={lowStock.length > 0 ? "warning" : "default"}
						/>
						<StatCard
							label="Sem estoque"
							value={String(outOfStock.length)}
							icon={<TriangleAlert size={16} color="rgb(220 38 38)" />}
							variant={outOfStock.length > 0 ? "danger" : "default"}
						/>
					</View>
				</View>

				<View className="gap-2">
					<Text className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
						Movimentações
					</Text>
					<View className="flex-row gap-3">
						<StatCard label="Movimentações" value={String(moviments.length)} />
						<StatCard
							label="Total de entradas"
							value={formatCurrency(totalEntradas)}
							icon={<ArrowDownCircle size={16} color="rgb(5 150 105)" />}
						/>
						<StatCard
							label="Total de saídas"
							value={formatCurrency(totalSaidas)}
							icon={<ArrowUpCircle size={16} color="rgb(220 38 38)" />}
						/>
					</View>
				</View>

				{isAllView ? (
					<View className="gap-2">
						<Text className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
							Resumo por equipe
						</Text>
						{teams.length === 0 ? (
							<Card>
								<CardContent className="items-center gap-2 p-6">
									<Users size={32} color="rgb(161 161 170)" />
									<Text className="text-center text-sm text-muted-foreground">
										Você ainda não participa de nenhuma equipe.
									</Text>
									<Button
										label="Gerenciar equipes"
										variant="outline"
										size="sm"
										onPress={() => navigation.navigate("Equipes")}
									/>
								</CardContent>
							</Card>
						) : summariesLoading ? (
							<Text className="py-4 text-center text-sm text-muted-foreground">
								Carregando resumos das equipes…
							</Text>
						) : (
							<View className="gap-3">
								{summaries.map((summary) => (
									<TeamSummaryCard
										key={summary.team.id}
										summary={summary}
										onSelect={() => handleSelectionChange(summary.team.id)}
									/>
								))}
							</View>
						)}
					</View>
				) : null}

				{recentMoviments.length > 0 ? (
					<Card>
						<CardHeader className="border-b border-border">
							<CardTitle>Últimas movimentações</CardTitle>
						</CardHeader>
						<CardContent className="p-0">
							{recentMoviments.map((moviment) => (
								<View
									key={moviment.id}
									className="gap-1.5 border-b border-border p-4"
								>
									<View className="flex-row flex-wrap items-center gap-2">
										<TypeBadge type={moviment.type} />
										<Text className="text-xs text-muted-foreground">
											{dateFormat.format(new Date(moviment.date))}
										</Text>
										{moviment.teamName ? (
											<Text
												className="text-xs text-muted-foreground"
												numberOfLines={1}
											>
												· {moviment.teamName}
											</Text>
										) : null}
									</View>
									<Text className="font-medium" numberOfLines={1}>
										{moviment.product?.name ?? moviment.productId}
									</Text>
									<Text className="text-sm text-muted-foreground">
										{moviment.quantity} un ·{" "}
										<Text className="text-sm font-medium">
											{formatCurrency(moviment.quantity * moviment.price)}
										</Text>
									</Text>
								</View>
							))}
						</CardContent>
					</Card>
				) : null}
			</ScrollView>

			<Pressable
				onPress={() => navigation.navigate("Scanner")}
				accessibilityRole="button"
				accessibilityLabel="Escanear código de barras"
				className="absolute bottom-6 right-5 size-16 items-center justify-center rounded-full bg-primary shadow-lg active:opacity-80"
			>
				<ScanBarcode size={26} color="rgb(250 250 250)" />
			</Pressable>
		</View>
	);
}
