import { Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";

import { CareerPathingGate } from "@/components/counsellor/career-pathing-upgrade";
import { ResourceScreen } from "@/components/shared/resource-screen";
import {
  roadmapStatusLabel,
  type CareerPathingBundle,
  type CounsellorStudentRoadmapView,
} from "@/lib/counsellor/types";
import { queryKeys } from "@/lib/query/keys";

function RoadmapDetail({ roadmap }: { roadmap: CounsellorStudentRoadmapView }) {
  const grades = roadmap.roadmap_json.grades ?? [];

  return (
    <>
      <View className="mb-4 rounded-2xl border border-border bg-surface px-4 py-4">
        <Text className="text-lg font-bold text-text">
          {roadmap.student_name ?? "Student roadmap"}
        </Text>
        <Text className="mt-1 text-xs font-semibold uppercase text-brand-mid">
          {roadmapStatusLabel(roadmap.status)}
        </Text>
        {roadmap.current_grade ? (
          <Text className="mt-2 text-sm text-muted">Current grade: {roadmap.current_grade}</Text>
        ) : null}
      </View>

      {grades.length === 0 ? (
        <View className="rounded-2xl border border-border bg-surface px-4 py-6">
          <Text className="text-sm text-muted">
            {roadmap.status === "approved"
              ? "Roadmap content is not available yet."
              : "Full roadmap details unlock after admin approval."}
          </Text>
        </View>
      ) : (
        <View className="gap-3">
          {grades.map((gradeBlock) => (
            <View
              key={gradeBlock.grade}
              className="rounded-2xl border border-border bg-surface px-4 py-4"
            >
              <Text className="text-base font-semibold text-text">
                Grade {gradeBlock.grade}
              </Text>
              {gradeBlock.sections.map((section) => (
                <View key={section.title} className="mt-3">
                  <Text className="text-sm font-semibold text-text">{section.title}</Text>
                  {section.items.map((item, index) => (
                    <Text key={`${section.title}-${index}`} className="mt-1 text-sm text-muted">
                      {item.done ? "✓ " : "• "}
                      {item.text}
                      {item.timeline ? ` (${item.timeline})` : ""}
                    </Text>
                  ))}
                </View>
              ))}
            </View>
          ))}
        </View>
      )}

      {roadmap.roadmap_json.counsellorNotes ? (
        <View className="mt-4 rounded-2xl border border-border bg-surface px-4 py-4">
          <Text className="text-sm font-semibold text-text">Counsellor notes</Text>
          <Text className="mt-2 text-sm text-muted">{roadmap.roadmap_json.counsellorNotes}</Text>
        </View>
      ) : null}
    </>
  );
}

export default function CounsellorRoadmapDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <ResourceScreen<CareerPathingBundle | { ok: false; error: string }>
      title="Roadmap"
      subtitle="Grade-by-grade career path"
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

        const roadmap = data.roadmaps.find((item) => item.id === id);

        return (
          <CareerPathingGate planActive={data.planActive}>
            {!roadmap ? (
              <View className="rounded-2xl border border-border bg-surface px-4 py-6">
                <Text className="text-sm text-muted">Roadmap not found.</Text>
              </View>
            ) : (
              <RoadmapDetail roadmap={roadmap} />
            )}
          </CareerPathingGate>
        );
      }}
    </ResourceScreen>
  );
}
