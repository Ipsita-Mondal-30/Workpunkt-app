import { Pressable, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { ResourceScreen } from "@/components/shared/resource-screen";
import { agentStudentsFromBundle, type AgentStudentsBundle } from "@/lib/agent/students";
import { queryKeys } from "@/lib/query/keys";

export default function AgentStudentDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    studentKey?: string;
    studentEmail?: string;
    studentProfileId?: string;
    studentName?: string;
  }>();

  return (
    <ResourceScreen<AgentStudentsBundle>
      title="Student Workspace"
      subtitle="Profile, application and Klara tools"
      queryKey={queryKeys.agentStudents()}
      path="/api/agent/students"
    >
      {(data) => {
        const students = agentStudentsFromBundle(data);
        const student = students.find((item) =>
          item.key === params.studentKey ||
          (params.studentProfileId && item.profileId === params.studentProfileId) ||
          (params.studentEmail && item.email.toLowerCase() === params.studentEmail.toLowerCase()),
        );

        if (!student) {
          return (
            <View className="rounded-2xl border border-border bg-surface px-4 py-6">
              <Text className="text-sm text-muted">This student is no longer linked to your account.</Text>
            </View>
          );
        }

        const details = [
          { label: "Email", value: student.email },
          { label: "Journey stage", value: student.status },
          { label: "Program matching", value: student.matchStatus },
          { label: "Application", value: student.applicationStatus },
          { label: "Intake", value: student.intake },
          { label: "University", value: student.universityName },
          { label: "Program", value: student.programName },
        ].filter((item) => item.value);

        return (
          <View className="gap-4">
            <View className="rounded-3xl border border-brand-mid/20 bg-brand-mid/10 px-5 py-5">
              <Text className="text-2xl font-bold text-text">{student.name}</Text>
              <Text className="mt-2 text-xs font-bold uppercase text-brand-mid">{student.status || "Linked student"}</Text>
            </View>

            <View className="rounded-2xl border border-border bg-surface px-4 py-2">
              {details.map((detail, index) => (
                <View key={detail.label} className={index === details.length - 1 ? "py-3" : "border-b border-border py-3"}>
                  <Text className="text-[11px] font-bold uppercase text-muted">{detail.label}</Text>
                  <Text className="mt-1 text-sm font-semibold text-text">{detail.value}</Text>
                </View>
              ))}
            </View>

            <Pressable
              onPress={() => router.push({ pathname: "/(agent)/klara", params: { studentEmail: student.email, studentProfileId: student.profileId ?? "", studentName: student.name } })}
              className="rounded-2xl bg-brand-mid px-4 py-4"
            >
              <Text className="text-center text-sm font-bold text-white">Ask Klara for this student</Text>
            </Pressable>
            <Pressable onPress={() => router.push("/(agent)/student-programs")} className="rounded-2xl border border-border bg-surface px-4 py-4">
              <Text className="text-center text-sm font-bold text-text">View student programs</Text>
            </Pressable>
            <Pressable onPress={() => router.push("/(agent)/message-team")} className="rounded-2xl border border-border bg-surface px-4 py-4">
              <Text className="text-center text-sm font-bold text-text">Ask the Workpunkt team</Text>
            </Pressable>
          </View>
        );
      }}
    </ResourceScreen>
  );
}
