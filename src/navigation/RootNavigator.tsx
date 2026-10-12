import { createDrawerNavigator } from "@react-navigation/drawer";
import {
	DarkTheme,
	DefaultTheme,
	NavigationContainer,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuthState } from "@/modules/auth/presentation/hooks/useAuthState";
import { LoginPage } from "@/modules/auth/presentation/pages/LoginPage";
import { DashboardPage } from "@/modules/dashboard/presentation/pages/DashboardPage";
import { BarcodeScannerPage } from "@/modules/products/presentation/pages/BarcodeScannerPage";
import { ProductsPage } from "@/modules/products/presentation/pages/ProductsPage";
import { SettingsPage } from "@/modules/settings/presentation/pages/SettingsPage";
import { StockMovimentsPage } from "@/modules/stockMoviment/presentation/pages/StockMovimentsPage";
import {
	AppHeaderBackground,
	AppHeaderTitle,
	HEADER_FOREGROUND,
} from "@/navigation/AppHeader";
import { DrawerContent } from "@/navigation/DrawerContent";
import type { DrawerParamList, RootStackParamList } from "@/navigation/types";
import { useTheme } from "@/shared/hooks/useTheme";

const Drawer = createDrawerNavigator<DrawerParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function MainDrawer() {
	return (
		<Drawer.Navigator
			drawerContent={(props) => <DrawerContent {...props} />}
			screenOptions={{
				headerShown: true,
				drawerType: "front",
				headerTintColor: HEADER_FOREGROUND,
				headerBackground: () => <AppHeaderBackground />,
				headerTitle: ({ children }) => (
					<AppHeaderTitle>{children}</AppHeaderTitle>
				),
			}}
		>
			<Drawer.Screen
				name="Inicio"
				component={DashboardPage}
				options={{ title: "Início" }}
			/>
			<Drawer.Screen
				name="Produtos"
				component={ProductsPage}
				options={{ title: "Produtos" }}
			/>
			<Drawer.Screen
				name="Movimentacoes"
				component={StockMovimentsPage}
				options={{ title: "Movimentações" }}
			/>
			<Drawer.Screen
				name="Configuracoes"
				component={SettingsPage}
				options={{ title: "Configurações" }}
			/>
		</Drawer.Navigator>
	);
}

export function RootNavigator() {
	// Reage ao tokenStorage: login e logout trocam a árvore de telas sozinhos,
	// sem navegação imperativa nos hooks.
	const { isAuthenticated } = useAuthState();
	const { theme } = useTheme();

	return (
		<NavigationContainer theme={theme === "dark" ? DarkTheme : DefaultTheme}>
			<Stack.Navigator screenOptions={{ headerShown: false }}>
				{isAuthenticated ? (
					<>
						<Stack.Screen name="Main" component={MainDrawer} />
						<Stack.Screen
							name="Scanner"
							component={BarcodeScannerPage}
							options={{ animation: "slide_from_bottom" }}
						/>
					</>
				) : (
					<Stack.Screen name="Entrar" component={LoginPage} />
				)}
			</Stack.Navigator>
		</NavigationContainer>
	);
}
