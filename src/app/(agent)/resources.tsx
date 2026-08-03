import { Text, View } from "react-native";

import { ResourceScreen } from "@/components/shared/resource-screen";
import { queryKeys } from "@/lib/query/keys";

type AgentResource = {
  id: string;
  icon: string;
  title: string;
  description: string;
  meta: string;
  category: string;
  action: string;
  actionLabel: string;
  url?: string;
};

type AgentResourcesData = {
  resources: AgentResource[];
};

export default function AgentResourcesScreen() {
  return (
    <ResourceScreen<AgentResourcesData>
      title="Resources"
      subtitle="Guides, templates, and partner materials"
      queryKey={queryKeys.agentResources()}
      path="/api/agent/resources"
    >
      {(data) => (
        <View className="gap-2">
          {data.resources.length === 0 ? (
            <View className="rounded-2xl border border-border bg-surface px-4 py-6">
              <Text className="text-sm text-muted">No resources available.</Text>
            </View>
          ) : (
            data.resources.map((resource) => (
              <View
                key={resource.id}
                className="rounded-2xl border border-border bg-surface px-4 py-4"
              >
                <Text className="text-base font-semibold text-text">
                  {resource.icon ? `${resource.icon} ` : ""}
                  {resource.title}
                </Text>
                <Text className="mt-1 text-sm text-muted">{resource.description}</Text>
                <View className="mt-2 flex-row flex-wrap gap-2">
                  {resource.meta ? (
                    <Text className="text-xs text-muted">{resource.meta}</Text>
                  ) : null}
                  <Text className="text-xs font-semibold uppercase text-brand-mid">
                    {resource.category.replace(/-/g, " ")}
                  </Text>
                </View>
                <Text className="mt-2 text-xs font-semibold text-brand-mid">
                  {resource.actionLabel}
                </Text>
              </View>
            ))
          )}
        </View>
      )}
    </ResourceScreen>
  );
}
