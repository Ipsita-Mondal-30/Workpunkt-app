import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { FeatureLock } from "@/components/counsellor/feature-lock";
import { ResourceScreen } from "@/components/shared/resource-screen";
import { useCounsellorAccess } from "@/lib/counsellor/use-counsellor-access";
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

function ResourcesList({ data }: { data: AgentResourcesData }) {
  return (
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
  );
}

export default function CounsellorResourcesScreen() {
  const router = useRouter();
  const { loading, accessPaid } = useCounsellorAccess();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-bg">
        <ActivityIndicator color="#f6339a" />
      </View>
    );
  }

  if (!accessPaid) {
    return (
      <View className="flex-1 bg-bg px-4 py-4">
        <Text className="text-2xl font-bold text-text">Resource Library</Text>
        <Text className="mt-1 text-sm text-muted">
          Guides and files for school counsellors
        </Text>
        <View className="mt-4">
          <FeatureLock />
        </View>
        <Pressable
          onPress={() => router.push("/(counsellor)/cp-resources" as never)}
          className="mt-4 rounded-xl border border-border bg-surface px-4 py-3"
        >
          <Text className="text-sm font-semibold text-brand-mid">
            View Career Pathing resources →
          </Text>
          <Text className="mt-1 text-xs text-muted">
            Available with an active Career Pathing plan
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ResourceScreen<AgentResourcesData>
      title="Resource Library"
      subtitle="Guides and files for school counsellors"
      queryKey={queryKeys.agentResources()}
      path="/api/agent/resources"
    >
      {(data) => (
        <>
          <ResourcesList data={data} />
          <Pressable
            onPress={() => router.push("/(counsellor)/cp-resources" as never)}
            className="mt-4 rounded-xl border border-border bg-surface px-4 py-3"
          >
            <Text className="text-sm font-semibold text-brand-mid">
              Career Pathing resources →
            </Text>
          </Pressable>
        </>
      )}
    </ResourceScreen>
  );
}
