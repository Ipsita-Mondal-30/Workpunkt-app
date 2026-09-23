import { Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { appAlert } from "@/lib/ui/app-alert";

import {
  CounsellorScroll,
  SectionCard,
} from "@/components/counsellor/counsellor-scroll";
import { CounsellorScreenShell } from "@/components/counsellor/counsellor-screen-shell";
import { LockedFeature } from "@/components/counsellor/locked-feature";
import { authFetch } from "@/lib/api/auth-fetch";
import { useCounsellorContext } from "@/lib/counsellor/use-counsellor-context";
import { startMobileCheckout } from "@/lib/stripe/mobile-checkout";

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

export default function CounsellorStudentProgramsScreen() {
  const { counsellorAccessPaid, refresh, refreshing } = useCounsellorContext();
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const query = useQuery({
    queryKey: ["counsellor", "student-programs"],
    enabled: counsellorAccessPaid,
    queryFn: async () => {
      const response = await authFetch("/api/agent/student-programs");
      const json = (await response.json()) as {
        data?: AgentStudentProgramsData;
        error?: string;
      };
      if (!response.ok) {
        throw new Error(json.error ?? "Could not load student programs.");
      }
      return json.data?.rows ?? [];
    },
  });

  if (!counsellorAccessPaid) {
    return (
      <CounsellorScreenShell
        title="Student Programs"
        subtitle="Matched programs for your students"
      >
        <LockedFeature
          title="Counselor Access required"
          description="Unlock Student Programs with Counselor Access."
          productType="school_counsellor_access"
          loading={checkoutLoading}
          onUpgrade={() => {
            void (async () => {
              setCheckoutLoading(true);
              const result = await startMobileCheckout("school_counsellor_access");
              setCheckoutLoading(false);
              if (result.ok) {
                await refresh();
                return;
              }
              appAlert(
                "Payment sync issue",
                result.error ||
                  "Stripe may have charged you, but access was not unlocked yet. Pull to refresh or try again.",
              );
              await refresh();
            })();
          }}
        />
      </CounsellorScreenShell>
    );
  }

  return (
    <CounsellorScreenShell
      title="Student Programs"
      subtitle="Matched programs for your students"
    >
      <CounsellorScroll
        loading={query.isLoading}
        refreshing={refreshing || query.isRefetching}
        onRefresh={() => {
          void refresh();
          void query.refetch();
        }}
        error={query.error instanceof Error ? query.error.message : null}
      >
        {(query.data?.length ?? 0) === 0 ? (
          <SectionCard
            title="No programs yet"
            subtitle="Matched programs will appear here once students have recommendations."
          />
        ) : (
          <View className="gap-3">
            {query.data?.map((row) => (
              <View
                key={row.airtableStudentId}
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
              </View>
            ))}
          </View>
        )}
      </CounsellorScroll>
    </CounsellorScreenShell>
  );
}
