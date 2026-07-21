import { LogOut, Plus, Trash2, User } from "lucide-react-native";
import { useState } from "react";
import { View } from "react-native";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Sheet } from "@/components/ui/Sheet";
import { Text } from "@/components/ui/Text";
import type { AddTeamMemberDto } from "@/modules/teams/application/dtos/TeamDto";
import type {
	Team,
	TeamMemberRole,
	TeamMembership,
} from "@/modules/teams/domain/entities/Team";
import { useAddTeamMember } from "@/modules/teams/presentation/hooks/useAddTeamMember";
import { useRemoveTeamMember } from "@/modules/teams/presentation/hooks/useRemoveTeamMember";
import { useTeamMembers } from "@/modules/teams/presentation/hooks/useTeamMembers";

const roleLabel: Record<TeamMemberRole, string> = {
	ADMIN: "Admin",
	SUPERVISOR: "Supervisor",
	ATTENDANT: "Atendente",
};

const roleVariant: Record<TeamMemberRole, "default" | "secondary" | "outline"> =
	{
		ADMIN: "default",
		SUPERVISOR: "secondary",
		ATTENDANT: "outline",
	};

function AddMemberSheet({
	teamId,
	open,
	onClose,
}: {
	teamId: string;
	open: boolean;
	onClose: () => void;
}) {
	const [form, setForm] = useState<AddTeamMemberDto>({
		email: "",
		role: "ATTENDANT",
	});
	const addMember = useAddTeamMember(teamId);

	function handleSubmit() {
		addMember.mutate(form, {
			onSuccess: () => {
				setForm({ email: "", role: "ATTENDANT" });
				onClose();
			},
		});
	}

	return (
		<Sheet
			open={open}
			onOpenChange={(value) => !value && onClose()}
			title="Adicionar membro"
			description="Digite o e-mail do usuário e selecione o papel na equipe."
			footer={
				<>
					<Button
						label={addMember.isPending ? "Adicionando…" : "Adicionar"}
						loading={addMember.isPending}
						disabled={!form.email.trim()}
						onPress={handleSubmit}
					/>
					<Button
						label="Cancelar"
						variant="outline"
						disabled={addMember.isPending}
						onPress={onClose}
					/>
				</>
			}
		>
			<Input
				label="E-mail"
				value={form.email}
				onChangeText={(value) => setForm((prev) => ({ ...prev, email: value }))}
				placeholder="usuario@exemplo.com"
				keyboardType="email-address"
				autoCapitalize="none"
				autoCorrect={false}
			/>

			<Select
				label="Papel"
				value={form.role ?? "ATTENDANT"}
				onValueChange={(value) =>
					setForm((prev) => ({ ...prev, role: value as TeamMemberRole }))
				}
				options={[
					{ value: "ATTENDANT", label: "Atendente" },
					{ value: "SUPERVISOR", label: "Supervisor" },
					{ value: "ADMIN", label: "Admin" },
				]}
			/>

			{addMember.isError ? (
				<Text className="text-xs text-destructive">
					Erro ao adicionar o membro. Verifique se o e-mail está cadastrado.
				</Text>
			) : null}
		</Sheet>
	);
}

interface TeamMembersSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	team: Team | null;
	currentUserId: string | null;
}

export function TeamMembersSheet({
	open,
	onOpenChange,
	team,
	currentUserId,
}: TeamMembersSheetProps) {
	const { data: members = [], isLoading } = useTeamMembers(
		open && team ? team.id : null,
	);
	const [addingMember, setAddingMember] = useState(false);
	const [removingMembership, setRemovingMembership] =
		useState<TeamMembership | null>(null);
	const removeMember = useRemoveTeamMember(team?.id ?? "");

	const isOwner = team?.ownerId === currentUserId;
	const isSelfRemoval = removingMembership?.userId === currentUserId;

	function handleRemoveConfirm() {
		if (!removingMembership) return;
		removeMember.mutate(removingMembership.id, {
			onSuccess: () => setRemovingMembership(null),
		});
	}

	return (
		<>
			<Sheet
				open={open}
				onOpenChange={onOpenChange}
				title={`${team?.name ?? "Equipe"} — Membros`}
				footer={
					isOwner ? (
						<Button
							label="Adicionar membro"
							variant="outline"
							onPress={() => setAddingMember(true)}
							icon={<Plus size={16} color="rgb(113 113 122)" />}
						/>
					) : undefined
				}
			>
				{isLoading ? (
					<Text className="py-6 text-center text-sm text-muted-foreground">
						Carregando membros…
					</Text>
				) : members.length === 0 ? (
					<Text className="py-6 text-center text-sm text-muted-foreground">
						Nenhum membro encontrado.
					</Text>
				) : (
					members.map((membership) => {
						const isSelf = membership.userId === currentUserId;
						return (
							<View
								key={membership.id}
								className="flex-row items-center gap-3 rounded-lg border border-border px-3 py-2.5"
							>
								<View className="size-8 items-center justify-center rounded-full bg-muted">
									<User size={14} color="rgb(113 113 122)" />
								</View>

								<View className="min-w-0 flex-1">
									<Text className="text-sm font-medium" numberOfLines={1}>
										{membership.user.name}
										{isSelf ? (
											<Text className="text-xs text-muted-foreground">
												{" "}
												(você)
											</Text>
										) : null}
									</Text>
									<Text
										className="text-xs text-muted-foreground"
										numberOfLines={1}
									>
										{membership.user.email}
									</Text>
								</View>

								<Badge
									variant={roleVariant[membership.role]}
									label={roleLabel[membership.role]}
								/>

								{isOwner && !isSelf ? (
									<Button
										variant="ghost"
										size="icon"
										className="size-9 shrink-0"
										accessibilityLabel="Remover membro"
										onPress={() => setRemovingMembership(membership)}
										icon={<Trash2 size={16} color="rgb(220 38 38)" />}
									/>
								) : isSelf ? (
									<Button
										variant="ghost"
										size="icon"
										className="size-9 shrink-0"
										accessibilityLabel="Sair da equipe"
										onPress={() => setRemovingMembership(membership)}
										icon={<LogOut size={16} color="rgb(113 113 122)" />}
									/>
								) : null}
							</View>
						);
					})
				)}
			</Sheet>

			{team ? (
				<AddMemberSheet
					teamId={team.id}
					open={addingMember}
					onClose={() => setAddingMember(false)}
				/>
			) : null}

			<ConfirmDialog
				open={removingMembership !== null}
				onOpenChange={(value) => !value && setRemovingMembership(null)}
				title={isSelfRemoval ? "Sair da equipe" : "Remover membro"}
				description={
					isSelfRemoval
						? "Tem certeza que deseja sair desta equipe?"
						: `Tem certeza que deseja remover ${removingMembership?.user.name} da equipe?`
				}
				confirmLabel={
					removeMember.isPending
						? "Removendo…"
						: isSelfRemoval
							? "Sair"
							: "Remover"
				}
				destructive
				loading={removeMember.isPending}
				onConfirm={handleRemoveConfirm}
			/>
		</>
	);
}
