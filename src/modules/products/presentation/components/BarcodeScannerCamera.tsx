import { Camera, CameraOff, ScanBarcode } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { Linking, StyleSheet, Vibration, View } from "react-native";
import {
	type Code,
	useCameraDevice,
	useCameraPermission,
	useCodeScanner,
	Camera as VisionCamera,
} from "react-native-vision-camera";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";

interface BarcodeScannerCameraProps {
	onDetected: (barcode: string) => void;
	/** Pausa a leitura sem desmontar a câmera (ex: quando um painel abre por cima). */
	paused?: boolean;
}

const DETECTION_COOLDOWN_MS = 2000;

export function BarcodeScannerCamera({
	onDetected,
	paused = false,
}: BarcodeScannerCameraProps) {
	const device = useCameraDevice("back");
	const { hasPermission, requestPermission } = useCameraPermission();
	const [permissionDenied, setPermissionDenied] = useState(false);
	const [active, setActive] = useState(false);

	const lastDetectionRef = useRef<{ code: string; at: number } | null>(null);
	const onDetectedRef = useRef(onDetected);
	onDetectedRef.current = onDetected;

	const handleActivate = useCallback(async () => {
		if (hasPermission) {
			setActive(true);
			return;
		}
		const granted = await requestPermission();
		setPermissionDenied(!granted);
		setActive(granted);
	}, [hasPermission, requestPermission]);

	// Libera a câmera ao sair da tela — segurar o hardware drena bateria.
	useEffect(() => () => setActive(false), []);

	const codeScanner = useCodeScanner({
		codeTypes: [
			"ean-13",
			"ean-8",
			"upc-a",
			"upc-e",
			"code-128",
			"code-39",
			"itf",
			"qr",
		],
		onCodeScanned: (codes: Code[]) => {
			const value = codes[0]?.value;
			if (!value) return;

			const now = Date.now();
			const last = lastDetectionRef.current;
			// Enquanto o mesmo código continua visível, só renova o timestamp
			// para não disparar de novo; um código novo dispara na hora.
			const isRepeat =
				last !== null &&
				last.code === value &&
				now - last.at < DETECTION_COOLDOWN_MS;
			lastDetectionRef.current = { code: value, at: now };
			if (isRepeat) return;

			Vibration.vibrate(100);
			onDetectedRef.current(value);
		},
	});

	const isLive = active && hasPermission && device != null;

	return (
		<View className="aspect-[4/3] w-full overflow-hidden rounded-xl border border-border bg-black">
			{isLive ? (
				<>
					<VisionCamera
						style={StyleSheet.absoluteFill}
						device={device}
						isActive={!paused}
						codeScanner={codeScanner}
					/>
					<View
						pointerEvents="none"
						className="absolute inset-0 items-center justify-center"
					>
						<View className="h-24 w-4/5 rounded-lg border-2 border-white/80" />
					</View>
				</>
			) : (
				<View className="flex-1 items-center justify-center gap-3 p-6">
					{permissionDenied ? (
						<>
							<CameraOff size={32} color="rgba(255,255,255,0.7)" />
							<Text className="text-center text-sm text-white/80">
								Permissão de câmera negada. Libere o acesso nas configurações do
								aparelho para usar o scanner.
							</Text>
							<Button
								label="Abrir configurações"
								onPress={() => Linking.openSettings()}
							/>
						</>
					) : device == null ? (
						<>
							<CameraOff size={32} color="rgba(255,255,255,0.7)" />
							<Text className="text-center text-sm text-white/80">
								Nenhuma câmera traseira disponível neste aparelho.
							</Text>
						</>
					) : (
						<>
							<ScanBarcode size={32} color="rgba(255,255,255,0.7)" />
							<Text className="text-center text-sm text-white/80">
								Aponte a câmera para o código de barras do produto. Será pedida
								permissão para usar a câmera.
							</Text>
							<Button
								label="Ativar câmera"
								onPress={handleActivate}
								icon={<Camera size={16} color="rgb(250 250 250)" />}
							/>
						</>
					)}
				</View>
			)}
		</View>
	);
}
