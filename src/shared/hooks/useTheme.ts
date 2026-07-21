import { useColorScheme } from "nativewind";
import { useCallback, useEffect } from "react";
import { storage } from "@/shared/storage/storage";

const THEME_KEY = "theme";

type Theme = "light" | "dark";

export function useTheme() {
	const { colorScheme, setColorScheme } = useColorScheme();

	// Restaura a preferência salva na primeira montagem.
	useEffect(() => {
		const stored = storage.getString(THEME_KEY);
		if (stored === "dark" || stored === "light") {
			setColorScheme(stored);
		}
	}, [setColorScheme]);

	const toggleTheme = useCallback(() => {
		const next: Theme = colorScheme === "dark" ? "light" : "dark";
		storage.set(THEME_KEY, next);
		setColorScheme(next);
	}, [colorScheme, setColorScheme]);

	return { theme: (colorScheme ?? "light") as Theme, toggleTheme };
}
