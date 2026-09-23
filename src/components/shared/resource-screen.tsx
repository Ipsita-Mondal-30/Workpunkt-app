import { Pressable, Text, View } from "react-native";
import type { ReactNode } from "react";
import type { QueryKey } from "@tanstack/react-query";

import { useApiQuery } from "@/lib/query/use-api";
import type { CachePolicy } from "@/lib/query/cache-policy";
import { LoadingCards, PageHeading, PortalPage } from "@/components/portal/portal-ui";

type ResourceScreenProps<T> = {
  title: string;
  subtitle?: string;
  queryKey: QueryKey;
  path: string;
  children: (data: T, helpers: { refetch: () => Promise<void> }) => ReactNode;
  headerRight?: ReactNode;
  /** @deprecated Prefer `cachePolicy` — still honored when set. */
  staleTime?: number;
  /** Defaults to `heavy` for list/detail portal screens. */
  cachePolicy?: CachePolicy;
};

export function ResourceScreen<T>({
  title,
  subtitle,
  queryKey,
  path,
  children,
  headerRight,
  staleTime,
  cachePolicy = "heavy",
}: ResourceScreenProps<T>) {
  const query = useApiQuery<T>(queryKey, path, {
    cachePolicy,
    ...(staleTime != null ? { staleTime } : null),
  });

  // Prefer cached data: only block the screen on the first load.
  if (query.isPending && !query.data) {
    return (
      <PortalPage>
        <PageHeading title={title} subtitle={subtitle} />
        <LoadingCards />
      </PortalPage>
    );
  }

  return (
    <PortalPage
      refreshing={query.isRefetching && !query.isPending}
      onRefresh={() => void query.refetch()}
    >
      <PageHeading title={title} subtitle={subtitle} action={headerRight} />

      {query.error && !query.data ? (
        <View className="mb-4 rounded-2xl bg-error/10 px-4 py-3">
          <Text className="text-sm text-error">{query.error.message}</Text>
          <Pressable onPress={() => void query.refetch()} className="mt-2">
            <Text className="text-sm font-semibold text-brand-mid">Retry</Text>
          </Pressable>
        </View>
      ) : null}

      {query.error && query.data ? (
        <View className="mb-3 rounded-2xl bg-error/10 px-4 py-2">
          <Text className="text-xs text-error">
            Showing cached data — {query.error.message}
          </Text>
        </View>
      ) : null}

      {query.data != null
        ? children(query.data, {
            refetch: async () => {
              await query.refetch();
            },
          })
        : null}
    </PortalPage>
  );
}
