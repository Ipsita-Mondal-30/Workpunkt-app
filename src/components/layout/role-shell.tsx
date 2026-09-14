import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { usePathname, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { WorkpunktLogo } from "@/components/shared/workpunkt-logo";
import { KlaraFab } from "@/components/klara/klara-fab";
import { COUNSELLOR_CP_NAV, ROLE_NAV, ROLE_TITLE } from "@/constants/nav";
import { useAuth } from "@/lib/auth/auth-context";
import type { AgentNotification } from "@/lib/agent/notifications";
import type { AppRole } from "@/lib/auth/resolve-role";
import { useOptionalCounsellorContext } from "@/lib/counsellor/use-counsellor-context";
import { queryKeys } from "@/lib/query/keys";
import { useApiQuery } from "@/lib/query/use-api";
import { cn } from "@/lib/utils";

type RoleShellProps = {
  role: AppRole;
  title: string;
  children: ReactNode;
};

const DRAWER_WIDTH = Math.min(Dimensions.get("window").width * 0.82, 360);

function isActivePath(pathname: string | null, href: string) {
  if (!pathname) return false;
  const leaf = href.split("/").pop() ?? "";
  if (!leaf || leaf.startsWith("(")) {
    return (
      pathname === "/" ||
      pathname.endsWith("/index") ||
      pathname === href ||
      pathname.split("/").filter(Boolean).length <= 1
    );
  }
  return pathname.includes(leaf);
}

export function RoleShell({ role, title, children }: RoleShellProps) {
  const [visible, setVisible] = useState(false);
  const slideX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const router = useRouter();
  const pathname = usePathname();
  const { profile, signOut } = useAuth();
  const counsellorCtx = useOptionalCounsellorContext();
  const agentNotifications = useApiQuery<AgentNotification[]>(
    queryKeys.agentNotifications(),
    "/api/agent/notifications",
    { enabled: role === "agent", staleTime: 30_000 },
  );
  const agentUnread = (agentNotifications.data ?? []).filter((item) => !item.isRead).length;
  const items =
    role === "counsellor" && counsellorCtx?.careerPathingActive
      ? (() => {
          const base = ROLE_NAV.counsellor;
          const insertAt = Math.max(
            0,
            base.findIndex((item) => item.label === "Training Hub"),
          );
          return [
            ...base.slice(0, insertAt),
            ...COUNSELLOR_CP_NAV,
            ...base.slice(insertAt),
          ];
        })()
      : ROLE_NAV[role];

  function openDrawer() {
    setVisible(true);
  }

  function closeDrawer() {
    Animated.parallel([
      Animated.timing(slideX, {
        toValue: -DRAWER_WIDTH,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) setVisible(false);
    });
  }

  useEffect(() => {
    if (!visible) return;
    slideX.setValue(-DRAWER_WIDTH);
    overlayOpacity.setValue(0);
    Animated.parallel([
      Animated.timing(slideX, {
        toValue: 0,
        duration: 240,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 240,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, overlayOpacity, slideX]);

  async function handleSignOut() {
    closeDrawer();
    await signOut();
    router.replace("/(auth)/login");
  }

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top", "left", "right"]}>
      <View className="flex-row items-center justify-between border-b border-border bg-bg px-4 py-3">
        <Pressable
          accessibilityLabel="Open menu"
          onPress={openDrawer}
          className="h-10 w-10 items-center justify-center rounded-xl bg-surface-end"
        >
          <Text className="text-xl text-text">☰</Text>
        </Pressable>
        <Text className="flex-1 px-3 text-center text-base font-semibold text-text">
          {title}
        </Text>
        {role === "agent" ? (
          <Pressable
            accessibilityLabel={`Notifications${agentUnread ? `, ${agentUnread} unread` : ""}`}
            onPress={() => router.push("/(agent)/notifications" as never)}
            className="relative h-10 w-10 items-center justify-center rounded-xl bg-surface-end"
          >
            <Text className="text-lg text-text">🔔</Text>
            {agentUnread > 0 ? (
              <View className="absolute -right-1 -top-1 min-w-5 items-center rounded-full bg-brand-mid px-1 py-0.5">
                <Text className="text-[9px] font-bold text-white">{agentUnread > 9 ? "9+" : agentUnread}</Text>
              </View>
            ) : null}
          </Pressable>
        ) : <View className="w-10" />}
      </View>

      <View className="flex-1 bg-bg">
        {children}
        <KlaraFab role={role} />
      </View>

      <Modal
        visible={visible}
        animationType="none"
        transparent
        onRequestClose={closeDrawer}
      >
        <View className="flex-1 flex-row bg-transparent">
          <Animated.View
            style={{
              width: DRAWER_WIDTH,
              transform: [{ translateX: slideX }],
            }}
            className="h-full bg-bg"
          >
            <SafeAreaView className="flex-1 bg-bg" edges={["top", "bottom", "left"]}>
              <View className="flex-1 px-5 pb-6 pt-4">
                <WorkpunktLogo fontSize={28} />
                <Text className="mt-3 text-sm font-medium text-muted">
                  {ROLE_TITLE[role]}
                  {profile?.name ? ` · ${profile.name}` : ""}
                </Text>

                <ScrollView className="mt-8" contentContainerClassName="pb-6">
                  {items.map((item) => {
                    const active = isActivePath(pathname, item.href);
                    return (
                      <Pressable
                        key={item.href}
                        onPress={() => {
                          closeDrawer();
                          router.push(item.href as never);
                        }}
                        className={cn(
                          "mb-2 rounded-2xl px-4 py-3",
                          active ? "bg-brand-mid/15" : "bg-transparent",
                        )}
                      >
                        <Text
                          className={cn(
                            "text-base font-semibold",
                            active ? "text-brand-mid" : "text-text",
                          )}
                        >
                          {item.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>

                <Pressable
                  onPress={() => void handleSignOut()}
                  className="rounded-2xl border border-border px-4 py-3"
                >
                  <Text className="text-center text-base font-semibold text-error">
                    Log out
                  </Text>
                </Pressable>
              </View>
            </SafeAreaView>
          </Animated.View>

          <Animated.View style={{ flex: 1, opacity: overlayOpacity }}>
            <Pressable className="flex-1 bg-black/40" onPress={closeDrawer} />
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
