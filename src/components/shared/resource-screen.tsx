import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import type { ReactNode } from "react";
import type { QueryKey } from "@tanstack/react-query";

import { useApiQuery } from "@/lib/query/use-api";

type ResourceScreenProps<T> = {
  title: string;
  subtitle?: string;
  queryKey: QueryKey;
  path: string;
  children: (data: T, helpers: { refetch: () => void }) => ReactNode;
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
      <View className="flex-1 items-center justify-center bg-bg">
        <ActivityIndicator color="#f6339a" />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-bg"
      contentContainerClassName="px-4 py-4 pb-10"
      refreshControl={
        <RefreshControl
          refreshing={query.isRefetching && !query.isLoading}
          onRefresh={() => void query.refetch()}
          tintColor="#f6339a"
        />
      }
    >
      <View className="mb-4 flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="text-2xl font-bold text-text">{title}</Text>
          {subtitle ? (
            <Text className="mt-1 text-sm text-muted">{subtitle}</Text>
          ) : null}
        </View>
        {headerRight}
      </View>

      {query.error ? (
        <View className="mb-4 rounded-2xl bg-error/10 px-4 py-3">
          <Text className="text-sm text-error">{query.error.message}</Text>
          <Pressable onPress={() => void query.refetch()} className="mt-2">
            <Text className="text-sm font-semibold text-brand-mid">Retry</Text>
          </Pressable>
        </View>
      ) : null}

      {query.data ? children(query.data, { refetch: () => void query.refetch() }) : null}
    </ScrollView>
  );
}
