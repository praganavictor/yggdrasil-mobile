import { type RouteProp, useRoute } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { Button } from "@/components/ui/Button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Text } from "@/components/ui/Text";
import { cn } from "@/lib/utils";
import { useAuthState } from "@/modules/auth/presentation/hooks/useAuthState";
import { useChangePassword } from "@/modules/auth/presentation/hooks/useChangePassword";
import { TeamsManager } from "@/modules/teams/presentation/components/TeamsManager";
import { useDefaultTeam } from "@/modules/teams/presentation/hooks/useDefaultTeam";
import { useTeams } from "@/modules/teams/presentation/hooks/useTeams";
import {
	type DrawerParamList,
	type SettingsTab,
	useAppNavigation,
} from "@/navigation/types";

function ProfileTab() {
	const { user } = useAuthState();
	const changePassword = useChangePassword();

	const [form, setForm] = useState({
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	});
	const [feedback, setFeedback] = useState<{
		type: "success" | "error";
		message: string;
	} | null>(null);

	function handleSubmit() {
		setFeedback(null);

		if (form.newPassword !== form.confirmPassword) {
			setFeedback({ type: "error", message: "As senhas não coincidem." });
			return;
		}

		if (form.newPassword.length < 6) {
			setFeedback({
				type: "error",
				message: "A nova senha deve ter pelo menos 6 caracteres.",
			});
			return;
		}

		changePassword.mutate(
			{
				currentPassword: form.currentPassword,
				newPassword: form.newPassword,
			},
			{
				onSuccess: () => {
					setForm({
						currentPassword: "",
						newPassword: "",
						confirmPassword: "",
					});
					setFeedback({
						type: "success",
						message: "Senha alterada com sucesso.",
					});
				},
				onError: () => {
					setFeedback({
						type: "error",
						message:
							"Senha atual incorreta ou erro ao alterar. Tente novamente.",
					});
				},
			},
		);
	}

	return (
		<View className="gap-6">
			<Card>
				<CardHeader>
					<CardTitle>Informações da conta</CardTitle>
					<CardDescription>Dados do seu perfil</CardDescription>
				</CardHeader>
				<CardContent className="gap-4">
					<Input label="Nome" value={user?.name ?? ""} editable={false} />
					<Input label="E-mail" value={user?.email ?? ""} editable={false} />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Alterar senha</CardTitle>
					<CardDescription>
						Escolha uma senha forte com pelo menos 6 caracteres
					</CardDescription>
				</CardHeader>
				<CardContent className="gap-4">
					<Input
						label="Senha atual"
						value={form.currentPassword}
						onChangeText={(value) =>
							setForm((prev) => ({ ...prev, currentPassword: value }))
						}
						secureTextEntry
						autoCapitalize="none"
					/>
					<Input
						label="Nova senha"
						value={form.newPassword}
						onChangeText={(value) =>
							setForm((prev) => ({ ...prev, newPassword: value }))
						}
						secureTextEntry
						autoCapitalize="none"
					/>
					<Input
						label="Confirmar nova senha"
						value={form.confirmPassword}
						onChangeText={(value) =>
							setForm((prev) => ({ ...prev, confirmPassword: value }))
						}
						secureTextEntry
						autoCapitalize="none"
					/>

					{feedback ? (
						<Text
							className={cn(
								"text-sm",
								feedback.type === "success"
									? "text-emerald-600"
									: "text-destructive",
							)}
						>
							{feedback.message}
						</Text>
					) : null}

					<Button
						label={changePassword.isPending ? "Salvando…" : "Salvar senha"}
						loading={changePassword.isPending}
						disabled={!form.currentPassword || !form.newPassword}
						onPress={handleSubmit}
					/>
				</CardContent>
			</Card>
		</View>
	);
}

function TeamsTab() {
	const { data: teams = [] } = useTeams();
	const { defaultTeamId, setDefault, isSaving } = useDefaultTeam();

	const selectedTeam = teams.find((team) => team.id === defaultTeamId);

	return (
		<View className="gap-6">
			<Card>
				<CardHeader>
					<CardTitle>Equipe padrão</CardTitle>
					<CardDescription>
						Pré-selecionada automaticamente em Produtos, Movimentações e Início.
					</CardDescription>
				</CardHeader>
				<CardContent className="gap-3">
					<Select
						value={defaultTeamId}
						onValueChange={(value) => setDefault(value || null)}
						placeholder="Nenhuma equipe padrão"
						disabled={isSaving}
						options={teams.map((team) => ({
							value: team.id,
							label: team.name,
						}))}
					/>

					{selectedTeam ? (
						<Text className="text-xs text-muted-foreground">
							Equipe padrão atual:{" "}
							<Text className="text-xs font-medium">{selectedTeam.name}</Text>
						</Text>
					) : null}

					{defaultTeamId ? (
						<Button
							label="Remover padrão"
							variant="ghost"
							size="sm"
							disabled={isSaving}
							onPress={() => setDefault(null)}
						/>
					) : null}
				</CardContent>
			</Card>

			<TeamsManager />
		</View>
	);
}

export function SettingsPage() {
	const route = useRoute<RouteProp<DrawerParamList, "Configuracoes">>();
	const navigation = useAppNavigation();
	const requestedTab = route.params?.tab;
	const [activeTab, setActiveTab] = useState<SettingsTab>(
		requestedTab ?? "perfil",
	);

	// Outras telas abrem Configurações direto numa aba (ex: "Gerenciar equipes").
	// O param é limpo após o uso: telas do drawer continuam montadas, e sem
	// isso um segundo pedido pela mesma aba não dispararia o efeito.
	useEffect(() => {
		if (!requestedTab) return;
		setActiveTab(requestedTab);
		navigation.setParams({ tab: undefined });
	}, [requestedTab, navigation]);

	const tabs: { id: SettingsTab; label: string }[] = [
		{ id: "perfil", label: "Perfil" },
		{ id: "equipes", label: "Equipes" },
	];

	return (
		<View className="flex-1 bg-background">
			<View className="flex-row gap-1 border-b border-border px-4">
				{tabs.map((tab) => {
					const isActive = activeTab === tab.id;
					return (
						<Pressable
							key={tab.id}
							onPress={() => setActiveTab(tab.id)}
							accessibilityRole="tab"
							accessibilityState={{ selected: isActive }}
							className={cn(
								"border-b-2 px-4 py-3",
								isActive ? "border-primary" : "border-transparent",
							)}
						>
							<Text
								className={cn(
									"text-sm font-medium",
									isActive ? "text-foreground" : "text-muted-foreground",
								)}
							>
								{tab.label}
							</Text>
						</Pressable>
					);
				})}
			</View>

			<ScrollView
				contentContainerClassName="p-4 pb-10"
				keyboardShouldPersistTaps="handled"
			>
				{activeTab === "perfil" ? <ProfileTab /> : <TeamsTab />}
			</ScrollView>
		</View>
	);
}
