"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";

/**
 * React Query Provider
 * Provides caching, background refetching, and optimistic updates
 */
export function ReactQueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Cache data for 5 minutes
            staleTime: 5 * 60 * 1000,
            // Keep data in cache for 10 minutes
            gcTime: 10 * 60 * 1000,
            // Retry failed requests 1 time
            retry: 1,
            // Refetch on window focus
            refetchOnWindowFocus: true,
            // Keep previous data while fetching new data (prevents flicker)
            placeholderData: (previousData: any) => previousData,
          },
          mutations: {
            // Retry failed mutations 0 times (don't retry writes)
            retry: 0,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
