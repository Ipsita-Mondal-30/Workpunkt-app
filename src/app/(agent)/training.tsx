import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { ResourceScreen } from "@/components/shared/resource-screen";
import { StatsRow } from "@/components/shared/stats-row";
import { queryKeys } from "@/lib/query/keys";

type TrainingModule = {
  id: string;
  title: string;
  description: string;
  status: "completed" | "available" | "locked" | "agent_only" | "optional";
  watchedPercent?: number;
};

type TrainingHubData = {
  meta: {
    mandatoryCompleted: number;
    mandatoryTotal: number;
    overallPercent: number;
    unlockHint: string;
  };
  mandatoryModules: TrainingModule[];
  optionalModules: TrainingModule[];
};

function ModuleCard({
  module,
  onPress,
}: {
  module: TrainingModule;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="rounded-2xl border border-border bg-surface px-4 py-4"
    >
      <View className="flex-row items-start justify-between gap-2">
        <Text className="flex-1 text-base font-semibold text-text">{module.title}</Text>
        <Text className="text-xs font-semibold uppercase text-brand-mid">
          {module.status.replace(/_/g, " ")}
        </Text>
      </View>
      {module.description ? (
        <Text className="mt-1 text-sm text-muted" numberOfLines={2}>
          {module.description}
        </Text>
      ) : null}
      {module.watchedPercent != null && module.watchedPercent > 0 ? (
        <Text className="mt-2 text-xs text-muted">{module.watchedPercent}% watched</Text>
      ) : null}
    </Pressable>
  );
}

function ModuleSection({
  title,
  modules,
  onSelect,
}: {
  title: string;
  modules: TrainingModule[];
  onSelect: (moduleId: string) => void;
}) {
  if (modules.length === 0) return null;

  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-semibold text-text">{title}</Text>
      <View className="gap-2">
        {modules.map((module) => (
          <ModuleCard
            key={module.id}
            module={module}
            onPress={() => onSelect(module.id)}
          />
        ))}
      </View>
    </View>
  );
}

export default function AgentTrainingScreen() {
  const router = useRouter();

  return (
    <ResourceScreen<TrainingHubData>
      title="Training"
      subtitle="Mandatory and optional partner modules"
      queryKey={queryKeys.agentTraining()}
      path="/api/agent/training"
    >
      {(data) => (
        <>
          <StatsRow
            stats={[
              {
                id: "progress",
                value: `${data.meta.overallPercent}%`,
                label: "Overall progress",
                sub: `${data.meta.mandatoryCompleted}/${data.meta.mandatoryTotal} mandatory`,
                color: "pink",
              },
            ]}
          />

          {data.meta.unlockHint ? (
            <Text className="mb-4 text-xs text-muted">{data.meta.unlockHint}</Text>
          ) : null}

          <ModuleSection
            title="Mandatory modules"
            modules={data.mandatoryModules}
            onSelect={(moduleId) =>
              router.push(`/(agent)/training/${moduleId}` as never)
            }
          />
          <ModuleSection
            title="Optional modules"
            modules={data.optionalModules}
            onSelect={(moduleId) =>
              router.push(`/(agent)/training/${moduleId}` as never)
            }
          />

          {data.mandatoryModules.length === 0 && data.optionalModules.length === 0 ? (
            <View className="rounded-2xl border border-border bg-surface px-4 py-6">
              <Text className="text-sm text-muted">No training modules published yet.</Text>
            </View>
          ) : null}
        </>
      )}
    </ResourceScreen>
  );
}
