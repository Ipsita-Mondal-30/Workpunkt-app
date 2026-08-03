import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";

import { GradientButton } from "@/components/shared/gradient-button";
import { WorkpunktLoader } from "@/components/shared/workpunkt-loader";
import { queryKeys } from "@/lib/query/keys";
import { useApiMutation, useApiQuery } from "@/lib/query/use-api";

const MODULE_PROGRESS_MEDIA_ID = "__module__";

type TrainingModule = {
  id: string;
  title: string;
  description: string;
  bodyText?: string;
  status: "completed" | "available" | "locked" | "agent_only" | "optional";
  contentUrl?: string;
  linkUrl?: string;
  linkLabel?: string;
  watchedPercent?: number;
  completedAt?: string;
};

type TrainingHubData = {
  mandatoryModules: TrainingModule[];
  optionalModules: TrainingModule[];
};

function findModule(data: TrainingHubData | undefined, moduleId: string) {
  if (!data) return null;
  return (
    data.mandatoryModules.find((module) => module.id === moduleId) ??
    data.optionalModules.find((module) => module.id === moduleId) ??
    null
  );
}

export default function AgentTrainingModuleScreen() {
  const { moduleId } = useLocalSearchParams<{ moduleId: string }>();
  const queryClient = useQueryClient();

  const trainingQuery = useApiQuery<TrainingHubData>(
    queryKeys.agentTraining(),
    "/api/agent/training",
  );

  const progressMutation = useApiMutation<
    {
      moduleId: string;
      mediaId: string;
      currentTime: number;
      duration: number;
      ended: boolean;
    },
    { data?: { completed?: boolean } }
  >("/api/agent/training/progress", [queryKeys.agentTraining()]);

  const module = findModule(trainingQuery.data, moduleId ?? "");
  const isComplete = module?.status === "completed" || Boolean(module?.completedAt);

  if (trainingQuery.isLoading && !trainingQuery.data) {
    return <WorkpunktLoader />;
  }

  if (trainingQuery.error) {
    return (
      <View className="flex-1 items-center justify-center bg-bg px-4">
        <Text className="text-sm text-error">{trainingQuery.error.message}</Text>
      </View>
    );
  }

  if (!module) {
    return (
      <View className="flex-1 items-center justify-center bg-bg px-4">
        <Text className="text-sm text-muted">Training module not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-bg" contentContainerClassName="px-4 py-4 pb-10">
      <Text className="text-2xl font-bold text-text">{module.title}</Text>
      <Text className="mt-2 text-xs font-semibold uppercase text-brand-mid">
        {module.status.replace(/_/g, " ")}
      </Text>

      {module.description ? (
        <Text className="mt-4 text-sm text-muted">{module.description}</Text>
      ) : null}

      {module.bodyText ? (
        <Text className="mt-4 text-sm leading-6 text-text">{module.bodyText}</Text>
      ) : null}

      {module.contentUrl ? (
        <View className="mt-4 rounded-2xl border border-border bg-surface px-4 py-3">
          <Text className="text-xs text-muted">Content URL</Text>
          <Text className="mt-1 text-sm text-brand-mid" numberOfLines={2}>
            {module.contentUrl}
          </Text>
        </View>
      ) : null}

      {module.linkUrl ? (
        <Pressable className="mt-3 rounded-xl border border-border bg-surface px-4 py-3">
          <Text className="text-sm font-semibold text-brand-mid">
            {module.linkLabel ?? "Open resource"}
          </Text>
        </Pressable>
      ) : null}

      {module.watchedPercent != null && module.watchedPercent > 0 ? (
        <Text className="mt-4 text-xs text-muted">{module.watchedPercent}% complete</Text>
      ) : null}

      <View className="mt-8">
        {isComplete ? (
          <View className="rounded-2xl border border-border bg-success/10 px-4 py-3">
            <Text className="text-sm font-semibold text-success">Module completed</Text>
          </View>
        ) : (
          <GradientButton
            text={progressMutation.isPending ? "Saving…" : "Mark as complete"}
            loading={progressMutation.isPending}
            onPress={() =>
              progressMutation.mutate(
                {
                  moduleId: module.id,
                  mediaId: MODULE_PROGRESS_MEDIA_ID,
                  currentTime: 1,
                  duration: 1,
                  ended: true,
                },
                {
                  onSuccess: async () => {
                    await queryClient.invalidateQueries({
                      queryKey: queryKeys.agentTraining(),
                    });
                    Alert.alert("Saved", "Training progress updated.");
                  },
                  onError: (error) => Alert.alert("Error", error.message),
                },
              )
            }
          />
        )}
      </View>
    </ScrollView>
  );
}
