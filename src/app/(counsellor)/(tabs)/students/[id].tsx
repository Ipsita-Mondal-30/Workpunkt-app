import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";

import {
  CounsellorScroll,
  SectionCard,
} from "@/components/counsellor/counsellor-scroll";
import { CounsellorScreenShell } from "@/components/counsellor/counsellor-screen-shell";
import { authFetch } from "@/lib/api/auth-fetch";
import { useCounsellorContext } from "@/lib/counsellor/use-counsellor-context";

export default function StudentDetailScreen() {
  const { id, track } = useLocalSearchParams<{ id: string; track?: string }>();
  const { careerPathing } = useCounsellorContext();

  const enrolledQuery = useQuery({
    queryKey: ["counsellor", "student", id],
    queryFn: async () => {
      const response = await authFetch("/api/agent/students");
      const json = (await response.json()) as {
        data?: { students?: { students?: Array<Record<string, unknown>> } };
      };
      const students = json.data?.students?.students ?? [];
      return students.find((s) => s.id === id) ?? null;
    },
    enabled: track === "enrolled" && Boolean(id),
  });

  const cpStudent =
    track === "cp" ? careerPathing?.students.find((s) => s.id === id) : null;
  const roadmap =
    track === "cp" && id
      ? careerPathing?.roadmapsByStudentId[id] ?? null
      : null;

  const title =
    cpStudent?.name ??
    (enrolledQuery.data?.name as string | undefined) ??
    "Student";

  return (
    <CounsellorScreenShell title={title} subtitle="Student overview">
      <CounsellorScroll loading={track === "enrolled" && enrolledQuery.isLoading}>
        {track === "cp" && cpStudent ? (
          <>
            <SectionCard title="Overview">
              <Text className="mt-2 text-sm text-muted">
                {cpStudent.gradeLabel} · {cpStudent.stream}
              </Text>
              <Text className="mt-2 text-sm font-semibold text-brand-mid">
                {cpStudent.eligibilityLabel}
              </Text>
            </SectionCard>

            <SectionCard title="Grade timeline">
              {cpStudent.roadmap.map((stage) => (
                <View key={stage.grade} className="mb-3 rounded-xl bg-bg px-3 py-3">
                  <Text className="font-semibold text-text">{stage.label}</Text>
                  <Text className="text-sm text-muted">{stage.detail}</Text>
                  <Text className="mt-1 text-xs uppercase text-brand-mid">{stage.status}</Text>
                </View>
              ))}
            </SectionCard>

            {roadmap ? (
              <SectionCard
                title="Approved roadmap"
                subtitle={`Status: ${roadmap.status}`}
              >
                <Text className="mt-2 text-sm text-muted">
                  Customize approved roadmaps from the Roadmaps section.
                </Text>
              </SectionCard>
            ) : null}
          </>
        ) : track === "enrolled" && enrolledQuery.data ? (
          <>
            <SectionCard title="Overview">
              {enrolledQuery.data.email ? (
                <Text className="mt-2 text-sm text-muted">
                  {String(enrolledQuery.data.email)}
                </Text>
              ) : null}
              {enrolledQuery.data.stage ? (
                <Text className="mt-2 text-sm font-semibold text-brand-mid">
                  Stage: {String(enrolledQuery.data.stage)}
                </Text>
              ) : null}
              {enrolledQuery.data.level ? (
                <Text className="mt-2 text-sm text-muted">
                  Level: {String(enrolledQuery.data.level)}
                </Text>
              ) : null}
            </SectionCard>
          </>
        ) : (
          <Text className="text-sm text-muted">Student not found.</Text>
        )}
      </CounsellorScroll>
    </CounsellorScreenShell>
  );
}
