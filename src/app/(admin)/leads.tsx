import { Text, View } from "react-native";

import { ApiListScreen } from "@/components/shared/api-list-screen";

type LeadRow = {
  id: string;
  name: string;
  email: string;
  status?: string;
  source?: string;
  role?: string;
};

export default function AdminLeadsScreen() {
  return (
    <ApiListScreen<LeadRow>
      path="/api/admin/users-leads"
      title="Users / Leads"
      subtitle="Logins, form submissions, and Airtable leads"
      emptyLabel="No leads found."
      extract={(json) => {
        const payload = json as { data?: { users?: LeadRow[] } };
        return payload.data?.users ?? [];
      }}
      renderItem={(item) => (
        <View className="rounded-2xl border border-border bg-surface px-4 py-4">
          <Text className="text-base font-semibold text-text">{item.name}</Text>
          <Text className="mt-1 text-sm text-muted">{item.email}</Text>
          <Text className="mt-2 text-xs font-semibold uppercase text-brand-mid">
            {item.status || item.source || item.role || "lead"}
          </Text>
        </View>
      )}
    />
  );
}
