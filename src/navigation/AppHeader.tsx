import { useIsFocused } from "@react-navigation/native";
import { useId } from "react";
import { StatusBar, View } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { YggdrasilIcon } from "@/components/shared/YggdrasilLogo";
import { Text } from "@/components/ui/Text";

// O header é roxo nos dois temas, então as cores não variam com o tema
export const HEADER_FOREGROUND = "rgb(250 250 250)";
const HEADER_ACCENT = "rgb(177 140 230)";

/** Fundo roxo com a linha lavanda em degradê na borda inferior */
export function AppHeaderBackground() {
	// Ícones claros sobre o roxo; ao sair da tela (ex: Scanner) volta o StatusBar do tema
	const isFocused = useIsFocused();
	const gradientId = useId();

	return (
		<View className="flex-1 bg-header">
			{isFocused ? <StatusBar barStyle="light-content" /> : null}
			<Svg
				height={2}
				width="100%"
				style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}
			>
				<Defs>
					<LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
						<Stop offset="0" stopColor={HEADER_ACCENT} stopOpacity={0} />
						<Stop offset="0.5" stopColor={HEADER_ACCENT} stopOpacity={0.7} />
						<Stop offset="1" stopColor={HEADER_ACCENT} stopOpacity={0} />
					</LinearGradient>
				</Defs>
				<Rect width="100%" height={2} fill={`url(#${gradientId})`} />
			</Svg>
		</View>
	);
}

export function AppHeaderTitle({ children }: { children: string }) {
	return (
		<View className="flex-row items-center gap-2">
			<YggdrasilIcon size={26} color={HEADER_FOREGROUND} />
			<Text
				className="text-lg font-semibold text-header-foreground"
				numberOfLines={1}
			>
				{children}
			</Text>
		</View>
	);
}
