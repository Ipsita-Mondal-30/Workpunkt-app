import { Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";

import { CounsellorScroll, ListRow } from "@/components/counsellor/counsellor-scroll";
import { CounsellorScreenShell } from "@/components/counsellor/counsellor-screen-shell";
import { authFetch } from "@/lib/api/auth-fetch";
import type { AgentNotification } from "@/lib/api/counsellor-types";
import { useCounsellorContext } from "@/lib/counsellor/use-counsellor-context";

export default function NotificationsScreen() {
  const { refreshing, refresh } = useCounsellorContext();

  const notificationsQuery = useQuery({
    queryKey: ["counsellor", "notifications"],
    queryFn: async () => {
      const response = await authFetch("/api/agent/notifications");
      const json = (await response.json()) as {
        data?: AgentNotification[];
        error?: string;
      };
      if (!response.ok) {
        throw new Error(json.error ?? "Could not load notifications.");
      }
      return json.data ?? [];
    },
  });

  async function markRead(id: string) {
    await authFetch("/api/agent/notifications", {
      method: "PATCH",
      body: JSON.stringify({ id }),
    });
    await notificationsQuery.refetch();
  }

  return (
    <CounsellorScreenShell title="Notifications">
      <CounsellorScroll
        loading={notificationsQuery.isLoading}
        refreshing={refreshing}
        onRefresh={() => void refresh()}
        error={
          notificationsQuery.error instanceof Error
            ? notificationsQuery.error.message
            : null
        }
      >
        {(notificationsQuery.data ?? []).length === 0 ? (
          <Text className="text-sm text-muted">No notifications yet.</Text>
        ) : (
          (notificationsQuery.data ?? []).map((item) => (
            <ListRow
              key={item.id}
              title={item.title}
              subtitle={item.body ?? item.message ?? item.createdAt ?? item.created_at}
              badge={item.isRead || item.read ? undefined : "Unread"}
              onPress={() => void markRead(item.id)}
            />
          ))
        )}
      </CounsellorScroll>
    </CounsellorScreenShell>
  );
}
