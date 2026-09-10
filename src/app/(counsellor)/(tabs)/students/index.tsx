import { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";

import {
  CounsellorScroll,
  ListRow,
  SectionCard,
} from "@/components/counsellor/counsellor-scroll";
import { CounsellorScreenShell } from "@/components/counsellor/counsellor-screen-shell";
import { CareerPathingUpgrade } from "@/components/counsellor/career-pathing-upgrade";
import { LockedFeature } from "@/components/counsellor/locked-feature";
import { GradientButton } from "@/components/shared/gradient-button";
import { authFetch } from "@/lib/api/auth-fetch";
import type {
  AgentStudentRow,
  CareerPathingPortalStudent,
} from "@/lib/api/counsellor-types";
import { useCounsellorContext } from "@/lib/counsellor/use-counsellor-context";
import { startMobileCheckout } from "@/lib/stripe/mobile-checkout";

type StudentsBundle = {
  students?: {
    students?: AgentStudentRow[];
  };
  careerPathingQuota?: {
    quotaUsed: number;
    studentCap: number;
    remaining: number;
  };
};

export default function StudentsListScreen() {
  const router = useRouter();
  const {
    counsellorAccessPaid,
    careerPathingActive,
    careerPathing,
    refreshing,
    refresh,
  } = useCounsellorContext();
  const [search, setSearch] = useState("");
  const [track, setTrack] = useState<"cp" | "enrolled">("cp");
  const [topupLoading, setTopupLoading] = useState(false);

  const enrolledQuery = useQuery({
    queryKey: ["counsellor", "students", "enrolled"],
    queryFn: async () => {
      const response = await authFetch("/api/agent/students");
      const json = (await response.json()) as { data?: StudentsBundle; error?: string };
      if (!response.ok) {
        throw new Error(json.error ?? "Could not load students.");
      }
      return json.data?.students?.students ?? [];
    },
    enabled: counsellorAccessPaid,
  });

  const cpStudents = careerPathing?.students ?? [];
  const quota = careerPathing?.quota ?? enrolledQuery.data;

  const filteredCp = useMemo(() => {
    const q = search.trim().toLowerCase();
    return cpStudents.filter((student) => {
      if (student.eligibility === "overflow") return false;
      if (!q) return true;
      return (
        student.name.toLowerCase().includes(q) ||
        student.gradeLabel.toLowerCase().includes(q) ||
        student.stream.toLowerCase().includes(q)
      );
    });
  }, [cpStudents, search]);

  const filteredEnrolled = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = enrolledQuery.data ?? [];
    if (!q) return list;
    return list.filter((student) => {
      const name = student.name?.toLowerCase() ?? "";
      const email = student.email?.toLowerCase() ?? "";
      return name.includes(q) || email.includes(q);
    });
  }, [enrolledQuery.data, search]);

  if (!counsellorAccessPaid && !careerPathingActive) {
    return (
      <LockedFeature
        title="Students"
        description="Unlock Counselor Access or Career Pathing to manage students from the mobile app."
        productType="school_counsellor_access"
        onUpgrade={() =>
          void startMobileCheckout("school_counsellor_access").then(() => refresh())
        }
      />
    );
  }

  async function handleTopup() {
    setTopupLoading(true);
    await startMobileCheckout("school_topup");
    setTopupLoading(false);
    await refresh();
  }

  return (
    <CounsellorScreenShell title="Students" subtitle="Career Pathing and enrolled students">
      <CounsellorScroll
        refreshing={refreshing}
        onRefresh={() => void refresh()}
        error={enrolledQuery.error instanceof Error ? enrolledQuery.error.message : null}
      >
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search students"
          placeholderTextColor="#94a3b8"
          className="mb-4 rounded-2xl border border-border bg-surface px-4 py-3 text-base text-text"
        />

        <View className="mb-4 flex-row gap-2">
          <Pressable
            onPress={() => setTrack("cp")}
            className={`flex-1 rounded-2xl px-3 py-3 ${
              track === "cp" ? "bg-brand-mid/15" : "bg-surface border border-border"
            }`}
          >
            <Text
              className={`text-center text-sm font-semibold ${
                track === "cp" ? "text-brand-mid" : "text-text"
              }`}
            >
              Career Pathing
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setTrack("enrolled")}
            className={`flex-1 rounded-2xl px-3 py-3 ${
              track === "enrolled" ? "bg-brand-mid/15" : "bg-surface border border-border"
            }`}
          >
            <Text
              className={`text-center text-sm font-semibold ${
                track === "enrolled" ? "text-brand-mid" : "text-text"
              }`}
            >
              Enrolled
            </Text>
          </Pressable>
        </View>

        {careerPathingActive && track === "cp" ? (
          <SectionCard
            title="Quota"
            subtitle={`${careerPathing?.quota.quotaUsed ?? 0} / ${careerPathing?.quota.studentCap ?? 20} seats used`}
          >
            {(careerPathing?.quota.remaining ?? 0) === 0 ? (
              <View className="mt-3">
                <GradientButton
                  text="Top up seats (€999)"
                  loading={topupLoading}
                  onPress={() => void handleTopup()}
                />
              </View>
            ) : null}
          </SectionCard>
        ) : null}

        {track === "cp" ? (
          careerPathingActive ? (
            <>
              <GradientButton
                text="Add CP student"
                className="mb-4"
                onPress={() => router.push("/(counsellor)/(tabs)/students/add")}
              />
              {filteredCp.length === 0 ? (
                <Text className="text-sm text-muted">No Career Pathing students yet.</Text>
              ) : (
                filteredCp.map((student: CareerPathingPortalStudent) => (
                  <ListRow
                    key={student.id}
                    title={student.name}
                    subtitle={`${student.gradeLabel} · ${student.stream}`}
                    badge={student.eligibilityLabel}
                    onPress={() =>
                      router.push({
                        pathname: "/(counsellor)/(tabs)/students/[id]",
                        params: { id: student.id, track: "cp" },
                      })
                    }
                  />
                ))
              )}
            </>
          ) : (
            <CareerPathingUpgrade onCompleted={() => void refresh()} />
          )
        ) : counsellorAccessPaid ? (
          <>
            <GradientButton
              text="Add enrolled student"
              className="mb-4"
              onPress={() =>
                router.push({
                  pathname: "/(counsellor)/(tabs)/students/add",
                  params: { track: "enrolled" },
                })
              }
            />
            {filteredEnrolled.length === 0 ? (
              <Text className="text-sm text-muted">No enrolled students yet.</Text>
            ) : (
              filteredEnrolled.map((student) => (
                <ListRow
                  key={student.id}
                  title={student.name ?? student.email ?? student.id}
                  subtitle={student.email}
                  badge={student.status}
                  onPress={() =>
                    router.push({
                      pathname: "/(counsellor)/(tabs)/students/[id]",
                      params: { id: student.id, track: "enrolled" },
                    })
                  }
                />
              ))
            )}
          </>
        ) : (
          <LockedFeature
            title="Enrolled students"
            description="Counselor Access is required for enrolled student applications."
            productType="school_counsellor_access"
            onUpgrade={() =>
              void startMobileCheckout("school_counsellor_access").then(() => refresh())
            }
          />
        )}
      </CounsellorScroll>
    </CounsellorScreenShell>
  );
}
