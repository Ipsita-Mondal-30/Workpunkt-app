import { Text } from "react-native";

import { CareerPathingGate } from "@/components/counsellor/career-pathing-upgrade";
import { CounsellorScroll, ListRow } from "@/components/counsellor/counsellor-scroll";
import { CounsellorScreenShell } from "@/components/counsellor/counsellor-screen-shell";
import { useCounsellorContext } from "@/lib/counsellor/use-counsellor-context";

export default function ProspectsScreen() {
  const { careerPathingActive, careerPathing, refreshing, refresh, loading } =
    useCounsellorContext();

  const prospects =
    careerPathing?.students.filter((student) => student.eligibility === "overflow") ??
    [];

  if (!careerPathingActive) {
    return (
      <CounsellorScreenShell
        title="Prospects"
        subtitle="Overflow students — do not count against quota"
      >
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
    <CounsellorScreenShell
      title="Prospects"
      subtitle="Overflow students — do not count against quota"
    >
      <CounsellorScroll refreshing={refreshing} onRefresh={() => void refresh()}>
        {prospects.length === 0 ? (
          <Text className="text-sm text-muted">No prospect students yet.</Text>
        ) : (
          prospects.map((student) => (
            <ListRow
              key={student.id}
              title={student.name}
              subtitle={`${student.gradeLabel} · ${student.stream}`}
              badge={student.eligibilityLabel}
            />
          ))
        )}
      </CounsellorScroll>
    </CounsellorScreenShell>
  );
}
