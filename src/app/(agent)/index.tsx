import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { GradientButton } from "@/components/shared/gradient-button";
import { ResourceScreen } from "@/components/shared/resource-screen";
import { StatsRow, type StatCard } from "@/components/shared/stats-row";
import { useAuth } from "@/lib/auth/auth-context";
import { queryKeys } from "@/lib/query/keys";

type AgentDashboardData = {
  recentActivity: {
    items: Array<{ id: string; name: string; status: string }>;
  };
  training: {
    overallPercent: number;
    mandatoryCompleted: number;
    mandatoryTotal: number;
  };
  partnerDocuments: {
    signedContract: { downloadUrl: string; fileName: string } | null;
    feeReceipt: { downloadUrl: string; fileName: string } | null;
  };
};

const SHORTCUTS = [
  { label: "My Students", href: "/(agent)/students" },
  { label: "Ask Klara", href: "/(agent)/klara" },
  { label: "Training", href: "/(agent)/training" },
  { label: "Payments", href: "/(agent)/payments" },
  { label: "Message Team", href: "/(agent)/message-team" },
] as const;

function buildDashboardStats(data: AgentDashboardData): StatCard[] {
  const stats: StatCard[] = [
    {
      id: "training",
      value: `${data.training.overallPercent}%`,
      label: "Training progress",
      sub: `${data.training.mandatoryCompleted}/${data.training.mandatoryTotal} mandatory`,
      color: "pink",
    },
    {
      id: "activity",
      value: String(data.recentActivity.items.length),
      label: "Recent updates",
      color: "purple",
    },
  ];

  if (data.partnerDocuments.signedContract || data.partnerDocuments.feeReceipt) {
    stats.push({
      id: "docs",
      value: "✓",
      label: "Partner docs on file",
      color: "green",
    });
  }

  return stats;
}

export default function AgentHome() {
  const { profile } = useAuth();
  const router = useRouter();

  return (
    <ResourceScreen<AgentDashboardData>
      title="Partner Agent"
      subtitle={
        profile?.name ? `Welcome back, ${profile.name}` : "Your partner dashboard"
      }
      queryKey={queryKeys.agentDashboard()}
      path="/api/agent/dashboard"
    >
      {(data) => (
        <>
          <StatsRow stats={buildDashboardStats(data)} />

          {data.recentActivity.items.length > 0 ? (
            <View className="mb-4 gap-2">
              <Text className="text-sm font-semibold text-text">Recent activity</Text>
              {data.recentActivity.items.slice(0, 3).map((item) => (
                <View
                  key={item.id}
                  className="rounded-2xl border border-border bg-surface px-4 py-3"
                >
                  <Text className="text-sm font-semibold text-text">{item.name}</Text>
                  <Text className="mt-1 text-xs text-muted">{item.status}</Text>
                </View>
              ))}
            </View>
          ) : null}

          <Text className="mb-3 text-sm font-semibold text-text">Quick links</Text>
          <View className="gap-3">
            {SHORTCUTS.map((item) => (
              <GradientButton
                key={item.href}
                text={item.label}
                onPress={() => router.push(item.href as never)}
              />
            ))}
          </View>

          <View className="mt-4 flex-row flex-wrap gap-2">
            {[
              { label: "Programs", href: "/(agent)/student-programs" },
              { label: "Commissions", href: "/(agent)/commissions" },
              { label: "Resources", href: "/(agent)/resources" },
              { label: "Webinars", href: "/(agent)/webinars" },
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
      )}
    </ResourceScreen>
  );
}
