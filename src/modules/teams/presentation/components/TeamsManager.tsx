import { Pencil, Plus, Trash2, Users } from "lucide-react-native";
import { useState } from "react";
import { View } from "react-native";
import {
	EmptyState,
	ErrorState,
	LoadingState,
} from "@/components/shared/States";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Text } from "@/components/ui/Text";
import { cn } from "@/lib/utils";
import { useAuthState } from "@/modules/auth/presentation/hooks/useAuthState";
import type { CreateTeamDto } from "@/modules/teams/application/dtos/TeamDto";
import type { Team } from "@/modules/teams/domain/entities/Team";
import { TeamFormSheet } from "@/modules/teams/presentation/components/TeamFormSheet";
import { TeamMembersSheet } from "@/modules/teams/presentation/components/TeamMembersSheet";
import { useCreateTeam } from "@/modules/teams/presentation/hooks/useCreateTeam";
import { useDeleteTeam } from "@/modules/teams/presentation/hooks/useDeleteTeam";
import { useTeams } from "@/modules/teams/presentation/hooks/useTeams";
import { useUpdateTeam } from "@/modules/teams/presentation/hooks/useUpdateTeam";

/**
 * Gerenciamento de equipes (CRUD + membros). Fica dentro da aba "Equipes" de
 * Configurações, que já é rolável — por isso a lista é um map, não FlatList.
 */
export function TeamsManager() {
	const { user } = useAuthState();
	const { data: teams = [], isLoading, isError, refetch } = useTeams();
	const createTeam = useCreateTeam();
	const updateTeam = useUpdateTeam();
	const deleteTeam = useDeleteTeam();

	const [formOpen, setFormOpen] = useState(false);
	const [editingTeam, setEditingTeam] = useState<Team>();
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [deletingTeam, setDeletingTeam] = useState<Team | null>(null);
	const [membersSheetOpen, setMembersSheetOpen] = useState(false);
	const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

	function handleNewTeam() {
		setEditingTeam(undefined);
		setFormOpen(true);
	}

	function handleFormSubmit(dto: CreateTeamDto) {
		if (editingTeam) {
			updateTeam.mutate(
				{ id: editingTeam.id, dto },
				{ onSuccess: () => setFormOpen(false) },
			);
		} else {
			createTeam.mutate(dto, { onSuccess: () => setFormOpen(false) });
		}
	}

	function handleDeleteConfirm() {
		if (!deletingTeam) return;
		deleteTeam.mutate(deletingTeam.id, {
			onSuccess: () => {
				setDeleteDialogOpen(false);
				setDeletingTeam(null);
			},
		});
	}

	return (
		<View className="gap-4">
			<View className="flex-row items-center justify-between gap-3">
				<View className="min-w-0 flex-1 gap-0.5">
					<Text className="text-xl font-semibold">Equipes</Text>
					<Text className="text-sm text-muted-foreground">
						Gerencie as equipes e seus membros
					</Text>
				</View>
				<Button
					label="Nova equipe"
					size="sm"
					onPress={handleNewTeam}
					icon={<Plus size={16} color="rgb(250 250 250)" />}
				/>
			</View>

			<Card>
				<CardHeader className="border-b border-border">
					<CardTitle className="text-base">Lista de equipes</CardTitle>
				</CardHeader>

				{isLoading ? (
					<LoadingState label="Carregando equipes…" />
				) : isError ? (
					<ErrorState
						message="Erro ao carregar equipes."
						onRetry={() => refetch()}
					/>
				) : teams.length === 0 ? (
					<EmptyState
						icon={Users}
						title="Nenhuma equipe encontrada."
						actionLabel="Criar primeira equipe"
						onAction={handleNewTeam}
					/>
				) : (
					teams.map((team, index) => {
						const isOwner = team.ownerId === user?.id;
						return (
							<View
								key={team.id}
								className={cn(
									"flex-row items-center gap-2 p-4",
									index < teams.length - 1 && "border-b border-border",
								)}
							>
								<View className="min-w-0 flex-1 gap-1">
									<Text className="font-medium" numberOfLines={1}>
										{team.name}
									</Text>
									<Text
										className="text-sm text-muted-foreground"
										numberOfLines={1}
									>
										{team.description ?? "—"}
									</Text>
								</View>

								<View className="shrink-0 flex-row items-center gap-1">
									<Button
										variant="ghost"
										size="icon"
										className="size-9"
										accessibilityLabel="Ver membros"
										onPress={() => {
											setSelectedTeam(team);
											setMembersSheetOpen(true);
										}}
										icon={<Users size={18} color="rgb(113 113 122)" />}
									/>
									{isOwner ? (
										<>
											<Button
												variant="ghost"
												size="icon"
												className="size-9"
												accessibilityLabel="Editar equipe"
												onPress={() => {
													setEditingTeam(team);
													setFormOpen(true);
												}}
												icon={<Pencil size={18} color="rgb(113 113 122)" />}
											/>
											<Button
												variant="ghost"
												size="icon"
												className="size-9"
												accessibilityLabel="Excluir equipe"
												onPress={() => {
													setDeletingTeam(team);
													setDeleteDialogOpen(true);
												}}
												icon={<Trash2 size={18} color="rgb(220 38 38)" />}
											/>
										</>
									) : null}
								</View>
							</View>
						);
					})
				)}
			</Card>

			<TeamFormSheet
				open={formOpen}
				onOpenChange={setFormOpen}
				team={editingTeam}
				onSubmit={handleFormSubmit}
				isPending={createTeam.isPending || updateTeam.isPending}
			/>

			<ConfirmDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				title="Excluir equipe"
				description={`Tem certeza que deseja excluir ${deletingTeam?.name}? Esta ação não pode ser desfeita.`}
				confirmLabel={deleteTeam.isPending ? "Excluindo…" : "Excluir"}
				destructive
				loading={deleteTeam.isPending}
				onConfirm={handleDeleteConfirm}
			/>

			<TeamMembersSheet
				open={membersSheetOpen}
				onOpenChange={setMembersSheetOpen}
				team={selectedTeam}
				currentUserId={user?.id ?? null}
			/>
		</View>
	);
}
