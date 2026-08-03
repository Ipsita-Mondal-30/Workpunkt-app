import { Linking, Pressable, Text, View } from "react-native";

import { CareerPathingGate } from "@/components/counsellor/career-pathing-upgrade";
import { ResourceScreen } from "@/components/shared/resource-screen";
import type { CareerPathingBundle, CareerPathingResource } from "@/lib/counsellor/types";
import { queryKeys } from "@/lib/query/keys";

function ResourceCard({ resource }: { resource: CareerPathingResource }) {
  const openUrl = resource.url ? () => void Linking.openURL(resource.url!) : undefined;

  return (
    <Pressable
      onPress={openUrl}
      disabled={!resource.url}
      className="rounded-2xl border border-border bg-surface px-4 py-4"
    >
      <Text className="text-base font-semibold text-text">{resource.title}</Text>
      {resource.description ? (
        <Text className="mt-1 text-sm text-muted">{resource.description}</Text>
      ) : null}
      {resource.body ? (
        <Text className="mt-2 text-sm text-muted" numberOfLines={4}>
          {resource.body}
        </Text>
      ) : null}
      {resource.tag ? (
        <Text className="mt-2 text-xs font-semibold uppercase text-brand-mid">
          {resource.tag}
        </Text>
      ) : null}
      {resource.url ? (
        <Text className="mt-2 text-xs text-brand-mid">Open link →</Text>
      ) : null}
    </Pressable>
  );
}

export default function CounsellorCpResourcesScreen() {
  return (
    <ResourceScreen<CareerPathingBundle | { ok: false; error: string }>
      title="CP Resources"
      subtitle="Career Pathing guides and materials"
      queryKey={queryKeys.agentCareerPathing()}
      path="/api/agent/career-pathing"
      staleTime={30_000}
    >
      {(data) => {
        if (data.ok === false) {
          return (
            <CareerPathingGate planActive={false} error={data.error}>
              {null}
            </CareerPathingGate>
          );
        }

        return (
          <CareerPathingGate planActive={data.planActive}>
            {data.resources.length === 0 ? (
              <View className="rounded-2xl border border-border bg-surface px-4 py-6">
                <Text className="text-sm text-muted">No Career Pathing resources yet.</Text>
              </View>
            ) : (
              <View className="gap-2">
                {data.resources.map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
              </View>
            )}
          </CareerPathingGate>
        );
      }}
    </ResourceScreen>
  );
}
