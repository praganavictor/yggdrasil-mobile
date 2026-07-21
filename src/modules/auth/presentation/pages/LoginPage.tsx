import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/Card";
import { LoginForm } from "@/modules/auth/presentation/components/LoginForm";

export function LoginPage() {
	return (
		<SafeAreaView className="flex-1 bg-muted">
			<KeyboardAvoidingView
				className="flex-1"
				behavior={Platform.OS === "ios" ? "padding" : undefined}
			>
				<ScrollView
					contentContainerClassName="flex-grow justify-center px-4 py-12"
					keyboardShouldPersistTaps="handled"
				>
					<View className="w-full self-center" style={{ maxWidth: 420 }}>
						<Card>
							<CardHeader className="items-center">
								<CardTitle>Entrar na sua conta</CardTitle>
								<CardDescription>
									Informe suas credenciais para continuar
								</CardDescription>
							</CardHeader>
							<CardContent>
								<LoginForm />
							</CardContent>
						</Card>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
