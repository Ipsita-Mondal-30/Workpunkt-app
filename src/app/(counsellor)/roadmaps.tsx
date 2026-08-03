import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { CareerPathingGate } from "@/components/counsellor/career-pathing-upgrade";
import { ResourceScreen } from "@/components/shared/resource-screen";
import {
  roadmapStatusLabel,
  type CareerPathingBundle,
  type CounsellorStudentRoadmapView,
} from "@/lib/counsellor/types";
import { queryKeys } from "@/lib/query/keys";

function RoadmapRow({ roadmap }: { roadmap: CounsellorStudentRoadmapView }) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: "/(counsellor)/roadmaps/[id]" as never,
          params: { id: roadmap.id },
        })
      }
      className="rounded-2xl border border-border bg-surface px-4 py-4"
    >
      <Text className="text-base font-semibold text-text">
        {roadmap.student_name ?? "Student roadmap"}
      </Text>
      <Text className="mt-1 text-xs font-semibold uppercase text-brand-mid">
        {roadmapStatusLabel(roadmap.status)}
      </Text>
      {roadmap.current_grade ? (
        <Text className="mt-1 text-sm text-muted">Grade {roadmap.current_grade}</Text>
      ) : null}
      <Text className="mt-2 text-xs text-brand-mid">View details →</Text>
    </Pressable>
  );
}

export default function CounsellorRoadmapsScreen() {
  return (
    <ResourceScreen<CareerPathingBundle | { ok: false; error: string }>
      title="Roadmaps"
      subtitle="AI-generated career roadmaps for your students"
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
            {data.roadmaps.length === 0 ? (
              <View className="rounded-2xl border border-border bg-surface px-4 py-6">
                <Text className="text-sm text-muted">
                  No roadmaps yet. They appear here once generated for your students.
                </Text>
              </View>
            ) : (
              <View className="gap-2">
                {data.roadmaps.map((roadmap) => (
                  <RoadmapRow key={roadmap.id} roadmap={roadmap} />
                ))}
              </View>
            )}
          </CareerPathingGate>
        );
      }}
    </ResourceScreen>
  );
}
