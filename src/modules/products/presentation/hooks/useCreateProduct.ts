import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateProductDto } from "@/modules/products/application/dtos/ProductDto";
import { CreateProductUseCase } from "@/modules/products/application/useCases/CreateProductUseCase";
import { ProductRepository } from "@/modules/products/infrastructure/repositories/ProductRepository";

const productRepository = new ProductRepository();
const createProductUseCase = new CreateProductUseCase(productRepository);

export function useCreateProduct() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ teamId, dto }: { teamId: string; dto: CreateProductDto }) =>
			createProductUseCase.execute(teamId, dto),
		onSuccess: () => {
			// Prefixo cobre as listagens (de uma ou de todas as equipes) e as buscas por código de barras
			queryClient.invalidateQueries({ queryKey: ["products"] });
		},
	});
}
