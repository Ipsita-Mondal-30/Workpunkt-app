import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { GradientButton } from "@/components/shared/gradient-button";
import { ResourceScreen } from "@/components/shared/resource-screen";
import { StatsRow, type StatCard } from "@/components/shared/stats-row";
import type { AgentNotification } from "@/lib/agent/notifications";
import { useAuth } from "@/lib/auth/auth-context";
import { openExternalUrl } from "@/lib/open-external-url";
import { queryKeys } from "@/lib/query/keys";
import { useApiQuery } from "@/lib/query/use-api";
import { ActionTile, PortalHero, ProgressBar } from "@/components/portal/portal-ui";

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
  { label: "Add Student", href: "/(agent)/add-student" },
  { label: "My Students", href: "/(agent)/students" },
  { label: "Ask Klara", href: "/(agent)/klara" },
  { label: "Training", href: "/(agent)/training" },
  { label: "Payments", href: "/(agent)/payments" },
  { label: "Message Team", href: "/(agent)/message-team" },
  { label: "Notifications", href: "/(agent)/notifications" },
] as const;

function buildDashboardStats(data: AgentDashboardData, unread: number): StatCard[] {
  const stats: StatCard[] = [
    {
      id: "training",
      value: `${data.training.overallPercent}%`,
      label: "Training progress",
      sub: `${data.training.mandatoryCompleted}/${data.training.mandatoryTotal} mandatory`,
      color: "pink",
    },
    {
      id: "notifications",
      value: String(unread),
      label: "Unread notifications",
      color: unread > 0 ? "pink" : "green",
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
  const notifications = useApiQuery<AgentNotification[]>(
    queryKeys.agentNotifications(),
    "/api/agent/notifications",
    { staleTime: 30_000 },
  );
  const unread = (notifications.data ?? []).filter((item) => !item.isRead).length;

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
          <PortalHero eyebrow="GERMANY ADMISSIONS PARTNER" title="Great guidance. Brighter futures." description="Help your students take their next step. Manage applications, build your expertise and grow with Workpunkt."><View className="max-w-xs"><GradientButton text="Add a student" onPress={() => router.push("/(agent)/add-student" as never)} /></View></PortalHero>
          <StatsRow stats={buildDashboardStats(data, unread)} />
          <View className="mb-6 rounded-3xl border border-border bg-surface p-5"><Text className="text-base font-bold text-text">Your partner training</Text><Text className="mb-4 mt-2 text-sm text-muted">{data.training.mandatoryCompleted} of {data.training.mandatoryTotal} required modules completed</Text><ProgressBar value={data.training.overallPercent} label="Partner training progress" /><Pressable accessibilityRole="button" onPress={() => router.push("/(agent)/training")} className="mt-3 py-3"><Text className="text-xs font-bold text-brand-start">Continue learning →</Text></Pressable></View>

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

          {data.partnerDocuments.signedContract || data.partnerDocuments.feeReceipt ? (
            <View className="mb-4 rounded-2xl border border-border bg-surface px-4 py-4">
              <Text className="mb-3 text-sm font-semibold text-text">Partner documents</Text>
              {[data.partnerDocuments.signedContract, data.partnerDocuments.feeReceipt].filter(Boolean).map((document) => (
                <Pressable key={document!.downloadUrl} onPress={() => void openExternalUrl(document!.downloadUrl)} className="mb-2 rounded-xl bg-surface-end px-3 py-3">
                  <Text className="text-sm font-semibold text-brand-mid">{document!.fileName || "Open document"} →</Text>
                </Pressable>
              ))}
            </View>
          ) : null}

          <Text className="mb-3 text-sm font-semibold text-text">Quick links</Text>
          <View className="flex-row flex-wrap gap-3">
            {SHORTCUTS.map((item) => (
              <ActionTile
                key={item.href}
                title={item.label}
                description={item.label === "Ask Klara" ? "Guidance for you and your students" : `Open ${item.label.toLowerCase()}`}
                icon={item.label === "Ask Klara" ? "sparkle" : item.label.includes("Student") ? "people" : item.label === "Training" ? "book" : item.label === "Payments" ? "wallet" : "chat"}
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
