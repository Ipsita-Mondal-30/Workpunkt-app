import { Alert, Linking, Text, View } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";

import {
  CounsellorScroll,
  ListRow,
  SectionCard,
} from "@/components/counsellor/counsellor-scroll";
import { CounsellorScreenShell } from "@/components/counsellor/counsellor-screen-shell";
import { GradientButton } from "@/components/shared/gradient-button";
import { authFetch } from "@/lib/api/auth-fetch";
import type { TrainingModule, WebinarSession } from "@/lib/api/counsellor-types";
import { useCounsellorContext } from "@/lib/counsellor/use-counsellor-context";

type TrainingPayload = {
  mandatoryModules?: TrainingModule[];
  optionalModules?: TrainingModule[];
  schoolPartnerTrainingMaterials?: Array<{
    id: string;
    title: string;
    description?: string;
    tag?: string;
    url?: string;
  }>;
};

export default function TrainingScreen() {
  const router = useRouter();
  const { partnerTrainingUnlocked, refreshing, refresh } = useCounsellorContext();
  const [progressLoading, setProgressLoading] = useState<string | null>(null);

  const trainingQuery = useQuery({
    queryKey: ["counsellor", "training"],
    queryFn: async () => {
      const response = await authFetch("/api/agent/training");
      const json = (await response.json()) as { data?: TrainingPayload; error?: string };
      if (!response.ok) {
        throw new Error(json.error ?? "Could not load training.");
      }
      return json.data ?? {};
    },
  });

  const webinarsQuery = useQuery({
    queryKey: ["counsellor", "webinars"],
    queryFn: async () => {
      const response = await authFetch("/api/agent/webinars");
      const json = (await response.json()) as {
        data?: { sessions?: WebinarSession[]; webinars?: WebinarSession[] };
        error?: string;
      };
      if (!response.ok) {
        throw new Error(json.error ?? "Could not load sessions.");
      }
      return json.data?.sessions ?? json.data?.webinars ?? [];
    },
  });

  async function markComplete(moduleId: string) {
    setProgressLoading(moduleId);
    try {
      const response = await authFetch("/api/agent/training/progress", {
        method: "POST",
        body: JSON.stringify({ moduleId, completed: true }),
      });
      const json = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || json.ok === false) {
        throw new Error(json.error ?? "Could not save progress.");
      }
      await trainingQuery.refetch();
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Could not save progress.",
      );
    } finally {
      setProgressLoading(null);
    }
  }

  const modules = [
    ...(trainingQuery.data?.mandatoryModules ?? []),
    ...(trainingQuery.data?.optionalModules ?? []),
  ];
  const partnerModules = partnerTrainingUnlocked
    ? (trainingQuery.data?.schoolPartnerTrainingMaterials ?? [])
    : [];

  return (
    <CounsellorScreenShell title="Training" subtitle="Modules and live sessions">
      <CounsellorScroll
        loading={trainingQuery.isLoading}
        refreshing={refreshing}
        onRefresh={() => void refresh()}
        error={
          trainingQuery.error instanceof Error ? trainingQuery.error.message : null
        }
      >
        <SectionCard title="Base training" subtitle="Counselor onboarding modules">
          {modules.length === 0 ? (
            <Text className="mt-2 text-sm text-muted">No modules yet.</Text>
          ) : (
            modules.map((module) => (
              <ListRow
                key={module.id}
                title={module.title}
                subtitle={module.description}
                badge={
                  progressLoading === module.id
                    ? "Saving…"
                    : module.status === "completed"
                      ? "Completed"
                      : "In progress"
                }
                onPress={() =>
                  router.push({
                    pathname: "/(counsellor)/(tabs)/training/[moduleId]",
                    params: { moduleId: module.id, title: module.title },
                  })
                }
              />
            ))
          )}
        </SectionCard>

        {partnerTrainingUnlocked ? (
          <SectionCard title="Partner training" subtitle="Career Pathing partner modules">
            {partnerModules.length === 0 ? (
              <Text className="mt-2 text-sm text-muted">No partner modules yet.</Text>
            ) : (
              partnerModules.map((module) => (
                <ListRow
                  key={module.id}
                  title={module.title}
                  subtitle={module.description}
                  badge={module.tag ?? "Partner"}
                  onPress={() => void markComplete(module.id)}
                />
              ))
            )}
          </SectionCard>
        ) : (
          <SectionCard
            title="Partner training locked"
            subtitle="Unlock elevated partner training with an active Career Pathing plan."
          >
            <View className="mt-3">
              <GradientButton
                text="View Career Pathing"
                onPress={() => router.push("/(counsellor)/(tabs)/more/career-pathing")}
              />
            </View>
          </SectionCard>
        )}

        <SectionCard title="Upcoming sessions">
          {webinarsQuery.isLoading ? (
            <Text className="mt-2 text-sm text-muted">Loading sessions…</Text>
          ) : (webinarsQuery.data ?? []).length === 0 ? (
            <Text className="mt-2 text-sm text-muted">No upcoming sessions.</Text>
          ) : (
            (webinarsQuery.data ?? []).map((session) => (
              <ListRow
                key={session.id}
                title={session.title}
                subtitle={session.startsAt ?? session.description}
                badge="Webinar"
                onPress={
                  session.joinUrl
                    ? () => void Linking.openURL(session.joinUrl!)
                    : undefined
                }
              />
            ))
          )}
        </SectionCard>
      </CounsellorScroll>
    </CounsellorScreenShell>
  );
}
