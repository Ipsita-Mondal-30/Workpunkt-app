import { Pressable, Text, View } from "react-native";
import type { ReactNode } from "react";
import type { QueryKey } from "@tanstack/react-query";

import { useApiQuery } from "@/lib/query/use-api";
import { LoadingCards, PageHeading, PortalPage } from "@/components/portal/portal-ui";

type ResourceScreenProps<T> = {
  title: string;
  subtitle?: string;
  queryKey: QueryKey;
  path: string;
  children: (data: T, helpers: { refetch: () => Promise<void> }) => ReactNode;
  headerRight?: ReactNode;
  staleTime?: number;
};

export function ResourceScreen<T>({
  title,
  subtitle,
  queryKey,
  path,
  children,
  headerRight,
  staleTime = 1000 * 60 * 5,
}: ResourceScreenProps<T>) {
  const query = useApiQuery<T>(queryKey, path, {
    staleTime,
  });

  if (query.isLoading && !query.data) {
    return (
      <PortalPage><PageHeading title={title} subtitle={subtitle} /><LoadingCards /></PortalPage>
    );
  }

  return (
    <PortalPage refreshing={query.isRefetching && !query.isLoading} onRefresh={() => void query.refetch()}>
      <PageHeading title={title} subtitle={subtitle} action={headerRight} />

      {query.error ? (
        <View className="mb-4 rounded-2xl bg-error/10 px-4 py-3">
          <Text className="text-sm text-error">{query.error.message}</Text>
          <Pressable onPress={() => void query.refetch()} className="mt-2">
            <Text className="text-sm font-semibold text-brand-mid">Retry</Text>
          </Pressable>
        </View>
      ) : null}

      {query.data != null ? children(query.data, { refetch: async () => { await query.refetch(); } }) : null}
    </PortalPage>
  );
}
