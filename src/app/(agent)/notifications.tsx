import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { ResourceScreen } from "@/components/shared/resource-screen";
import type { AgentNotification } from "@/lib/agent/notifications";
import { authFetch } from "@/lib/api/auth-fetch";
import { queryKeys } from "@/lib/query/keys";
import { dateLabel } from "@/lib/student/presentation";
import { appAlert } from "@/lib/ui/app-alert";

function nativeAgentPath(actionHref?: string) {
  if (!actionHref) return null;
  const path = actionHref.replace(/^\/de(?=\/)/, "").split("?")[0];
  const routes: Record<string, string> = {
    "/agent/dashboard": "/(agent)",
    "/agent/students": "/(agent)/students",
    "/agent/student-programs": "/(agent)/student-programs",
    "/agent/commissions": "/(agent)/commissions",
    "/agent/payments": "/(agent)/payments",
    "/agent/training": "/(agent)/training",
    "/agent/resources": "/(agent)/resources",
    "/agent/webinars": "/(agent)/webinars",
    "/agent/ask-klara": "/(agent)/klara",
    "/agent/message": "/(agent)/message-team",
  };
  return routes[path] ?? null;
}

export default function AgentNotificationsScreen() {
  const router = useRouter();
  const [updating, setUpdating] = useState(false);

  async function updateNotifications(payload: { notificationId?: string; markAll?: boolean }, refetch: () => void) {
    setUpdating(true);
    try {
      const response = await authFetch("/api/agent/notifications", {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`Request failed (${response.status})`);
      await refetch();
    } catch (error) {
      appAlert("Could not update notifications", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setUpdating(false);
    }
  }

  return (
    <ResourceScreen<AgentNotification[]>
      title="Notifications"
      subtitle="Student, commission, training and partner updates"
      queryKey={queryKeys.agentNotifications()}
      path="/api/agent/notifications"
      staleTime={20_000}
    >
      {(items, { refetch }) => {
        const unread = items.filter((item) => !item.isRead).length;
        return (
          <View>
            {unread > 0 ? (
              <Pressable disabled={updating} onPress={() => void updateNotifications({ markAll: true }, refetch)} className="mb-4 self-end rounded-xl bg-brand-mid/10 px-4 py-2">
                <Text className="text-xs font-bold text-brand-mid">{updating ? "Updating…" : `Mark all read (${unread})`}</Text>
              </Pressable>
            ) : null}

            {items.length === 0 ? (
              <View className="rounded-2xl border border-border bg-surface px-4 py-6">
                <Text className="text-sm text-muted">No notifications yet.</Text>
              </View>
            ) : (
              <View className="gap-2">
                {items.map((item) => {
                  const target = nativeAgentPath(item.actionHref);
                  return (
                    <Pressable
                      key={item.id}
                      disabled={updating}
                      onPress={async () => {
                        if (!item.isRead) await updateNotifications({ notificationId: item.id }, refetch);
                        if (target) router.push(target as never);
                      }}
                      className={item.isRead ? "rounded-2xl border border-border bg-surface px-4 py-4" : "rounded-2xl border border-brand-mid/25 bg-brand-mid/10 px-4 py-4"}
                    >
                      <View className="flex-row items-start gap-3">
                        <View className={item.isRead ? "mt-1 h-2 w-2 rounded-full bg-border" : "mt-1 h-2 w-2 rounded-full bg-brand-mid"} />
                        <View className="flex-1">
                          <Text className="text-sm font-bold text-text">{item.title}</Text>
                          {item.message || item.body ? <Text className="mt-1 text-sm leading-5 text-muted">{item.message ?? item.body}</Text> : null}
                          {item.createdAt ? <Text className="mt-2 text-[11px] text-muted">{dateLabel(item.createdAt)}</Text> : null}
                          {target ? <Text className="mt-2 text-xs font-bold text-brand-mid">Open →</Text> : null}
                        </View>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>
        );
      }}
    </ResourceScreen>
  );
}
