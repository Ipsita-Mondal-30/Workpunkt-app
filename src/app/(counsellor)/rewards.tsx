import { Text, View } from "react-native";

import { CareerPathingGate } from "@/components/counsellor/career-pathing-upgrade";
import { ResourceScreen } from "@/components/shared/resource-screen";
import {
  CAREER_PATHING_PLACEMENT_TARGET,
  type CareerPathingBundle,
} from "@/lib/counsellor/types";
import { queryKeys } from "@/lib/query/keys";

export default function CounsellorRewardsScreen() {
  return (
    <ResourceScreen<CareerPathingBundle | { ok: false; error: string }>
      title="Placement Rewards"
      subtitle="Track confirmed Germany placements toward your trip reward"
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

        const confirmed = data.schoolPlan.placementsConfirmed ?? 0;
        const unlocked = confirmed >= CAREER_PATHING_PLACEMENT_TARGET;
        const fillPct = Math.min(
          100,
          Math.round((confirmed / CAREER_PATHING_PLACEMENT_TARGET) * 100),
        );

        return (
          <CareerPathingGate planActive={data.planActive}>
            <View
              className={
                unlocked
                  ? "rounded-2xl border border-success/40 bg-success/10 px-4 py-6"
                  : "rounded-2xl border border-border bg-surface px-4 py-6"
              }
            >
              <Text className="text-xs font-bold uppercase tracking-wide text-muted">
                Partner achievement
              </Text>
              <Text className="mt-2 text-2xl font-bold text-text">
                Germany placements: {confirmed} / {CAREER_PATHING_PLACEMENT_TARGET}
              </Text>

              <View className="mt-4 h-2 overflow-hidden rounded-full bg-border">
                <View
                  className="h-full rounded-full bg-brand-mid"
                  style={{ width: `${fillPct}%` }}
                />
              </View>

              <Text className="mt-4 text-sm text-muted">
                {unlocked
                  ? "Congratulations — you've unlocked the placement reward tier."
                  : `${CAREER_PATHING_PLACEMENT_TARGET - confirmed} more confirmed placement${
                      CAREER_PATHING_PLACEMENT_TARGET - confirmed === 1 ? "" : "s"
                    } to unlock the reward.`}
              </Text>
            </View>
          </CareerPathingGate>
        );
      }}
    </ResourceScreen>
  );
}
