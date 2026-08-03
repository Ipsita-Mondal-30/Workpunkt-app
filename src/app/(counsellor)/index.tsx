import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { CareerPathingGate } from "@/components/counsellor/career-pathing-upgrade";
import { GradientButton } from "@/components/shared/gradient-button";
import { ResourceScreen } from "@/components/shared/resource-screen";
import { StatsRow } from "@/components/shared/stats-row";
import { useAuth } from "@/lib/auth/auth-context";
import { useCounsellorAccess } from "@/lib/counsellor/use-counsellor-access";
import {
  buildQuotaStats,
  type CareerPathingBundle,
} from "@/lib/counsellor/types";
import { queryKeys } from "@/lib/query/keys";

const CP_SHORTCUTS = [
  { label: "Career Pathing roster", href: "/(counsellor)/career-pathing" },
  { label: "Roadmaps", href: "/(counsellor)/roadmaps" },
  { label: "CP Resources", href: "/(counsellor)/cp-resources" },
  { label: "Quota", href: "/(counsellor)/quota" },
] as const;

const PARTNER_SHORTCUTS = [
  { label: "My Students", href: "/(counsellor)/students" },
  { label: "Student Programs", href: "/(counsellor)/student-programs" },
  { label: "Resources", href: "/(counsellor)/resources" },
  { label: "Ask Klara", href: "/(counsellor)/klara" },
  { label: "Message Team", href: "/(counsellor)/message-team" },
] as const;

function OverviewContent({
  bundle,
  accessPaid,
}: {
  bundle: CareerPathingBundle;
  accessPaid: boolean;
}) {
  const router = useRouter();

  return (
    <>
      <StatsRow
        stats={[
          {
            id: "plan",
            value: bundle.planActive ? "Active" : "Inactive",
            label: "Career Pathing plan",
            sub: bundle.schoolPlan.packageType ?? undefined,
            color: bundle.planActive ? "green" : "purple",
          },
          ...buildQuotaStats(bundle.quota),
        ]}
      />

      <View className="mb-4 rounded-2xl border border-border bg-surface px-4 py-3">
        <Text className="text-sm font-semibold text-text">Partner access</Text>
        <Text className="mt-1 text-xs text-muted">
          {accessPaid
            ? "Counsellor access unlocked — student lists and partner resources are available."
            : "Counsellor access locked — unlock to view partner students and resources."}
        </Text>
      </View>

      <Text className="mb-3 text-sm font-semibold text-text">Career Pathing</Text>
      <View className="mb-4 gap-3">
        {CP_SHORTCUTS.map((item) => (
          <GradientButton
            key={item.href}
            text={item.label}
            onPress={() => router.push(item.href as never)}
          />
        ))}
      </View>

      <Text className="mb-3 text-sm font-semibold text-text">Partner tools</Text>
      <View className="gap-3">
        {PARTNER_SHORTCUTS.map((item) => (
          <GradientButton
            key={item.href}
            text={item.label}
            onPress={() => router.push(item.href as never)}
          />
        ))}
      </View>

      <View className="mt-4 flex-row flex-wrap gap-2">
        {[
          { label: "Prospects", href: "/(counsellor)/prospects" },
          { label: "Rewards", href: "/(counsellor)/rewards" },
        ].map((item) => (
          <Pressable
            key={item.href}
            onPress={() => router.push(item.href as never)}
            className="rounded-xl border border-border bg-surface px-3 py-2"
          >
            <Text className="text-xs font-semibold text-brand-mid">{item.label}</Text>
          </Pressable>
        ))}
      </View>
    </>
  );
}

export default function CounsellorHome() {
  const { profile } = useAuth();
  const { loading: accessLoading, accessPaid, planActive } = useCounsellorAccess();

  return (
    <ResourceScreen<CareerPathingBundle | { ok: false; error: string }>
      title="School Counsellor"
      subtitle={
        profile?.name
          ? `Welcome, ${profile.name}`
          : "Career Pathing and partner tools for your school"
      }
      queryKey={queryKeys.agentCareerPathing()}
      path="/api/agent/career-pathing"
      staleTime={30_000}
    >
      {(data) => {
        if (data.ok === false) {
          return (
            <CareerPathingGate
              planActive={false}
              loading={accessLoading}
              error={data.error}
            >
              {null}
            </CareerPathingGate>
          );
        }

        return (
          <CareerPathingGate
            planActive={planActive || data.planActive}
            loading={accessLoading}
            error={null}
          >
            <OverviewContent bundle={data} accessPaid={accessPaid} />
          </CareerPathingGate>
        );
      }}
    </ResourceScreen>
  );
}
