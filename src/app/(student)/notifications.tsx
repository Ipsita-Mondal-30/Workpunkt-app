import { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";

import { ResourceScreen } from "@/components/shared/resource-screen";
import { authFetch } from "@/lib/api/auth-fetch";
import { queryKeys } from "@/lib/query/keys";
import { asRecords, dateLabel, textValue } from "@/lib/student/presentation";

export default function StudentNotificationsScreen() {
  const [markingRead, setMarkingRead] = useState<string | null>(null);

  return (
    <ResourceScreen<unknown>
      title="Notifications"
      subtitle="Application, document and counsellor updates"
      queryKey={queryKeys.studentNotifications()}
      path="/api/notifications"
      staleTime={20_000}
    >
      {(data, { refetch }) => {
        const items = asRecords(data);
        return items.length === 0 ? <View className="rounded-2xl border border-border bg-surface px-4 py-6"><Text className="text-sm text-muted">No notifications yet.</Text></View> : <View className="gap-2">{items.map((item, index) => {
          const read = item.isRead === true || item.read === true;
          return <Pressable key={textValue(item, "id") || String(index)} disabled={read || markingRead !== null} onPress={async () => {
            const id = textValue(item, "id");
            if (!id || read) return;
            setMarkingRead(id);
            try {
              const response = await authFetch("/api/notifications", { method: "PATCH", body: JSON.stringify({ id }) });
              if (!response.ok) throw new Error(`Request failed (${response.status})`);
              await refetch();
            } catch (error) {
              Alert.alert("Could not update notification", error instanceof Error ? error.message : "Please try again.");
            } finally {
              setMarkingRead(null);
            }
          }} className={read ? "rounded-2xl border border-border bg-surface px-4 py-4" : "rounded-2xl border border-brand-mid/25 bg-brand-mid/10 px-4 py-4"}>
            <View className="flex-row items-start gap-3"><View className={read ? "mt-1 h-2 w-2 rounded-full bg-border" : "mt-1 h-2 w-2 rounded-full bg-brand-mid"} /><View className="flex-1"><Text className="text-sm font-bold text-text">{textValue(item, "title") || "Workpunkt update"}</Text><Text className="mt-1 text-sm leading-5 text-muted">{textValue(item, "body", "message")}</Text><Text className="mt-2 text-[11px] text-muted">{dateLabel(textValue(item, "createdAt", "created_at"))}</Text></View></View>
          </Pressable>;
        })}</View>;
      }}
    </ResourceScreen>
  );
}
