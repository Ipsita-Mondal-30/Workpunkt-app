import { useRouter } from "expo-router";
import { Text } from "react-native";

import { CareerPathingGate } from "@/components/counsellor/career-pathing-upgrade";
import { CounsellorScroll, ListRow } from "@/components/counsellor/counsellor-scroll";
import { CounsellorScreenShell } from "@/components/counsellor/counsellor-screen-shell";
import { useCounsellorContext } from "@/lib/counsellor/use-counsellor-context";

export default function RoadmapsListScreen() {
  const router = useRouter();
  const { careerPathingActive, careerPathing, refreshing, refresh, loading } =
    useCounsellorContext();

  const approvedRoadmaps =
    careerPathing?.roadmaps.filter((roadmap) => roadmap.status === "approved") ?? [];

  if (!careerPathingActive) {
    return (
      <CounsellorScreenShell title="Roadmaps" subtitle="Approved roadmaps only">
        <CareerPathingGate
          planActive={false}
          loading={loading}
          onCompleted={() => void refresh()}
        >
          {null}
        </CareerPathingGate>
      </CounsellorScreenShell>
    );
  }

  return (
    <CounsellorScreenShell title="Roadmaps" subtitle="Approved roadmaps only">
      <CounsellorScroll refreshing={refreshing} onRefresh={() => void refresh()}>
        {approvedRoadmaps.length === 0 ? (
          <Text className="text-sm text-muted">
            No approved roadmaps yet. Pending roadmaps stay hidden until admin approval.
          </Text>
        ) : (
          approvedRoadmaps.map((roadmap) => (
            <ListRow
              key={roadmap.id}
              title={roadmap.student_name}
              subtitle={`Grade ${roadmap.current_grade ?? "—"} · ${roadmap.status}`}
              badge="Approved"
              onPress={() =>
                router.push({
                  pathname: "/(counsellor)/(tabs)/more/roadmaps/[id]",
                  params: { id: roadmap.id },
                })
              }
            />
          ))
        )}
      </CounsellorScroll>
    </CounsellorScreenShell>
  );
}
