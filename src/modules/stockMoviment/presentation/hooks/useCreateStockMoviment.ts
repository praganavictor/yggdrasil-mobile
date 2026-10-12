import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateStockMovimentDto } from "@/modules/stockMoviment/application/dtos/StockMovimentDto";
import { CreateStockMovimentUseCase } from "@/modules/stockMoviment/application/useCases/CreateStockMovimentUseCase";
import { StockMovimentRepository } from "@/modules/stockMoviment/infrastructure/repositories/StockMovimentRepository";

const stockMovimentRepository = new StockMovimentRepository();
const createStockMovimentUseCase = new CreateStockMovimentUseCase(
	stockMovimentRepository,
);

export function useCreateStockMoviment() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (dto: CreateStockMovimentDto) =>
			createStockMovimentUseCase.execute(dto),
		onSuccess: () => {
			// Prefixos cobrem as listagens de uma ou de todas as equipes
			queryClient.invalidateQueries({ queryKey: ["stock-moviments"] });
			queryClient.invalidateQueries({ queryKey: ["products"] });
		},
	});
}
