import { focusManager, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { AppState, type AppStateStatus, Platform } from "react-native";

import { CACHE_MS, cacheOptions } from "@/lib/query/cache-policy";

function onAppStateChange(status: AppStateStatus) {
  if (Platform.OS !== "web") {
    focusManager.setFocused(status === "active");
  }
}

export function AppQueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            ...cacheOptions("standard"),
            staleTime: CACHE_MS.standard,
            gcTime: CACHE_MS.gc,
            // Avoid refetch storms when switching apps; pull-to-refresh + mutations invalidate.
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: 0,
          },
        },
      }),
  );

  useEffect(() => {
    const sub = AppState.addEventListener("change", onAppStateChange);
    return () => sub.remove();
  }, []);

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
