import { API_URL } from "@env";

function requireEnv(value: unknown, key: string): string {
	if (!value || typeof value !== "string") {
		throw new Error(`Missing required environment variable: ${key}`);
	}
	return value;
}

export const env = {
	apiUrl: requireEnv(API_URL, "API_URL"),
} as const;
