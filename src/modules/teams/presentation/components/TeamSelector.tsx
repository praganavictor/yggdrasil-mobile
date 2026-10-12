import { Select } from "@/components/ui/Select";
import { ALL_TEAMS, type Team } from "@/modules/teams/domain/entities/Team";

interface TeamSelectorProps {
	teams: Team[];
	value: string;
	onChange: (value: string) => void;
}

export function TeamSelector({ teams, value, onChange }: TeamSelectorProps) {
	return (
		<Select
			label="Equipe"
			value={value}
			onValueChange={onChange}
			placeholder="Selecione uma equipe"
			options={[
				{ value: ALL_TEAMS, label: "Todas as equipes" },
				...teams.map((team) => ({ value: team.id, label: team.name })),
			]}
		/>
	);
}
