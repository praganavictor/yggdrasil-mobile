import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { StockMovimentQueryParams } from "@/modules/stockMoviment/application/dtos/StockMovimentDto";
import { GetStockMovimentsUseCase } from "@/modules/stockMoviment/application/useCases/GetStockMovimentsUseCase";
import { StockMovimentRepository } from "@/modules/stockMoviment/infrastructure/repositories/StockMovimentRepository";
import type { TeamScope } from "@/modules/teams/domain/entities/Team";

const stockMovimentRepository = new StockMovimentRepository();
const getStockMovimentsUseCase = new GetStockMovimentsUseCase(
	stockMovimentRepository,
);

export const stockMovimentsQueryKey = (
	scope: TeamScope,
	params?: StockMovimentQueryParams,
) => ["stock-moviments", scope, params ?? {}] as const;

export function useStockMoviments(
	scope: TeamScope | null,
	params?: StockMovimentQueryParams,
) {
	return useQuery({
		queryKey: stockMovimentsQueryKey(scope ?? "", params),
		queryFn: () => getStockMovimentsUseCase.execute(scope!, params),
		enabled: scope !== null,
		placeholderData: keepPreviousData,
	});
}
