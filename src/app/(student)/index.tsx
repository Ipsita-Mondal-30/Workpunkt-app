import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { useAuth } from "@/lib/auth/auth-context";
import { queryKeys } from "@/lib/query/keys";
import { useApiQuery } from "@/lib/query/use-api";
import { applicationRecords, asRecord, asRecords, textValue } from "@/lib/student/presentation";

const SHORTCUTS = [
  { label: "Programs", caption: "Review and confirm matches", href: "/(student)/matches", icon: "◎" },
  { label: "Applications", caption: "Track every submission", href: "/(student)/applications", icon: "↗" },
  { label: "Documents", caption: "Upload and review files", href: "/(student)/documents", icon: "▤" },
  { label: "Ask Klara", caption: "AI guidance and matching", href: "/(student)/klara", icon: "✦" },
  { label: "Content Hub", caption: "Guides, webinars and news", href: "/(student)/content", icon: "▶" },
  { label: "Services", caption: "Support from offer to arrival", href: "/(student)/services", icon: "+" },
] as const;

export default function StudentHome() {
  const { profile } = useAuth();
  const router = useRouter();
  const applications = useApiQuery<unknown>(queryKeys.studentApplications(), "/api/applications");
  const matches = useApiQuery<unknown>(queryKeys.matches(), "/api/matches");
  const notifications = useApiQuery<unknown>(queryKeys.studentNotifications(), "/api/notifications", {
    staleTime: 30_000,
  });
  const refreshing = applications.isRefetching || matches.isRefetching || notifications.isRefetching;
  const appItems = applicationRecords(applications.data);
  const matchItems = asRecords(matches.data);
  const unread = asRecords(notifications.data).filter(
    (item) => item.isRead !== true && item.read !== true,
  ).length;
  const active = appItems[0];
  const activePhase = active ? asRecord(active.currentPhase) : null;

  async function refresh() {
    await Promise.all([applications.refetch(), matches.refetch(), notifications.refetch()]);
  }

  return (
    <ScrollView
      className="flex-1 bg-bg"
      contentContainerClassName="px-4 py-5 pb-12"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void refresh()} tintColor="#f6339a" />}
    >
      <View className="overflow-hidden rounded-3xl border border-brand-mid/20 bg-brand-start/10 px-5 py-6">
        <Text className="text-xs font-bold uppercase tracking-[2px] text-brand-mid">Your Germany journey</Text>
        <Text className="mt-2 text-3xl font-bold text-text">
          Welcome{profile?.name ? `, ${profile.name.split(" ")[0]}` : ""}
        </Text>
        <Text className="mt-2 text-sm leading-5 text-muted">
          Your applications, documents, matches and counsellor support are together in one place.
        </Text>
        {active ? (
          <View className="mt-5 rounded-2xl border border-brand-mid/15 bg-surface px-4 py-3">
            <Text className="text-xs font-semibold uppercase text-muted">Current application</Text>
            <Text className="mt-1 text-base font-bold text-text">
              {textValue(active, "universityName", "university", "programName", "degreeName") || "Application received"}
            </Text>
            <Text className="mt-1 text-sm font-semibold text-brand-mid">
              {textValue(active, "status", "stage", "currentPhase") || (activePhase ? textValue(activePhase, "title", "label", "status", "name") : "") || "Profile review in progress"}
            </Text>
          </View>
        ) : null}
      </View>

      <View className="mt-4 flex-row gap-2">
        {[
          { value: String(matchItems.length), label: "Programs" },
          { value: String(appItems.length), label: "Applications" },
          { value: String(unread), label: "Unread" },
        ].map((stat) => (
          <View key={stat.label} className="flex-1 rounded-2xl border border-border bg-surface px-3 py-3">
            <Text className="text-xl font-bold text-text">{stat.value}</Text>
            <Text className="mt-1 text-xs text-muted">{stat.label}</Text>
          </View>
        ))}
      </View>

      {(applications.isLoading || matches.isLoading) && !applications.data && !matches.data ? (
        <ActivityIndicator className="mt-6" color="#f6339a" />
      ) : null}

      <View className="mt-7 flex-row items-center justify-between">
        <Text className="text-lg font-bold text-text">Continue your journey</Text>
        {unread > 0 ? (
          <Pressable onPress={() => router.push("/(student)/notifications")}>
            <Text className="text-xs font-bold text-brand-mid">{unread} new</Text>
          </Pressable>
        ) : null}
      </View>
      <View className="mt-3 gap-3">
        {SHORTCUTS.map((item) => (
          <Pressable
            key={item.href}
            onPress={() => router.push(item.href as never)}
            className="flex-row items-center rounded-2xl border border-border bg-surface px-4 py-4"
          >
            <View className="h-11 w-11 items-center justify-center rounded-2xl bg-brand-mid/10">
              <Text className="text-xl font-bold text-brand-mid">{item.icon}</Text>
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-base font-bold text-text">{item.label}</Text>
              <Text className="mt-0.5 text-xs text-muted">{item.caption}</Text>
            </View>
            <Text className="text-xl text-brand-mid">›</Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        onPress={() => router.push("/(student)/support")}
        className="mt-6 rounded-2xl border border-brand-mid/25 bg-brand-mid/10 px-4 py-4"
      >
        <Text className="text-sm font-bold text-brand-mid">Need a human?</Text>
        <Text className="mt-1 text-sm text-text">Message your Workpunkt counsellor →</Text>
      </Pressable>
    </ScrollView>
  );
}
