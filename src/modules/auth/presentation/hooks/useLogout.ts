import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LogoutUseCase } from "@/modules/auth/application/useCases/LogoutUseCase";
import { AuthRepository } from "@/modules/auth/infrastructure/repositories/AuthRepository";

const authRepository = new AuthRepository();
const logoutUseCase = new LogoutUseCase(authRepository);

export function useLogout() {
	const queryClient = useQueryClient();

	// A navegação acontece sozinha: o RootNavigator observa o tokenStorage.
	const mutation = useMutation({
		mutationFn: () => logoutUseCase.execute(),
		onSettled: () => {
			// Impede que dados da sessão anterior vazem para o próximo login.
			queryClient.clear();
		},
	});

	return {
		logout: mutation.mutate,
		isPending: mutation.isPending,
	};
}
