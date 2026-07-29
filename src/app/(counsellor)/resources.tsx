import { Text, View } from "react-native";

import { ApiListScreen } from "@/components/shared/api-list-screen";

type ResourceItem = {
  id?: string;
  title?: string;
  description?: string;
  tag?: string;
  name?: string;
  [key: string]: unknown;
};

export default function CounsellorResourcesScreen() {
  return (
    <ApiListScreen<ResourceItem>
      path="/api/agent/resources"
      title="Resource Library"
      subtitle="Guides and files for school counsellors"
      emptyLabel="No resources available."
      extract={(json) => {
        const payload = json as {
          data?:
            | ResourceItem[]
            | { resources?: ResourceItem[] };
        };
        if (Array.isArray(payload.data)) return payload.data;
        if (payload.data && Array.isArray(payload.data.resources)) {
          return payload.data.resources;
        }
        return [];
      }}
      renderItem={(item) => (
        <View className="rounded-2xl border border-border bg-surface px-4 py-4">
          <Text className="text-base font-semibold text-text">
            {item.title || item.name || item.id || "Resource"}
          </Text>
          {item.description ? (
            <Text className="mt-1 text-sm text-muted">{String(item.description)}</Text>
          ) : null}
          {item.tag ? (
            <Text className="mt-2 text-xs font-semibold uppercase text-brand-mid">
              {String(item.tag)}
            </Text>
          ) : null}
        </View>
      )}
    />
  );
}
