import { useState, type ReactNode } from "react";
import { Modal, Pressable, ScrollView, Text, View, useWindowDimensions } from "react-native";
import { usePathname, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { WorkpunktLogo } from "@/components/shared/workpunkt-logo";
import { PortalIcon, type PortalIconName } from "@/components/portal/portal-ui";
import { KlaraFab } from "@/components/klara/klara-fab";
import { COUNSELLOR_CP_NAV, ROLE_NAV, ROLE_TITLE } from "@/constants/nav";
import { useAuth } from "@/lib/auth/auth-context";
import type { AgentNotification } from "@/lib/agent/notifications";
import type { AppRole } from "@/lib/auth/resolve-role";
import { useOptionalCounsellorContext } from "@/lib/counsellor/use-counsellor-context";
import { queryKeys } from "@/lib/query/keys";
import { useApiQuery } from "@/lib/query/use-api";
import { useTheme } from "@/lib/theme/theme-context";
import { cn } from "@/lib/utils";

function cleanRoute(path: string) {
  return path.replace(/\/\([^/]+\)/g, "").replace(/\/$/, "") || "/";
}
function isActivePath(pathname: string, href: string) {
  const target = cleanRoute(href);
  if (target === "/students" && (pathname === "/student-detail" || pathname === "/add-student")) return true;
  return pathname === target || (target !== "/" && pathname.startsWith(target + "/"));
}
function navIcon(label: string): PortalIconName {
  if (/klara/i.test(label)) return "sparkle";
  if (/student|agent|lead/i.test(label) && !/program/i.test(label)) return "people";
  if (/program|pipeline|roadmap/i.test(label)) return "target";
  if (/payment|commission|reward/i.test(label)) return "wallet";
  if (/training|content|resource/i.test(label)) return "book";
  if (/chat|help|message/i.test(label)) return "chat";
  if (/notification/i.test(label)) return "bell";
  if (/settings/i.test(label)) return "settings";
  if (/home|dashboard/i.test(label)) return "home";
  return "file";
}

export function RoleShell({ role, title, children }: { role: AppRole; title: string; children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const { width } = useWindowDimensions();
  const wide = width >= 1024;
  const router = useRouter();
  const pathname = usePathname();
  const { profile, signOut } = useAuth();
  const { isDark } = useTheme();
  const counsellorCtx = useOptionalCounsellorContext();
  const notifications = useApiQuery<AgentNotification[]>(queryKeys.agentNotifications(), "/api/agent/notifications", { enabled: role === "agent", staleTime: 30_000 });
  const unread = (notifications.data ?? []).filter((item) => !item.isRead).length;
  const base = ROLE_NAV[role];
  const insertAt = Math.max(0, base.findIndex((item) => item.label === "Training Hub"));
  const items = role === "counsellor" && counsellorCtx?.careerPathingActive
    ? [...base.slice(0, insertAt), ...COUNSELLOR_CP_NAV, ...base.slice(insertAt)] : base;
  const ink = isDark ? "#e4e4e7" : "#514957";

  async function logout() {
    setVisible(false);
    await signOut();
    router.replace("/(auth)/login");
  }

  function navigation() {
    return (
      <View className="flex-1 bg-surface px-4 pb-5 pt-6">
        <View className="mb-6 flex-row items-center justify-between px-3">
          <WorkpunktLogo fontSize={27} />
          {!wide ? <Pressable accessibilityLabel="Close menu" accessibilityRole="button" onPress={() => setVisible(false)} className="h-11 w-11 items-center justify-center"><PortalIcon name="close" color={ink} /></Pressable> : null}
        </View>
        <View className="mx-2 mb-5 flex-row items-center gap-3 rounded-2xl bg-brand-start/5 p-3">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-brand-start/10"><Text className="text-base font-bold text-brand-start">{profile?.name?.slice(0, 1).toUpperCase() || "W"}</Text></View>
          <View className="flex-1"><Text numberOfLines={1} className="text-sm font-bold text-text">{profile?.name || "My account"}</Text><Text className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted">{ROLE_TITLE[role]} portal</Text></View>
        </View>
        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
          <Text className="mb-3 px-4 text-[9px] font-bold tracking-[2px] text-muted">NAVIGATE</Text>
          {items.map((item) => {
            const active = isActivePath(pathname, item.href);
            return <Pressable accessibilityRole="button" accessibilityState={{ selected: active }} key={item.href} onPress={() => { setVisible(false); router.push(item.href as never); }} className={cn("mb-1 min-h-12 flex-row items-center gap-3 rounded-2xl px-4 py-3", active ? "bg-brand-start/10" : "bg-transparent")}><PortalIcon name={navIcon(item.label)} size={19} color={active ? "#ba43ed" : ink} /><Text className={cn("flex-1 text-sm font-semibold", active ? "text-brand-start" : "text-text")}>{item.label}</Text>{active ? <View className="h-1.5 w-1.5 rounded-full bg-brand-start" /> : null}</Pressable>;
          })}
        </ScrollView>
        <Pressable accessibilityRole="button" onPress={() => void logout()} className="min-h-12 flex-row items-center justify-center gap-2 rounded-2xl border border-border px-4 py-3"><PortalIcon name="back" color={ink} size={17} /><Text className="text-sm font-semibold text-muted">Log out</Text></Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top", "left", "right"]}>
      <View className="flex-1 flex-row">
        {wide ? <View style={{ width: 260 }} className="border-r border-border">{navigation()}</View> : null}
        <View className="flex-1">
          <View className="min-h-16 flex-row items-center gap-3 border-b border-border bg-surface px-5 py-3">
            {!wide ? <Pressable accessibilityLabel="Open menu" accessibilityRole="button" onPress={() => setVisible(true)} className="h-11 w-11 items-center justify-center rounded-full bg-surface-end"><PortalIcon name="menu" color={ink} /></Pressable> : null}
            <View className="flex-1">{!wide ? <WorkpunktLogo fontSize={23} /> : <Text className="text-sm font-semibold text-muted">{title} portal</Text>}</View>
            {role === "agent" ? <Pressable accessibilityLabel={`Notifications, ${unread} unread`} accessibilityRole="button" onPress={() => router.push("/(agent)/notifications" as never)} className="relative h-11 w-11 items-center justify-center rounded-full border border-border"><PortalIcon name="bell" color={ink} />{unread > 0 ? <View className="absolute -right-1 -top-1 min-w-5 items-center rounded-full bg-brand-mid px-1 py-0.5"><Text className="text-[9px] font-bold text-white">{unread > 9 ? "9+" : unread}</Text></View> : null}</Pressable> : null}
            {role !== "agent" || width >= 400 ? <View className="h-9 w-9 items-center justify-center rounded-full bg-brand-start/10"><Text className="text-sm font-bold text-brand-start">{profile?.name?.slice(0, 1).toUpperCase() || "W"}</Text></View> : null}
          </View>
          <View className="flex-1">{children}<KlaraFab role={role} /></View>
        </View>
      </View>
      <Modal visible={visible && !wide} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <View className="flex-1 flex-row"><SafeAreaView style={{ width: Math.min(width * 0.88, 340) }} className="bg-surface" edges={["top", "bottom"]}>{navigation()}</SafeAreaView><Pressable accessibilityLabel="Close menu" onPress={() => setVisible(false)} className="flex-1 bg-black/40" /></View>
      </Modal>
    </SafeAreaView>
  );
}
