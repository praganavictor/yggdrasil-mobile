import { Badge } from "@/components/ui/Badge";

interface StockBadgeProps {
	quantity: number;
	minimum: number;
}

export function StockBadge({ quantity, minimum }: StockBadgeProps) {
	if (quantity === 0)
		return <Badge variant="destructive" label="Sem estoque" />;
	if (quantity <= minimum)
		return <Badge variant="warning" label="Estoque baixo" />;
	return <Badge variant="success" label="Em estoque" />;
}
