import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Sheet } from "@/components/ui/Sheet";
import type { CreateTeamDto } from "@/modules/teams/application/dtos/TeamDto";
import type { Team } from "@/modules/teams/domain/entities/Team";

interface TeamFormSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	team?: Team;
	onSubmit: (dto: CreateTeamDto) => void;
	isPending: boolean;
}

const emptyForm: CreateTeamDto = { name: "", description: "" };

export function TeamFormSheet({
	open,
	onOpenChange,
	team,
	onSubmit,
	isPending,
}: TeamFormSheetProps) {
	const [form, setForm] = useState<CreateTeamDto>(emptyForm);

	useEffect(() => {
		if (!open) return;
		if (team) {
			setForm({ name: team.name, description: team.description ?? "" });
		} else {
			setForm(emptyForm);
		}
	}, [team, open]);

	function handleSubmit() {
		onSubmit({ ...form, description: form.description || undefined });
	}

	return (
		<Sheet
			open={open}
			onOpenChange={onOpenChange}
			title={team ? "Editar equipe" : "Nova equipe"}
			footer={
				<>
					<Button
						label={isPending ? "Salvando…" : "Salvar"}
						loading={isPending}
						disabled={!form.name.trim()}
						onPress={handleSubmit}
					/>
					<Button
						label="Cancelar"
						variant="outline"
						disabled={isPending}
						onPress={() => onOpenChange(false)}
					/>
				</>
			}
		>
			<Input
				label="Nome"
				value={form.name}
				onChangeText={(value) => setForm((prev) => ({ ...prev, name: value }))}
				placeholder="Nome da equipe"
			/>

			<Textarea
				label="Descrição"
				value={form.description ?? ""}
				onChangeText={(value) =>
					setForm((prev) => ({ ...prev, description: value }))
				}
				placeholder="Descrição opcional da equipe"
			/>
		</Sheet>
	);
}
