import {
	type DrawerContentComponentProps,
	DrawerContentScrollView,
} from "@react-navigation/drawer";
import {
	ArrowLeftRight,
	Home,
	LogOut,
	type LucideIcon,
	Moon,
	Package,
	Settings,
	Sun,
} from "lucide-react-native";
import { Pressable, View } from "react-native";
import { Text } from "@/components/ui/Text";
import { cn } from "@/lib/utils";
import { useAuthState } from "@/modules/auth/presentation/hooks/useAuthState";
import { useLogout } from "@/modules/auth/presentation/hooks/useLogout";
import type { DrawerParamList } from "@/navigation/types";
import { useTheme } from "@/shared/hooks/useTheme";

const ITEMS: {
	name: keyof DrawerParamList;
	label: string;
	icon: LucideIcon;
}[] = [
	{ name: "Inicio", label: "Início", icon: Home },
	{ name: "Produtos", label: "Produtos", icon: Package },
	{ name: "Movimentacoes", label: "Movimentações", icon: ArrowLeftRight },
	{ name: "Configuracoes", label: "Configurações", icon: Settings },
];

export function DrawerContent(props: DrawerContentComponentProps) {
	const { navigation, state } = props;
	const { logout, isPending } = useLogout();
	const { theme, toggleTheme } = useTheme();
	const { user } = useAuthState();

	const activeRouteName = state.routeNames[state.index];
	const iconColor = theme === "dark" ? "rgb(250 250 250)" : "rgb(24 24 27)";

	return (
		<View className="flex-1 bg-background">
			<DrawerContentScrollView {...props} contentContainerClassName="pt-0">
				<View className="gap-0.5 border-b border-border px-4 pb-4">
					<Text className="text-lg font-semibold">Yggdrasil</Text>
					{user ? (
						<Text className="text-sm text-muted-foreground" numberOfLines={1}>
							{user.name || user.email}
						</Text>
					) : null}
				</View>

				<View className="gap-1 p-2">
					{ITEMS.map((item) => {
						const isActive = activeRouteName === item.name;
						const Icon = item.icon;
						return (
							<Pressable
								key={item.name}
								onPress={() => navigation.navigate(item.name)}
								accessibilityRole="button"
								accessibilityState={{ selected: isActive }}
								className={cn(
									"flex-row items-center gap-3 rounded-lg px-3 py-3",
									isActive ? "bg-primary" : "active:bg-muted",
								)}
							>
								<Icon
									size={18}
									color={isActive ? "rgb(250 250 250)" : iconColor}
								/>
								<Text
									className={cn(
										"text-sm font-medium",
										isActive && "text-primary-foreground",
									)}
								>
									{item.label}
								</Text>
							</Pressable>
						);
					})}
				</View>
			</DrawerContentScrollView>

			<View className="gap-1 border-t border-border p-2">
				<Pressable
					onPress={toggleTheme}
					accessibilityRole="button"
					accessibilityLabel={
						theme === "dark"
							? "Mudar para tema claro"
							: "Mudar para tema escuro"
					}
					className="flex-row items-center gap-3 rounded-lg px-3 py-3 active:bg-muted"
				>
					{theme === "dark" ? (
						<Sun size={18} color={iconColor} />
					) : (
						<Moon size={18} color={iconColor} />
					)}
					<Text className="text-sm font-medium">
						{theme === "dark" ? "Tema claro" : "Tema escuro"}
					</Text>
				</Pressable>

				<Pressable
					onPress={() => logout()}
					disabled={isPending}
					accessibilityRole="button"
					accessibilityLabel="Sair"
					className={cn(
						"flex-row items-center gap-3 rounded-lg px-3 py-3 active:bg-muted",
						isPending && "opacity-50",
					)}
				>
					<LogOut size={18} color="rgb(220 38 38)" />
					<Text className="text-sm font-medium text-destructive">Sair</Text>
				</Pressable>
			</View>
		</View>
	);
}
