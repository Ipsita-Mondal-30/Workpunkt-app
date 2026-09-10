import { Text } from "react-native";

import { CareerPathingGate } from "@/components/counsellor/career-pathing-upgrade";
import { CounsellorScroll, SectionCard } from "@/components/counsellor/counsellor-scroll";
import { CounsellorScreenShell } from "@/components/counsellor/counsellor-screen-shell";
import { useCounsellorContext } from "@/lib/counsellor/use-counsellor-context";

export default function PlacementRewardsScreen() {
  const { careerPathingActive, context, loading, refresh } = useCounsellorContext();
  const placements = context?.schoolPlan.placementsConfirmed ?? 0;

  if (!careerPathingActive) {
    return (
      <CounsellorScreenShell title="Placement rewards" subtitle="Partner achievement">
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
    <CounsellorScreenShell title="Placement rewards" subtitle="Partner achievement">
      <CounsellorScroll>
        <SectionCard
          title="Progress"
          subtitle={`${placements} / 10 placements confirmed`}
        />
        <Text className="text-sm leading-6 text-muted">
          Placement rewards unlock as confirmed placements accumulate on your Career Pathing
          plan. Details mirror the web counsellor dashboard — contact support for reward
          fulfillment questions.
        </Text>
      </CounsellorScroll>
    </CounsellorScreenShell>
  );
}
