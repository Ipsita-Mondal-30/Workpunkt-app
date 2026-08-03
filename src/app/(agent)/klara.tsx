import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";

import { KlaraMatchingScreen } from "@/components/klara/klara-matching-screen";
import { useApiQuery } from "@/lib/query/use-api";
import { queryKeys } from "@/lib/query/keys";

type AgentStudentsBundle = {
  info?: {
    cards?: Array<{
      name: string;
      email: string;
      profileId: string | null;
    }>;
  };
  students?: {
    students?: Array<{
      name: string;
      detail?: { email?: string | null };
    }>;
  };
};

export default function AgentKlaraScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    studentEmail?: string;
    studentProfileId?: string;
    studentName?: string;
  }>();

  const studentsQuery = useApiQuery<AgentStudentsBundle>(
    queryKeys.agentStudents(),
    "/api/agent/students",
    { staleTime: 1000 * 60 * 5 },
  );

  const studentOptions = useMemo(() => {
    const cards = studentsQuery.data?.info?.cards;
    if (cards?.length) {
      return cards.map((card) => ({
        name: card.name,
        email: card.email,
        profileId: card.profileId,
      }));
    }
    return (studentsQuery.data?.students?.students ?? []).map((student) => ({
      name: student.name,
      email: student.detail?.email ?? "",
      profileId: null,
    }));
  }, [studentsQuery.data]);

  return (
    <KlaraMatchingScreen
      requireStudentTarget
      studentEmail={params.studentEmail}
      studentProfileId={params.studentProfileId}
      studentName={params.studentName}
      studentOptions={studentOptions}
      onClearStudent={() => router.replace("/(agent)/klara")}
      onPickStudent={(student) =>
        router.setParams({
          studentEmail: student.email,
          studentProfileId: student.profileId ?? "",
          studentName: student.name,
        })
      }
    />
  );
}
