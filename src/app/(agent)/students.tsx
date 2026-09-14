import { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";

import { ResourceScreen } from "@/components/shared/resource-screen";
import { agentStudentsFromBundle, type AgentStudentListItem, type AgentStudentsBundle } from "@/lib/agent/students";
import { queryKeys } from "@/lib/query/keys";

function filterStudents(items: AgentStudentListItem[], query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return items;

  return items.filter(
    (item) =>
      item.name.toLowerCase().includes(normalized) ||
      item.email.toLowerCase().includes(normalized) ||
      item.status.toLowerCase().includes(normalized) ||
      item.matchStatus.toLowerCase().includes(normalized),
  );
}

function AgentStudentsList({ data }: { data: AgentStudentsBundle }) {
  const router = useRouter();
  const [filter, setFilter] = useState("");

  const items = useMemo(() => agentStudentsFromBundle(data), [data]);
  const filtered = useMemo(() => filterStudents(items, filter), [items, filter]);

  return (
    <>
      <TextInput
        value={filter}
        onChangeText={setFilter}
        placeholder="Filter by name, email, or status…"
        placeholderTextColor="#71717a"
        className="mb-4 rounded-xl border border-border bg-surface px-3 py-3 text-sm text-text"
      />

      <Text className="mb-3 text-xs text-muted">
        {filtered.length} of {items.length} students
      </Text>

      {filtered.length === 0 ? (
        <View className="rounded-2xl border border-border bg-surface px-4 py-6">
          <Text className="text-sm text-muted">No students match your filter.</Text>
        </View>
      ) : (
        <View className="gap-2">
          {filtered.map((item) => (
            <Pressable
              key={item.key}
              onPress={() =>
                router.push({
                  pathname: "/(agent)/student-detail" as never,
                  params: {
                    studentKey: item.key,
                    studentEmail: item.email,
                    studentProfileId: item.profileId ?? "",
                    studentName: item.name,
                  },
                })
              }
              className="rounded-2xl border border-border bg-surface px-4 py-4"
            >
              <Text className="text-base font-semibold text-text">{item.name}</Text>
              {item.email ? (
                <Text className="mt-1 text-sm text-muted">{item.email}</Text>
              ) : null}
              <View className="mt-2 flex-row flex-wrap gap-2">
                <Text className="text-xs font-semibold uppercase text-brand-mid">
                  {item.status}
                </Text>
                <Text className="text-xs text-muted">Match: {item.matchStatus}</Text>
              </View>
              <Text className="mt-2 text-xs font-semibold text-brand-mid">Open student workspace →</Text>
            </Pressable>
          ))}
        </View>
      )}
    </>
  );
}

export default function AgentStudentsScreen() {
  const router = useRouter();

  return (
    <ResourceScreen<AgentStudentsBundle>
      title="My Students"
      subtitle="Students linked to your partner account"
      queryKey={queryKeys.agentStudents()}
      path="/api/agent/students"
      headerRight={
        <Pressable onPress={() => router.push("/(agent)/add-student" as never)} className="rounded-xl bg-brand-mid px-3 py-2">
          <Text className="text-xs font-bold text-white">+ Add student</Text>
        </Pressable>
      }
    >
      {(data) => <AgentStudentsList data={data} />}
    </ResourceScreen>
  );
}
