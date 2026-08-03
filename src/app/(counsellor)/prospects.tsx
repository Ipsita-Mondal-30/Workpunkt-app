import { Text, View } from "react-native";

import { CareerPathingGate } from "@/components/counsellor/career-pathing-upgrade";
import { ResourceScreen } from "@/components/shared/resource-screen";
import type { CareerPathingBundle, CareerPathingPortalStudent } from "@/lib/counsellor/types";
import { queryKeys } from "@/lib/query/keys";

function ProspectRow({ student }: { student: CareerPathingPortalStudent }) {
  return (
    <View className="rounded-2xl border border-border bg-surface px-4 py-4">
      <Text className="text-base font-semibold text-text">{student.name}</Text>
      <Text className="mt-1 text-sm text-muted">
        {student.gradeLabel} · {student.stream}
      </Text>
      <Text className="mt-2 text-xs font-semibold uppercase text-brand-mid">
        {student.eligibilityLabel}
      </Text>
    </View>
  );
}

export default function CounsellorProspectsScreen() {
  return (
    <ResourceScreen<CareerPathingBundle | { ok: false; error: string }>
      title="Prospects"
      subtitle="Students who still need career pathing or top-up"
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

        const prospects = data.students.filter(
          (student) =>
            student.eligibility === "needs_pathing" || student.eligibility === "overflow",
        );

        return (
          <CareerPathingGate planActive={data.planActive}>
            {prospects.length === 0 ? (
              <View className="rounded-2xl border border-border bg-surface px-4 py-6">
                <Text className="text-sm text-muted">
                  No prospects right now. Students needing pathing or a quota top-up will appear
                  here.
                </Text>
              </View>
            ) : (
              <View className="gap-2">
                {prospects.map((student) => (
                  <ProspectRow key={student.id} student={student} />
                ))}
              </View>
            )}
          </CareerPathingGate>
        );
      }}
    </ResourceScreen>
  );
}
