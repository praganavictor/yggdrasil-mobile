import { StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as TanStackQueryProvider from "@/integrations/tanstack-query/root-provider";
import { RootNavigator } from "@/navigation/RootNavigator";
import { useTheme } from "@/shared/hooks/useTheme";

import "./global.css";

const queryContext = TanStackQueryProvider.getContext();

function ThemedStatusBar() {
	const { theme } = useTheme();
	return (
		<StatusBar
			barStyle={theme === "dark" ? "light-content" : "dark-content"}
			backgroundColor="transparent"
			translucent
		/>
	);
}

function App() {
	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<SafeAreaProvider>
				<TanStackQueryProvider.Provider {...queryContext}>
					<ThemedStatusBar />
					<RootNavigator />
				</TanStackQueryProvider.Provider>
			</SafeAreaProvider>
		</GestureHandlerRootView>
	);
}

export default App;
