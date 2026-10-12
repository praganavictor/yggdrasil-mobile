import type { ProductQueryParams } from "@/modules/products/application/dtos/ProductDto";
import type { Product } from "@/modules/products/domain/entities/Product";
import type { IProductRepository } from "@/modules/products/domain/repositories/IProductRepository";
import type { TeamScope } from "@/modules/teams/domain/entities/Team";
import type { PaginatedResult } from "@/shared/types/pagination";

export class GetProductsUseCase {
	constructor(private readonly repository: IProductRepository) {}

	execute(
		scope: TeamScope,
		params?: ProductQueryParams,
	): Promise<PaginatedResult<Product>> {
		return this.repository.findAll(scope, params);
	}
}
