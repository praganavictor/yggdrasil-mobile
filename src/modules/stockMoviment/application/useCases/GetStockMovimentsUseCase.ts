import type { StockMovimentQueryParams } from "@/modules/stockMoviment/application/dtos/StockMovimentDto";
import type { StockMoviment } from "@/modules/stockMoviment/domain/entities/StockMoviment";
import type { IStockMovimentRepository } from "@/modules/stockMoviment/domain/repositories/IStockMovimentRepository";
import type { TeamScope } from "@/modules/teams/domain/entities/Team";
import type { PaginatedResult } from "@/shared/types/pagination";

export class GetStockMovimentsUseCase {
	constructor(private readonly repository: IStockMovimentRepository) {}

	execute(
		scope: TeamScope,
		params?: StockMovimentQueryParams,
	): Promise<PaginatedResult<StockMoviment>> {
		return this.repository.findAll(scope, params);
	}
}
