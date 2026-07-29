import { Text, View } from "react-native";

import { ApiListScreen } from "@/components/shared/api-list-screen";

type PipelineStudent = {
  id: string;
  name?: string;
  email?: string;
  stage?: string;
  journeyPhase?: string;
  status?: string;
};

export default function AdminPipelineScreen() {
  return (
    <ApiListScreen<PipelineStudent>
      path="/api/admin/student-pipeline"
      title="Student Pipeline"
      subtitle="All students · live sync"
      emptyLabel="No students in the pipeline."
      extract={(json) => {
        const payload = json as { data?: { students?: PipelineStudent[] } };
        return payload.data?.students ?? [];
      }}
      renderItem={(item) => (
        <View className="rounded-2xl border border-border bg-surface px-4 py-4">
          <Text className="text-base font-semibold text-text">
            {item.name || item.email || item.id}
          </Text>
          {item.email ? (
            <Text className="mt-1 text-sm text-muted">{item.email}</Text>
          ) : null}
          <Text className="mt-2 text-xs font-semibold uppercase text-brand-mid">
            {item.stage || item.journeyPhase || item.status || "pipeline"}
          </Text>
        </View>
      )}
    />
  );
}
