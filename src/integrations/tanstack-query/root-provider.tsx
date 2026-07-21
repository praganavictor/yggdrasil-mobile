import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

export function getContext() {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				// Em mobile a rede é instável: evita refetch agressivo e falha rápido demais.
				retry: 2,
				staleTime: 30_000,
			},
		},
	});
	return { queryClient };
}

export function Provider({
	children,
	queryClient,
}: {
	children: ReactNode;
	queryClient: QueryClient;
}) {
	return (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);
}
