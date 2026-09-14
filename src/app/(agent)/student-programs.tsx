import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { ResourceScreen } from "@/components/shared/resource-screen";
import { queryKeys } from "@/lib/query/keys";

type AgentStudentProgramRow = {
  airtableStudentId: string;
  profileId: string | null;
  name: string;
  email: string;
  status: "matched" | "waiting" | "not_generated";
  programs: Array<{
    index: number;
    programName: string;
    universityName: string;
  }>;
};

type AgentStudentProgramsData = {
  rows: AgentStudentProgramRow[];
};

export default function AgentStudentProgramsScreen() {
  const router = useRouter();

  return (
    <ResourceScreen<AgentStudentProgramsData>
      title="Student Programs"
      subtitle="Matched programs for your students"
      queryKey={queryKeys.agentStudentPrograms()}
      path="/api/agent/student-programs"
    >
      {(data) => (
        <View className="gap-2">
          {data.rows.length === 0 ? (
            <View className="rounded-2xl border border-border bg-surface px-4 py-6">
              <Text className="text-sm text-muted">No student programs yet.</Text>
            </View>
          ) : (
            data.rows.map((row) => (
              <Pressable
                key={row.airtableStudentId}
                onPress={() => router.push({
                  pathname: "/(agent)/student-detail" as never,
                  params: {
                    studentKey: row.airtableStudentId,
                    studentEmail: row.email,
                    studentProfileId: row.profileId ?? "",
                    studentName: row.name,
                  },
                })}
                className="rounded-2xl border border-border bg-surface px-4 py-4"
              >
                <Text className="text-base font-semibold text-text">{row.name}</Text>
                {row.email ? (
                  <Text className="mt-1 text-sm text-muted">{row.email}</Text>
                ) : null}
                <Text className="mt-2 text-xs font-semibold uppercase text-brand-mid">
                  {row.status.replace(/_/g, " ")}
                </Text>
                {row.programs.length > 0 ? (
                  <View className="mt-3 gap-2">
                    {row.programs.map((program) => (
                      <View
                        key={`${row.airtableStudentId}-${program.index}`}
                        className="rounded-xl border border-border bg-surface-end px-3 py-2"
                      >
                        <Text className="text-sm font-medium text-text">
                          {program.programName}
                        </Text>
                        <Text className="mt-0.5 text-xs text-muted">
                          {program.universityName}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text className="mt-2 text-xs text-muted">No programs listed yet.</Text>
                )}
                <Text className="mt-3 text-xs font-semibold text-brand-mid">Open student workspace →</Text>
              </Pressable>
            ))
          )}
        </View>
      )}
    </ResourceScreen>
  );
}
