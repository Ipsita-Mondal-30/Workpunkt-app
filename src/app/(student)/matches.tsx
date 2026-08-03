import { Text, View } from "react-native";

import { ResourceScreen } from "@/components/shared/resource-screen";
import { queryKeys } from "@/lib/query/keys";

type MatchItem = {
  id?: string;
  program?: string;
  university?: string;
  category?: string;
  name?: string;
  title?: string;
  programName?: string;
  universityName?: string;
};

function labelFor(item: MatchItem) {
  return (
    item.programName ||
    item.program ||
    item.name ||
    item.title ||
    item.universityName ||
    item.university ||
    item.id ||
    "Matched program"
  );
}

export default function StudentMatchesScreen() {
  return (
    <ResourceScreen<MatchItem[] | { matches?: MatchItem[]; programs?: MatchItem[] }>
      title="Matched Programs"
      subtitle="Programs matched to your profile"
      queryKey={queryKeys.matches()}
      path="/api/matches"
    >
      {(data) => {
        const items = Array.isArray(data)
          ? data
          : (data.matches ?? data.programs ?? []);

        if (items.length === 0) {
          return (
            <View className="rounded-2xl border border-border bg-surface px-4 py-6">
              <Text className="text-sm text-muted">No matched programs yet.</Text>
            </View>
          );
        }

        return (
          <View className="gap-3">
            {items.map((item, index) => (
              <View
                key={String(item.id ?? labelFor(item) + index)}
                className="rounded-2xl border border-border bg-surface px-4 py-4"
              >
                <Text className="text-base font-semibold text-text">{labelFor(item)}</Text>
                {item.universityName || item.university ? (
                  <Text className="mt-1 text-sm text-muted">
                    {String(item.universityName || item.university)}
                  </Text>
                ) : null}
                {item.category ? (
                  <Text className="mt-2 text-xs font-semibold uppercase text-brand-mid">
                    {String(item.category)}
                  </Text>
                ) : null}
              </View>
            ))}
          </View>
        );
      }}
    </ResourceScreen>
  );
}
