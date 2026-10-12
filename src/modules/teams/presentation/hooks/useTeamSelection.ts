import { useSyncExternalStore } from "react";
import {
	ALL_TEAMS,
	type TeamScope,
} from "@/modules/teams/domain/entities/Team";
import { useDefaultTeam } from "@/modules/teams/presentation/hooks/useDefaultTeam";

// Seleção compartilhada entre as telas enquanto o app estiver aberto
let currentSelection: TeamScope = ALL_TEAMS;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
	listeners.add(listener);
	return () => listeners.delete(listener);
}

function getSelection() {
	return currentSelection;
}

function setSelection(value: string) {
	currentSelection = value;
	for (const listener of listeners) listener();
}

export function useTeamSelection() {
	const selection = useSyncExternalStore(subscribe, getSelection);
	const { defaultTeamId, setDefault } = useDefaultTeam();

	function select(value: string) {
		if (!value) return;
		setSelection(value);
		if (value !== ALL_TEAMS && value !== defaultTeamId) {
			setDefault(value);
		}
	}

	const isAllView = selection === ALL_TEAMS;

	return {
		selection,
		isAllView,
		selectedTeamId: isAllView ? null : selection,
		select,
	};
}
