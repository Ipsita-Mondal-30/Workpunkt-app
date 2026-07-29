import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from "react-native";

import { authFetch } from "@/lib/api/auth-fetch";

type ApiListProps<T> = {
  path: string;
  emptyLabel?: string;
  extract: (json: unknown) => T[];
  renderItem: (item: T, index: number) => ReactNode;
  title?: string;
  subtitle?: string;
};

export function ApiListScreen<T>({
  path,
  emptyLabel = "Nothing here yet.",
  extract,
  renderItem,
  title,
  subtitle,
}: ApiListProps<T>) {
  const query = useQuery({
    queryKey: ["api", path],
    queryFn: async () => {
      console.log("[ApiList] load", path);
      const response = await authFetch(path);
      const json = await response.json();
      if (!response.ok) {
        throw new Error(
          (json as { error?: string }).error ?? `Request failed (${response.status})`,
        );
      }
      return extract(json);
    },
  });

  const items = query.data ?? [];
  const error = query.error instanceof Error ? query.error.message : null;

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
      contentContainerClassName="px-4 py-4"
      refreshControl={
        <RefreshControl
          refreshing={query.isRefetching && !query.isLoading}
          onRefresh={() => void query.refetch()}
          tintColor="#f6339a"
        />
      }
    >
      {title ? (
        <Text className="mb-1 text-xl font-bold text-text">{title}</Text>
      ) : null}
      {subtitle ? (
        <Text className="mb-4 text-sm text-muted">{subtitle}</Text>
      ) : null}

      {error ? (
        <View className="mb-4 rounded-2xl bg-error/10 px-4 py-3">
          <Text className="text-sm text-error">{error}</Text>
        </View>
      ) : null}

      {!error && items.length === 0 ? (
        <Text className="text-sm text-muted">{emptyLabel}</Text>
      ) : null}

      {items.map((item, index) => (
        <View key={index} className="mb-3">
          {renderItem(item, index)}
        </View>
      ))}
    </ScrollView>
  );
}
