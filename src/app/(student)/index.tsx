import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { ActionTile, PageHeading, PortalCard, PortalHero, PortalPage, LoadingCards } from "@/components/portal/portal-ui";
import { StatsRow } from "@/components/shared/stats-row";
import { KlaraAvatar } from "@/components/shared/klara-avatar";
import { GradientButton } from "@/components/shared/gradient-button";
import { useAuth } from "@/lib/auth/auth-context";
import { queryKeys } from "@/lib/query/keys";
import { useApiQuery } from "@/lib/query/use-api";
import { applicationRecords, asRecord, asRecords, textValue } from "@/lib/student/presentation";

const SHORTCUTS = [
  { title: "My programs", description: "Find the right university for you", href: "/(student)/matches", icon: "target" },
  { title: "Applications", description: "Follow each application milestone", href: "/(student)/applications", icon: "file" },
  { title: "Documents", description: "Keep your application ready", href: "/(student)/documents", icon: "upload" },
  { title: "Content Hub", description: "A little clarity for your next step", href: "/(student)/content", icon: "book" },
  { title: "Support services", description: "From your offer to your arrival", href: "/(student)/services", icon: "wallet" },
  { title: "Post-admission", description: "Prepare for your move to Germany", href: "/(student)/post-admission", icon: "check" },
] as const;

export default function StudentHome() {
  const { profile } = useAuth();
  const router = useRouter();
  const applications = useApiQuery<unknown>(queryKeys.studentApplications(), "/api/applications", {
    cachePolicy: "standard",
  });
  const matches = useApiQuery<unknown>(queryKeys.matches(), "/api/matches", {
    cachePolicy: "standard",
  });
  const notifications = useApiQuery<unknown>(queryKeys.studentNotifications(), "/api/notifications", {
    cachePolicy: "live",
  });
  const appItems = applicationRecords(applications.data);
  const matchItems = asRecords(matches.data);
  const unread = asRecords(notifications.data).filter((item) => item.isRead !== true && item.read !== true).length;
  const active = appItems[0];
  const phase = active ? asRecord(active.currentPhase) : null;
  const error = applications.error || matches.error || notifications.error;
  async function refresh() { await Promise.all([applications.refetch(), matches.refetch(), notifications.refetch()]); }

  return (
    <PortalPage refreshing={applications.isRefetching || matches.isRefetching || notifications.isRefetching} onRefresh={() => void refresh()}>
      <PageHeading title="Your dashboard" eyebrow="STUDY IN GERMANY" subtitle="A little closer to your next chapter." action={<Pressable accessibilityRole="button" onPress={() => router.push("/(student)/notifications")} className="rounded-full border border-border bg-surface px-4 py-3"><Text className="text-xs font-bold text-brand-start">{unread ? `${unread} new updates` : "All updates"}</Text></Pressable>} />
      <PortalHero eyebrow="YOUR GERMANY JOURNEY" title={`Welcome${profile?.name ? `, ${profile.name.split(" ")[0]}` : ""}.`} description="Big plans. Clear next steps. Your university applications, documents and guidance, together in one place.">
        <View className="max-w-xs"><GradientButton text="Explore my programs" onPress={() => router.push("/(student)/matches")} /></View>
      </PortalHero>
      {error ? <PortalCard title="Some updates are unavailable"><Text className="mt-2 text-sm text-muted">{error.message}</Text><Pressable accessibilityRole="button" onPress={() => void refresh()} className="mt-3 py-2"><Text className="font-semibold text-brand-start">Refresh dashboard</Text></Pressable></PortalCard> : null}
      {applications.isLoading && matches.isLoading ? <LoadingCards /> : <StatsRow stats={[
        { id: "programs", value: matches.error || matches.isLoading ? "—" : String(matchItems.length), label: "Matched programs", color: "purple" },
        { id: "applications", value: applications.error || applications.isLoading ? "—" : String(appItems.length), label: "Applications", color: "pink" },
        { id: "updates", value: notifications.error || notifications.isLoading ? "—" : String(unread), label: "Unread updates", color: "blue" },
      ]} />}
      {active ? <PortalCard title="Your current application" caption={textValue(active, "universityName", "university", "programName", "degreeName") || "University application"}><View className="mt-4 flex-row items-center justify-between gap-3"><Text className="shrink rounded-full bg-brand-start/10 px-3 py-2 text-xs font-bold text-brand-start">{textValue(active, "status", "stage", "currentPhase") || (phase ? textValue(phase, "title", "label") : "") || "Profile review"}</Text><Pressable accessibilityRole="button" onPress={() => router.push("/(student)/applications")} className="py-3"><Text className="text-xs font-bold text-brand-start">View journey →</Text></Pressable></View></PortalCard> : null}
      <Text accessibilityRole="header" className="mb-4 mt-2 text-lg font-bold text-text">Make your next move</Text>
      <View className="mb-6 flex-row flex-wrap gap-3">{SHORTCUTS.map((item) => <ActionTile key={item.href} title={item.title} description={item.description} icon={item.icon} onPress={() => router.push(item.href as never)} />)}</View>
      <PortalCard className="border-brand-start/20" title="A question on your mind?"><View className="mt-4 flex-row items-center gap-4"><KlaraAvatar size={52} /><View className="flex-1"><Text className="text-sm font-bold text-text">Meet Klara, your AI guide</Text><Text className="mt-1 text-xs leading-5 text-muted">Explore your options and get help with your next step.</Text></View></View><View className="mt-5"><GradientButton text="Talk to Klara" onPress={() => router.push("/(student)/klara")} /></View><Pressable accessibilityRole="button" onPress={() => router.push("/(student)/support")} className="mt-3 py-3"><Text className="text-center text-xs font-semibold text-muted">Prefer a person? Message your counsellor →</Text></Pressable></PortalCard>
    </PortalPage>
  );
}
