import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { ProductQueryParams } from "@/modules/products/application/dtos/ProductDto";
import { GetProductsUseCase } from "@/modules/products/application/useCases/GetProductsUseCase";
import { ProductRepository } from "@/modules/products/infrastructure/repositories/ProductRepository";
import type { TeamScope } from "@/modules/teams/domain/entities/Team";

const productRepository = new ProductRepository();
const getProductsUseCase = new GetProductsUseCase(productRepository);

export const productsQueryKey = (
	scope: TeamScope,
	params?: ProductQueryParams,
) => ["products", scope, params ?? {}] as const;

export function useProducts(
	scope: TeamScope | null,
	params?: ProductQueryParams,
) {
	return useQuery({
		queryKey: productsQueryKey(scope ?? "", params),
		queryFn: () => getProductsUseCase.execute(scope!, params),
		enabled: scope !== null,
		placeholderData: keepPreviousData,
	});
}
