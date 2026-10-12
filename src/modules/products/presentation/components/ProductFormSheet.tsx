import { useEffect, useState } from "react";
import { View } from "react-native";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Sheet } from "@/components/ui/Sheet";
import { Text } from "@/components/ui/Text";
import type { CreateProductDto } from "@/modules/products/application/dtos/ProductDto";
import type { Product } from "@/modules/products/domain/entities/Product";
import type { Team } from "@/modules/teams/domain/entities/Team";

interface ProductFormSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	product?: Product;
	onSubmit: (dto: CreateProductDto, teamId?: string) => void;
	isPending: boolean;
	errorMessage?: string;
	/** Quando informado, o cadastro pede a equipe do novo produto */
	teamOptions?: Team[];
}

/**
 * Campos numéricos ficam como texto enquanto o usuário digita: em mobile,
 * converter a cada tecla atrapalha (apaga o campo, trava o "0" inicial).
 */
interface FormState {
	name: string;
	description: string;
	local: string;
	category: string;
	subcategory: string;
	unity: string;
	quantity: string;
	minumum: string;
	price: string;
	isPortioned: boolean;
}

const emptyForm: FormState = {
	name: "",
	description: "",
	local: "",
	category: "",
	subcategory: "",
	unity: "",
	quantity: "0",
	minumum: "0",
	price: "0",
	isPortioned: false,
};

function toNumber(value: string): number {
	const parsed = Number(value.replace(",", "."));
	return Number.isFinite(parsed) ? parsed : 0;
}

export function ProductFormSheet({
	open,
	onOpenChange,
	product,
	onSubmit,
	isPending,
	errorMessage,
	teamOptions,
}: ProductFormSheetProps) {
	const [form, setForm] = useState<FormState>(emptyForm);
	const [teamId, setTeamId] = useState("");
	const asksTeam = !product && teamOptions !== undefined;

	const onlyTeamId = teamOptions?.length === 1 ? teamOptions[0].id : "";

	useEffect(() => {
		if (!open) return;
		setTeamId(onlyTeamId);
		if (product) {
			setForm({
				name: product.name,
				description: product.description,
				local: product.local,
				category: product.category,
				subcategory: product.subcategory,
				unity: product.unity,
				quantity: String(product.quantity),
				minumum: String(product.minumum),
				price: String(product.price),
				isPortioned: product.isPortioned,
			});
		} else {
			setForm(emptyForm);
		}
	}, [product, open, onlyTeamId]);

	function handleChange(field: keyof FormState, value: string | boolean) {
		setForm((prev) => ({ ...prev, [field]: value }));
	}

	function handleSubmit() {
		onSubmit(
			{
				name: form.name,
				description: form.description,
				local: form.local,
				category: form.category,
				subcategory: form.subcategory,
				unity: form.unity,
				quantity: toNumber(form.quantity),
				minumum: toNumber(form.minumum),
				price: toNumber(form.price),
				isPortioned: form.isPortioned,
			},
			asksTeam ? teamId : undefined,
		);
	}

	return (
		<Sheet
			open={open}
			onOpenChange={onOpenChange}
			title={product ? "Editar produto" : "Novo produto"}
			footer={
				<>
					<Button
						label={isPending ? "Salvando…" : "Salvar"}
						loading={isPending}
						disabled={!form.name.trim() || (asksTeam && !teamId)}
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
			{asksTeam ? (
				<Select
					label="Equipe"
					value={teamId || null}
					onValueChange={setTeamId}
					placeholder="Selecione uma equipe"
					options={teamOptions.map((team) => ({
						value: team.id,
						label: team.name,
					}))}
				/>
			) : null}

			<Input
				label="Nome"
				value={form.name}
				onChangeText={(value) => handleChange("name", value)}
				placeholder="Nome do produto"
			/>

			<Textarea
				label="Descrição"
				value={form.description}
				onChangeText={(value) => handleChange("description", value)}
				placeholder="Descrição do produto"
			/>

			<Input
				label="Local"
				value={form.local}
				onChangeText={(value) => handleChange("local", value)}
				placeholder="Ex: Depósito A - Prateleira 3"
			/>

			<View className="flex-row gap-3">
				<Input
					containerClassName="flex-1"
					label="Categoria"
					value={form.category}
					onChangeText={(value) => handleChange("category", value)}
					placeholder="Ex: Móveis"
				/>
				<Input
					containerClassName="flex-1"
					label="Subcategoria"
					value={form.subcategory}
					onChangeText={(value) => handleChange("subcategory", value)}
					placeholder="Ex: Cadeiras"
				/>
			</View>

			<Input
				label="Unidade"
				value={form.unity}
				onChangeText={(value) => handleChange("unity", value)}
				placeholder="Ex: unidade, caixa, kg"
			/>

			<Checkbox
				checked={form.isPortioned}
				onCheckedChange={(checked) => handleChange("isPortioned", checked)}
				label="Produto porcionado"
			/>

			<View className="flex-row gap-3">
				<Input
					containerClassName="flex-1"
					label="Quantidade"
					value={form.quantity}
					onChangeText={(value) => handleChange("quantity", value)}
					keyboardType="numeric"
				/>
				<Input
					containerClassName="flex-1"
					label="Quantidade mínima"
					value={form.minumum}
					onChangeText={(value) => handleChange("minumum", value)}
					keyboardType="numeric"
				/>
			</View>

			<Input
				label="Preço (R$)"
				value={form.price}
				onChangeText={(value) => handleChange("price", value)}
				keyboardType="decimal-pad"
			/>

			{errorMessage ? (
				<Text className="text-xs text-destructive">{errorMessage}</Text>
			) : null}
		</Sheet>
	);
}
