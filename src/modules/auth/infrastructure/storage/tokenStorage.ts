import { storage } from "@/shared/storage/storage";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";
const TOKEN_EXPIRY_KEY = "auth_token_expiry";
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;

const listeners = new Set<() => void>();

function emitAuthChange(): void {
	for (const listener of listeners) listener();
}

export const tokenStorage = {
	getToken(): string | null {
		const token = storage.getString(TOKEN_KEY);
		if (!token) return null;

		const expiry = storage.getString(TOKEN_EXPIRY_KEY);
		if (!expiry || Date.now() > Number(expiry)) {
			storage.remove(TOKEN_KEY);
			storage.remove(USER_KEY);
			storage.remove(TOKEN_EXPIRY_KEY);
			emitAuthChange();
			return null;
		}

		return token;
	},

	setToken(token: string): void {
		storage.set(TOKEN_KEY, token);
		storage.set(TOKEN_EXPIRY_KEY, String(Date.now() + SESSION_DURATION_MS));
		emitAuthChange();
	},

	removeToken(): void {
		storage.remove(TOKEN_KEY);
		storage.remove(USER_KEY);
		storage.remove(TOKEN_EXPIRY_KEY);
		emitAuthChange();
	},

	getUser(): {
		id: string;
		email: string;
		name: string;
		defaultTeamId: string | null;
	} | null {
		const raw = storage.getString(USER_KEY);
		if (!raw) return null;
		try {
			return JSON.parse(raw) as {
				id: string;
				email: string;
				name: string;
				defaultTeamId: string | null;
			};
		} catch {
			return null;
		}
	},

	setUser(user: {
		id: string;
		email: string;
		name: string;
		defaultTeamId: string | null;
	}): void {
		storage.set(USER_KEY, JSON.stringify(user));
		emitAuthChange();
	},

	isAuthenticated(): boolean {
		return this.getToken() !== null;
	},

	subscribe(callback: () => void): () => void {
		listeners.add(callback);
		return () => {
			listeners.delete(callback);
		};
	},
};
