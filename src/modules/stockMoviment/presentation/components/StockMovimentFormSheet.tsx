import { useEffect, useState } from "react";
import { View } from "react-native";
import { Button } from "@/components/ui/Button";
import { DatePicker } from "@/components/ui/DatePicker";
import { Input } from "@/components/ui/Input";
import { RadioGroup } from "@/components/ui/RadioGroup";
import { Select } from "@/components/ui/Select";
import { Sheet } from "@/components/ui/Sheet";
import { Text } from "@/components/ui/Text";
import { formatCurrency } from "@/lib/utils";
import { useProducts } from "@/modules/products/presentation/hooks/useProducts";
import type { CreateStockMovimentDto } from "@/modules/stockMoviment/application/dtos/StockMovimentDto";
import type {
	StockMoviment,
	StockMovimentType,
} from "@/modules/stockMoviment/domain/entities/StockMoviment";

interface StockMovimentFormSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	moviment?: StockMoviment;
	onSubmit: (dto: CreateStockMovimentDto) => void;
	isPending: boolean;
	teamId: string;
}

interface FormState {
	type: StockMovimentType;
	quantity: string;
	price: string;
	date: string;
	productId: string;
}

function toNumber(value: string): number {
	const parsed = Number(value.replace(",", "."));
	return Number.isFinite(parsed) ? parsed : 0;
}

export function StockMovimentFormSheet({
	open,
	onOpenChange,
	moviment,
	onSubmit,
	isPending,
	teamId,
}: StockMovimentFormSheetProps) {
	const { data: productsResult } = useProducts(open ? teamId : null, {
		limit: 100,
	});
	const products = productsResult?.data ?? [];

	const [form, setForm] = useState<FormState>({
		type: "entrada",
		quantity: "1",
		price: "0",
		date: new Date().toISOString(),
		productId: "",
	});

	useEffect(() => {
		if (!open) return;
		if (moviment) {
			setForm({
				type: moviment.type,
				quantity: String(moviment.quantity),
				price: String(moviment.price),
				date: moviment.date,
				productId: moviment.productId,
			});
		} else {
			setForm({
				type: "entrada",
				quantity: "1",
				price: "0",
				date: new Date().toISOString(),
				productId: "",
			});
		}
	}, [moviment, open]);

	const quantity = toNumber(form.quantity);
	const price = toNumber(form.price);

	function handleSubmit() {
		onSubmit({
			type: form.type,
			quantity,
			price,
			date: form.date,
			productId: form.productId,
			teamId,
		});
	}

	return (
		<Sheet
			open={open}
			onOpenChange={onOpenChange}
			title={moviment ? "Editar movimentação" : "Nova movimentação"}
			footer={
				<>
					<Button
						label={isPending ? "Salvando…" : "Salvar"}
						loading={isPending}
						disabled={!form.productId || quantity <= 0}
						onPress={handleSubmit}
					/>
					<Button
						label="Cancelar"
						variant="outline"
						disabled={isPending}
						onPress={() => onOpenChange(false)}
					/>
				</>
			}
		>
			<Select
				label="Produto"
				value={form.productId || null}
				onValueChange={(value) =>
					setForm((prev) => ({ ...prev, productId: value }))
				}
				placeholder="Selecione um produto"
				options={products.map((product) => ({
					value: product.id,
					label: product.name,
				}))}
			/>

			<RadioGroup
				label="Tipo"
				horizontal
				value={form.type}
				onValueChange={(value) => setForm((prev) => ({ ...prev, type: value }))}
				options={[
					{ value: "entrada", label: "Entrada" },
					{ value: "saída", label: "Saída" },
				]}
			/>

			<DatePicker
				label="Data"
				value={form.date}
				onChange={(date) => setForm((prev) => ({ ...prev, date }))}
			/>

			<View className="flex-row gap-3">
				<Input
					containerClassName="flex-1"
					label="Quantidade"
					value={form.quantity}
					onChangeText={(value) =>
						setForm((prev) => ({ ...prev, quantity: value }))
					}
					keyboardType="number-pad"
				/>
				<Input
					containerClassName="flex-1"
					label="Preço unitário (R$)"
					value={form.price}
					onChangeText={(value) =>
						setForm((prev) => ({ ...prev, price: value }))
					}
					keyboardType="decimal-pad"
				/>
			</View>

			{quantity > 0 && price > 0 ? (
				<Text className="text-sm text-muted-foreground">
					Total:{" "}
					<Text className="text-sm font-medium">
						{formatCurrency(quantity * price)}
					</Text>
				</Text>
			) : null}
		</Sheet>
	);
}
