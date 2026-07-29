import { Text, View } from "react-native";

import { ApiListScreen } from "@/components/shared/api-list-screen";

type MatchItem = {
  id?: string;
  program?: string;
  university?: string;
  category?: string;
  name?: string;
  title?: string;
  [key: string]: unknown;
};

function labelFor(item: MatchItem) {
  return (
    item.program ||
    item.name ||
    item.title ||
    item.university ||
    item.id ||
    "Matched program"
  );
}

export default function StudentMatchesScreen() {
  return (
    <ApiListScreen<MatchItem>
      path="/api/matches"
      title="Matched Programs"
      subtitle="Programs matched to your profile"
      emptyLabel="No matched programs yet."
      extract={(json) => {
        const data = (json as { data?: MatchItem[] }).data;
        return Array.isArray(data) ? data : [];
      }}
      renderItem={(item) => (
        <View className="rounded-2xl border border-border bg-surface px-4 py-4">
          <Text className="text-base font-semibold text-text">{labelFor(item)}</Text>
          {item.university ? (
            <Text className="mt-1 text-sm text-muted">{String(item.university)}</Text>
          ) : null}
          {item.category ? (
            <Text className="mt-2 text-xs font-semibold uppercase text-brand-mid">
              {String(item.category)}
            </Text>
          ) : null}
        </View>
      )}
    />
  );
}
