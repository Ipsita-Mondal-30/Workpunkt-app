import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { ResourceScreen } from "@/components/shared/resource-screen";
import { openExternalUrl } from "@/lib/open-external-url";
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

function resourceLink(resource: AgentResource) {
  if (resource.url) return resource.url;
  return /^(https?:\/\/|\/)/.test(resource.action) ? resource.action : "";
}

export default function AgentResourcesScreen() {
  const [search, setSearch] = useState("");

  return (
    <ResourceScreen<AgentResourcesData>
      title="Resources"
      subtitle="Guides, templates, and partner materials"
      queryKey={queryKeys.agentResources()}
      path="/api/agent/resources"
    >
      {(data) => {
        const needle = search.trim().toLowerCase();
        const resources = data.resources.filter((resource) => !needle || `${resource.title} ${resource.description} ${resource.category} ${resource.meta}`.toLowerCase().includes(needle));
        return (
        <View>
          <TextInput value={search} onChangeText={setSearch} placeholder="Search resources…" placeholderTextColor="#71717a" className="mb-4 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text" />
          <View className="gap-2">
          {resources.length === 0 ? (
            <View className="rounded-2xl border border-border bg-surface px-4 py-6">
              <Text className="text-sm text-muted">{data.resources.length ? "No resources match your search." : "No resources available."}</Text>
            </View>
          ) : (
            resources.map((resource) => {
              const link = resourceLink(resource);
              return <Pressable
                key={resource.id}
                disabled={!link}
                onPress={() => void openExternalUrl(link)}
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
                  {resource.actionLabel}{link ? " →" : ""}
                </Text>
              </Pressable>;
            })
          )}
          </View>
        </View>
        );
      }}
    </ResourceScreen>
  );
}
