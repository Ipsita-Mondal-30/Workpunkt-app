import { Text, View } from "react-native";

import { ApiListScreen } from "@/components/shared/api-list-screen";

type AgentStudent = {
  id: string;
  name: string;
  level?: string;
  stage?: string;
  detail?: { email?: string | null };
};

export default function AgentStudentsScreen() {
  return (
    <ApiListScreen<AgentStudent>
      path="/api/agent/students"
      title="My Students"
      subtitle="Students linked to your partner account"
      emptyLabel="No students linked yet."
      extract={(json) => {
        const payload = json as {
          data?: {
            students?: { students?: AgentStudent[] };
          };
        };
        return payload.data?.students?.students ?? [];
      }}
      renderItem={(item) => (
        <View className="rounded-2xl border border-border bg-surface px-4 py-4">
          <Text className="text-base font-semibold text-text">{item.name}</Text>
          {item.detail?.email ? (
            <Text className="mt-1 text-sm text-muted">{item.detail.email}</Text>
          ) : null}
          <Text className="mt-2 text-xs font-semibold uppercase text-brand-mid">
            {item.stage || item.level || "active"}
          </Text>
        </View>
      )}
    />
  );
}
