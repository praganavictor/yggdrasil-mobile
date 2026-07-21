import type { DrawerNavigationProp } from "@react-navigation/drawer";
import type {
	CompositeNavigationProp,
	NavigatorScreenParams,
} from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

export type DrawerParamList = {
	Inicio: undefined;
	Produtos: undefined;
	Movimentacoes: undefined;
	Equipes: undefined;
	Configuracoes: undefined;
};

export type RootStackParamList = {
	Entrar: undefined;
	Main: NavigatorScreenParams<DrawerParamList>;
	Scanner: undefined;
};

/**
 * As telas ficam dentro do Drawer, que por sua vez fica dentro do Stack raiz.
 * O tipo composto deixa uma mesma tela navegar para irmãs do drawer
 * (ex: "Produtos") e para telas do stack (ex: "Scanner").
 */
export type AppNavigationProp = CompositeNavigationProp<
	DrawerNavigationProp<DrawerParamList>,
	NativeStackNavigationProp<RootStackParamList>
>;

export function useAppNavigation(): AppNavigationProp {
	return useNavigation<AppNavigationProp>();
}

declare global {
	namespace ReactNavigation {
		interface RootParamList extends RootStackParamList {}
	}
}
