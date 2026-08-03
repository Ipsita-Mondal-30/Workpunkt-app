import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";

import { FeatureLockScreen } from "@/components/counsellor/feature-lock";
import { ResourceScreen } from "@/components/shared/resource-screen";
import { useCounsellorAccess } from "@/lib/counsellor/use-counsellor-access";
import { queryKeys } from "@/lib/query/keys";

type AgentStudentInfoCard = {
  airtableStudentId: string;
  profileId: string | null;
  name: string;
  email: string;
  status: string;
  programMatchStatus: "matched" | "waiting" | "not_generated";
};

type AgentStudent = {
  id: string;
  name: string;
  stage: string;
  detail?: { email?: string | null };
};

type AgentStudentsBundle = {
  students: {
    meta: { total: number };
    students: AgentStudent[];
  };
  info?: {
    cards?: AgentStudentInfoCard[];
  };
};

type StudentListItem = {
  key: string;
  name: string;
  email: string;
  status: string;
  matchStatus: string;
  profileId: string | null;
};

function bundleToListItems(data: AgentStudentsBundle): StudentListItem[] {
  const cards = data.info?.cards;
  if (cards && cards.length > 0) {
    return cards.map((card) => ({
      key: card.airtableStudentId || card.profileId || card.email,
      name: card.name,
      email: card.email,
      status: card.status,
      matchStatus: card.programMatchStatus.replace(/_/g, " "),
      profileId: card.profileId,
    }));
  }

  return data.students.students.map((student) => ({
    key: student.id,
    name: student.name,
    email: student.detail?.email ?? "",
    status: student.stage,
    matchStatus: "—",
    profileId: null,
  }));
}

function StudentsList({ data }: { data: AgentStudentsBundle }) {
  const router = useRouter();
  const [filter, setFilter] = useState("");

  const items = useMemo(() => bundleToListItems(data), [data]);
  const filtered = useMemo(() => {
    const normalized = filter.trim().toLowerCase();
    if (!normalized) return items;
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(normalized) ||
        item.email.toLowerCase().includes(normalized) ||
        item.status.toLowerCase().includes(normalized),
    );
  }, [filter, items]);

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
                  pathname: "/(counsellor)/klara",
                  params: {
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
              <Text className="mt-2 text-xs text-brand-mid">Open in Klara →</Text>
            </Pressable>
          ))}
        </View>
      )}
    </>
  );
}

export default function CounsellorStudentsScreen() {
  const { loading, accessPaid } = useCounsellorAccess();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-bg">
        <ActivityIndicator color="#f6339a" />
      </View>
    );
  }

  if (!accessPaid) {
    return (
      <FeatureLockScreen
        screenTitle="My Students"
        screenSubtitle="Students linked to your partner account"
      />
    );
  }

  return (
    <ResourceScreen<AgentStudentsBundle>
      title="My Students"
      subtitle="Students linked to your partner account"
      queryKey={queryKeys.agentStudents()}
      path="/api/agent/students"
    >
      {(data) => <StudentsList data={data} />}
    </ResourceScreen>
  );
}
