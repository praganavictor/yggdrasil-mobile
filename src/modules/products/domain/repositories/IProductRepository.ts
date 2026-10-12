import type {
	CreateProductDto,
	ProductQueryParams,
	UpdateProductDto,
} from "@/modules/products/application/dtos/ProductDto";
import type { Product } from "@/modules/products/domain/entities/Product";
import type { TeamScope } from "@/modules/teams/domain/entities/Team";
import type { PaginatedResult } from "@/shared/types/pagination";

export interface IProductRepository {
	findAll(
		scope: TeamScope,
		params?: ProductQueryParams,
	): Promise<PaginatedResult<Product>>;
	findById(id: string): Promise<Product>;
	findByBarcode(teamId: string, barcode: string): Promise<Product>;
	create(teamId: string, dto: CreateProductDto): Promise<Product>;
	update(id: string, dto: UpdateProductDto): Promise<Product>;
	delete(id: string): Promise<void>;
}
