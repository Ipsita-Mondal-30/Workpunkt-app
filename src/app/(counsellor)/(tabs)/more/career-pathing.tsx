import { useState } from "react";
import { Text, View } from "react-native";
import { useRouter } from "expo-router";

import {
  CounsellorScroll,
  ListRow,
  SectionCard,
} from "@/components/counsellor/counsellor-scroll";
import { CounsellorScreenShell } from "@/components/counsellor/counsellor-screen-shell";
import { GradientButton } from "@/components/shared/gradient-button";
import { useCounsellorContext } from "@/lib/counsellor/use-counsellor-context";
import {
  careerPathingPriceLabel,
  startMobileCheckout,
} from "@/lib/stripe/mobile-checkout";

export default function CareerPathingDetailScreen() {
  const router = useRouter();
  const { careerPathingActive, careerPathing, refresh } = useCounsellorContext();
  const [loading, setLoading] = useState(false);

  async function startPlan() {
    setLoading(true);
    const result = await startMobileCheckout("school");
    setLoading(false);
    if (result.ok) {
      await refresh();
    }
  }

  return (
    <CounsellorScreenShell title="Career Pathing" subtitle="School partner program">
      <CounsellorScroll>
        <SectionCard
          title="What's included"
          subtitle="20-student quota, grade roadmaps, prospect overflow handling, placement rewards, and partner training."
        />
        {careerPathingActive ? (
          <>
            <SectionCard
              title="Your plan"
              subtitle={`${careerPathing?.quota.quotaUsed ?? 0} / ${careerPathing?.quota.studentCap ?? 20} seats used`}
            />
            <GradientButton
              text="View roadmaps"
              onPress={() => router.push("/(counsellor)/(tabs)/more/roadmaps")}
            />
          </>
        ) : (
          <>
            <Text className="mb-4 text-lg font-semibold text-text">
              {careerPathingPriceLabel()}
            </Text>
            <GradientButton
              text="Start Career Pathing"
              loading={loading}
              onPress={() => void startPlan()}
            />
          </>
        )}
      </CounsellorScroll>
    </CounsellorScreenShell>
  );
}
