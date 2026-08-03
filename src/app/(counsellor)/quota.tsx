import { Text, View } from "react-native";

import { CareerPathingGate } from "@/components/counsellor/career-pathing-upgrade";
import { ResourceScreen } from "@/components/shared/resource-screen";
import { StatsRow } from "@/components/shared/stats-row";
import { buildQuotaStats, type CareerPathingBundle } from "@/lib/counsellor/types";
import { queryKeys } from "@/lib/query/keys";

export default function CounsellorQuotaScreen() {
  return (
    <ResourceScreen<CareerPathingBundle | { ok: false; error: string }>
      title="Student Quota"
      subtitle="Track Career Pathing roster capacity"
      queryKey={queryKeys.agentCareerPathing()}
      path="/api/agent/career-pathing"
      staleTime={30_000}
    >
      {(data) => {
        if (data.ok === false) {
          return (
            <CareerPathingGate planActive={false} error={data.error} showTopup>
              {null}
            </CareerPathingGate>
          );
        }

        const { quota } = data;

        return (
          <CareerPathingGate planActive={data.planActive} showTopup>
            <StatsRow stats={buildQuotaStats(quota)} />

            <View className="gap-3">
              <View className="rounded-2xl border border-border bg-surface px-4 py-4">
                <Text className="text-sm font-semibold text-text">Annual cap</Text>
                <Text className="mt-1 text-2xl font-bold text-text">{quota.studentCap}</Text>
                <Text className="mt-1 text-xs text-muted">Included with your school plan</Text>
              </View>

              <View className="rounded-2xl border border-border bg-surface px-4 py-4">
                <Text className="text-sm font-semibold text-text">Quota students</Text>
                <Text className="mt-1 text-2xl font-bold text-text">{quota.quotaUsed}</Text>
                <Text className="mt-1 text-xs text-muted">Counting toward your cap</Text>
              </View>

              {quota.overflowCount > 0 ? (
                <View className="rounded-2xl border border-warning/30 bg-warning/10 px-4 py-4">
                  <Text className="text-sm font-semibold text-text">Overflow students</Text>
                  <Text className="mt-1 text-2xl font-bold text-text">{quota.overflowCount}</Text>
                  <Text className="mt-1 text-xs text-muted">
                    Added beyond cap — top up to include them in quota.
                  </Text>
                </View>
              ) : null}

              {quota.atLimit ? (
                <Text className="text-sm text-muted">
                  You have reached your student cap. Use the top-up option above to add more
                  slots.
                </Text>
              ) : (
                <Text className="text-sm text-muted">
                  {quota.remaining} slot{quota.remaining === 1 ? "" : "s"} remaining this year.
                </Text>
              )}
            </View>
          </CareerPathingGate>
        );
      }}
    </ResourceScreen>
  );
}
