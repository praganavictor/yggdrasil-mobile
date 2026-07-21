import { useMutation } from "@tanstack/react-query";
import type { LoginInputDto } from "@/modules/auth/application/dtos/LoginDto";
import { LoginUseCase } from "@/modules/auth/application/useCases/LoginUseCase";
import { AuthError } from "@/modules/auth/domain/errors/AuthError";
import { AuthRepository } from "@/modules/auth/infrastructure/repositories/AuthRepository";

const authRepository = new AuthRepository();
const loginUseCase = new LoginUseCase(authRepository);

export function useLogin() {
	// A navegação acontece sozinha: o RootNavigator observa o tokenStorage.
	const mutation = useMutation({
		mutationFn: (credentials: LoginInputDto) =>
			loginUseCase.execute(credentials),
	});

	const errorMessage =
		mutation.error instanceof AuthError
			? mutation.error.message
			: mutation.error
				? "Ocorreu um erro inesperado. Tente novamente."
				: null;

	return {
		login: mutation.mutate,
		isPending: mutation.isPending,
		errorMessage,
		isError: mutation.isError,
	};
}
