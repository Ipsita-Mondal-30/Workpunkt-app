import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { CareerPathingUpgrade } from "@/components/counsellor/career-pathing-upgrade";
import {
  CounsellorScroll,
  SectionCard,
  StatPill,
} from "@/components/counsellor/counsellor-scroll";
import { CounsellorScreenShell } from "@/components/counsellor/counsellor-screen-shell";
import { GradientButton } from "@/components/shared/gradient-button";
import { useCounsellorContext } from "@/lib/counsellor/use-counsellor-context";
import {
  counsellorAccessPriceLabel,
  startMobileCheckout,
} from "@/lib/stripe/mobile-checkout";

type Shortcut = {
  label: string;
  href: string;
  requiresAccess?: boolean;
  requiresCp?: boolean;
};

const PARTNER_SHORTCUTS: Shortcut[] = [
  { label: "My Students", href: "/(counsellor)/(tabs)/students", requiresAccess: true },
  {
    label: "Student Programs",
    href: "/(counsellor)/(tabs)/more/student-programs",
    requiresAccess: true,
  },
  { label: "Resource Hub", href: "/(counsellor)/(tabs)/resources", requiresAccess: true },
  { label: "Training Hub", href: "/(counsellor)/(tabs)/training" },
  { label: "Ask Klara", href: "/(counsellor)/(tabs)/more/klara" },
  { label: "Message Team", href: "/(counsellor)/(tabs)/more/support" },
];

const CP_SHORTCUTS: Shortcut[] = [
  { label: "Career Pathing roster", href: "/(counsellor)/(tabs)/more/career-pathing", requiresCp: true },
  { label: "Student Roadmaps", href: "/(counsellor)/(tabs)/more/roadmaps", requiresCp: true },
  { label: "Prospect Students", href: "/(counsellor)/(tabs)/more/prospects", requiresCp: true },
  {
    label: "Placement Rewards",
    href: "/(counsellor)/(tabs)/more/placement-rewards",
    requiresCp: true,
  },
];

export default function CounsellorDashboardScreen() {
  const router = useRouter();
  const {
    loading,
    refreshing,
    error,
    refresh,
    me,
    context,
    counsellorAccessPaid,
    careerPathingActive,
    careerPathing,
  } = useCounsellorContext();
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const name = me?.profile.name ?? "Counsellor";
  const quota = context?.careerPathingQuota ?? careerPathing?.quota;
  const used = quota?.quotaUsed ?? 0;
  const cap = quota?.studentCap ?? context?.schoolPlan.studentCap ?? 20;
  const remaining = quota?.remaining ?? Math.max(0, cap - used);
  const placements = context?.schoolPlan.placementsConfirmed ?? 0;

  async function unlockAccess() {
    setCheckoutLoading(true);
    const result = await startMobileCheckout("school_counsellor_access");
    setCheckoutLoading(false);
    if (result.ok) await refresh();
  }

  function openShortcut(item: Shortcut) {
    if (item.requiresAccess && !counsellorAccessPaid) {
      void unlockAccess();
      return;
    }
    if (item.requiresCp && !careerPathingActive) {
      router.push("/(counsellor)/(tabs)/more/career-pathing");
      return;
    }
    router.push(item.href as never);
  }

  return (
    <CounsellorScreenShell title="Dashboard" subtitle={`Welcome, ${name}`}>
      <CounsellorScroll
        loading={loading}
        refreshing={refreshing}
        onRefresh={() => void refresh()}
        error={error}
      >
        <View className="mb-4 flex-row gap-3">
          <View className="flex-1">
            <StatPill
              label="Counselor Access"
              value={counsellorAccessPaid ? "Active" : "Locked"}
            />
          </View>
          <View className="flex-1">
            <StatPill
              label="Career Pathing"
              value={careerPathingActive ? "Active" : "Not active"}
            />
          </View>
        </View>

        {counsellorAccessPaid ? (
          <SectionCard
            title="Counselor Access unlocked"
            subtitle="Portal basics, resources, and student application forms are available."
          />
        ) : (
          <SectionCard
            accent
            title="Complete Counselor Access"
            subtitle={`One-time ${counsellorAccessPriceLabel()} unlocks Students, Resource Hub, and application forms.`}
          >
            <View className="mt-4">
              <GradientButton
                text={`Pay Counselor Access (${counsellorAccessPriceLabel()})`}
                loading={checkoutLoading}
                onPress={() => void unlockAccess()}
              />
            </View>
          </SectionCard>
        )}

        {careerPathingActive ? (
          <SectionCard
            accent
            title="Career Pathing · Active"
            subtitle={`Student capacity ${used} / ${cap} · Remaining seats ${remaining}`}
          >
            <View className="mt-4 gap-3">
              <GradientButton
                text="Open Career Pathing"
                onPress={() => router.push("/(counsellor)/(tabs)/more/career-pathing")}
              />
              {remaining <= 0 ? (
                <CareerPathingUpgrade
                  showTopup
                  onCompleted={() => void refresh()}
                />
              ) : null}
            </View>
          </SectionCard>
        ) : (
          <View className="mb-4">
            <CareerPathingUpgrade onCompleted={() => void refresh()} />
          </View>
        )}

        <Text className="mb-2 mt-1 text-sm font-semibold text-text">Partner tools</Text>
        <View className="mb-4 gap-2">
          {PARTNER_SHORTCUTS.map((item) => {
            const locked = Boolean(item.requiresAccess && !counsellorAccessPaid);
            return (
              <Pressable
                key={item.href}
                onPress={() => openShortcut(item)}
                className="rounded-2xl border border-border bg-surface px-4 py-3"
              >
                <Text className="text-sm font-semibold text-text">
                  {item.label}
                  {locked ? " 🔒" : ""}
                </Text>
                {locked ? (
                  <Text className="mt-1 text-xs text-muted">
                    Unlock Counselor Access to open this
                  </Text>
                ) : null}
              </Pressable>
            );
          })}
        </View>

        {careerPathingActive ? (
          <>
            <Text className="mb-2 text-sm font-semibold text-text">Career Pathing</Text>
            <View className="mb-4 gap-2">
              {CP_SHORTCUTS.map((item) => (
                <Pressable
                  key={item.href}
                  onPress={() => openShortcut(item)}
                  className="rounded-2xl border border-border bg-surface px-4 py-3"
                >
                  <Text className="text-sm font-semibold text-text">{item.label}</Text>
                </Pressable>
              ))}
            </View>

            <SectionCard
              title="Partner Achievement"
              subtitle={`Placements confirmed: ${placements} / 10`}
            >
              <Text className="mt-2 text-sm text-muted">
                Track placement milestones toward Germany trip rewards.
              </Text>
              <View className="mt-4">
                <GradientButton
                  text="Placement rewards"
                  onPress={() =>
                    router.push("/(counsellor)/(tabs)/more/placement-rewards")
                  }
                />
              </View>
            </SectionCard>
          </>
        ) : null}

        <SectionCard
          title="Continue training"
          subtitle="Complete onboarding modules in the Training Hub."
        >
          <View className="mt-4">
            <GradientButton
              text="Open Training Hub"
              onPress={() => router.push("/(counsellor)/(tabs)/training")}
            />
          </View>
        </SectionCard>
      </CounsellorScroll>
    </CounsellorScreenShell>
  );
}
