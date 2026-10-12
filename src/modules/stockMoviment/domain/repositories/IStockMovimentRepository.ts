import type {
	CreateStockMovimentDto,
	StockMovimentQueryParams,
	UpdateStockMovimentDto,
} from "@/modules/stockMoviment/application/dtos/StockMovimentDto";
import type { StockMoviment } from "@/modules/stockMoviment/domain/entities/StockMoviment";
import type { TeamScope } from "@/modules/teams/domain/entities/Team";
import type { PaginatedResult } from "@/shared/types/pagination";

export interface IStockMovimentRepository {
	findAll(
		scope: TeamScope,
		params?: StockMovimentQueryParams,
	): Promise<PaginatedResult<StockMoviment>>;
	findById(id: string): Promise<StockMoviment>;
	create(dto: CreateStockMovimentDto): Promise<StockMoviment>;
	update(id: string, dto: UpdateStockMovimentDto): Promise<StockMoviment>;
	delete(id: string): Promise<void>;
}
