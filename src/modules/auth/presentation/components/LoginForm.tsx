import { Eye, EyeOff, LogIn } from "lucide-react-native";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { useLogin } from "@/modules/auth/presentation/hooks/useLogin";
import { storage } from "@/shared/storage/storage";

const REMEMBERED_EMAIL_KEY = "remembered_email";
const REMEMBERED_PASSWORD_KEY = "remembered_password";

function getSavedCredentials() {
	return {
		email: storage.getString(REMEMBERED_EMAIL_KEY) ?? "",
		password: storage.getString(REMEMBERED_PASSWORD_KEY) ?? "",
	};
}

export function LoginForm() {
	const { login, isPending, errorMessage } = useLogin();
	const [saved] = useState(getSavedCredentials);
	const [email, setEmail] = useState(saved.email);
	const [password, setPassword] = useState(saved.password);
	const [showPassword, setShowPassword] = useState(false);
	const [rememberMe, setRememberMe] = useState(saved.email !== "");

	function handleSubmit() {
		if (rememberMe) {
			storage.set(REMEMBERED_EMAIL_KEY, email);
			storage.set(REMEMBERED_PASSWORD_KEY, password);
		} else {
			storage.remove(REMEMBERED_EMAIL_KEY);
			storage.remove(REMEMBERED_PASSWORD_KEY);
		}
		login({ email, password });
	}

	return (
		<View className="gap-5">
			{errorMessage ? (
				<Alert variant="destructive">
					<AlertDescription variant="destructive">
						{errorMessage}
					</AlertDescription>
				</Alert>
			) : null}

			<Input
				label="E-mail"
				value={email}
				onChangeText={setEmail}
				editable={!isPending}
				placeholder="voce@exemplo.com"
				keyboardType="email-address"
				autoCapitalize="none"
				autoCorrect={false}
				autoComplete="email"
				textContentType="emailAddress"
			/>

			<Input
				label="Senha"
				value={password}
				onChangeText={setPassword}
				editable={!isPending}
				placeholder="••••••••"
				secureTextEntry={!showPassword}
				autoCapitalize="none"
				autoCorrect={false}
				autoComplete="password"
				textContentType="password"
				onSubmitEditing={handleSubmit}
				returnKeyType="go"
				rightSlot={
					<Pressable
						onPress={() => setShowPassword((value) => !value)}
						accessibilityRole="button"
						accessibilityLabel={
							showPassword ? "Ocultar senha" : "Mostrar senha"
						}
						hitSlop={8}
						className="size-10 items-center justify-center"
					>
						{showPassword ? (
							<EyeOff size={18} color="rgb(113 113 122)" />
						) : (
							<Eye size={18} color="rgb(113 113 122)" />
						)}
					</Pressable>
				}
			/>

			<Checkbox
				checked={rememberMe}
				onCheckedChange={setRememberMe}
				disabled={isPending}
				label="Lembrar de mim"
			/>

			<Button
				label="Entrar"
				size="lg"
				loading={isPending}
				disabled={!email || !password}
				onPress={handleSubmit}
				icon={<LogIn size={18} color="rgb(250 250 250)" />}
			/>
		</View>
	);
}
