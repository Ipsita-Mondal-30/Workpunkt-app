import { Alert, Pressable, Text, View } from "react-native";
import { useState } from "react";

import { DetailSheet } from "@/components/shared/detail-sheet";
import {
  HorizontalDataTable,
  type DataColumn,
} from "@/components/shared/horizontal-data-table";
import { ResourceScreen } from "@/components/shared/resource-screen";
import { StatsRow } from "@/components/shared/stats-row";
import { queryKeys } from "@/lib/query/keys";
import { useApiMutation } from "@/lib/query/use-api";

type PipelineStudent = {
  id: string;
  name: string;
  email: string;
  track: "Private" | "Public" | "Ausbildung";
  stage: string;
  agentSource: string;
  lastModifiedLabel: string;
  overdue?: boolean;
  showRemind?: boolean;
  showApplicationAction?: boolean;
  hasApplication?: boolean;
};

type PipelineData = {
  students: PipelineStudent[];
  stats: Array<{
    id: string;
    value: string;
    label: string;
    sub: string;
    color: "purple" | "pink" | "blue" | "green";
  }>;
};

const STAGE_LABELS: Record<string, string> = {
  uni_matching: "Uni Matching",
  placed: "Placed",
  app_submitted: "App Submitted",
  docs_missing: "Docs Missing",
  interview_prep: "Interview Prep",
  visa_stage: "Visa Stage",
};

export default function AdminPipelineScreen() {
  const [selected, setSelected] = useState<PipelineStudent | null>(null);
  const promote = useApiMutation<
    { studentRecordId: string },
    { ok: boolean; error?: string }
  >("/api/admin/student-pipeline/promote-application", [
    queryKeys.adminStudentPipeline(),
    queryKeys.adminApplicationsOps(),
  ]);
  const remind = useApiMutation<
    {
      studentRecordId: string;
      studentEmail: string;
      studentName: string;
      track: PipelineStudent["track"];
    },
    { ok: boolean; error?: string }
  >("/api/admin/student-pipeline/remind", [queryKeys.adminStudentPipeline()]);

  const columns: DataColumn<PipelineStudent>[] = [
    {
      key: "name",
      title: "Student",
      width: 160,
      render: (row) => (
        <Text className="text-sm font-semibold text-text" numberOfLines={2}>
          {row.name}
        </Text>
      ),
    },
    {
      key: "email",
      title: "Email",
      width: 200,
      render: (row) => (
        <Text className="text-sm text-muted" numberOfLines={2}>
          {row.email}
        </Text>
      ),
    },
    {
      key: "track",
      title: "Track",
      width: 100,
      render: (row) => <Text className="text-sm text-text">{row.track}</Text>,
    },
    {
      key: "stage",
      title: "Stage",
      width: 130,
      render: (row) => (
        <Text className="text-sm font-semibold text-brand-mid">
          {STAGE_LABELS[row.stage] ?? row.stage}
        </Text>
      ),
    },
    {
      key: "source",
      title: "Source",
      width: 140,
      render: (row) => <Text className="text-sm text-muted">{row.agentSource}</Text>,
    },
    {
      key: "updated",
      title: "Updated",
      width: 110,
      render: (row) => (
        <Text className="text-sm text-muted">{row.lastModifiedLabel}</Text>
      ),
    },
  ];

  return (
    <>
      <ResourceScreen<PipelineData>
        title="Student Pipeline"
        subtitle="All students from Airtable · Live sync"
        queryKey={queryKeys.adminStudentPipeline()}
        path="/api/admin/student-pipeline"
      >
        {(data) => (
          <>
            <StatsRow stats={data.stats} />
            <HorizontalDataTable
              columns={columns}
              rows={data.students}
              keyExtractor={(row) => row.id}
              onRowPress={setSelected}
              emptyLabel="No pipeline students."
            />
          </>
        )}
      </ResourceScreen>

      <DetailSheet
        visible={Boolean(selected)}
        title={selected?.name ?? "Student"}
        onClose={() => setSelected(null)}
      >
        {selected ? (
          <View className="gap-3">
            <Text className="text-sm text-muted">{selected.email}</Text>
            <Text className="text-sm text-text">Track: {selected.track}</Text>
            <Text className="text-sm text-text">
              Stage: {STAGE_LABELS[selected.stage] ?? selected.stage}
            </Text>
            <Text className="text-sm text-text">Source: {selected.agentSource}</Text>
            {selected.overdue ? (
              <Text className="text-sm font-semibold text-error">Overdue documents</Text>
            ) : null}

            {selected.showApplicationAction && !selected.hasApplication ? (
              <Pressable
                className="rounded-xl bg-brand-mid px-4 py-3"
                disabled={promote.isPending}
                onPress={() =>
                  promote.mutate(
                    { studentRecordId: selected.id },
                    {
                      onSuccess: () => {
                        setSelected(null);
                        Alert.alert("Done", "Student promoted to Applications.");
                      },
                      onError: (error) => Alert.alert("Error", error.message),
                    },
                  )
                }
              >
                <Text className="text-center text-sm font-semibold text-white">
                  {promote.isPending ? "Promoting…" : "Promote to Application"}
                </Text>
              </Pressable>
            ) : null}

            {selected.showRemind ? (
              <Pressable
                className="rounded-xl border border-border bg-surface px-4 py-3"
                disabled={remind.isPending}
                onPress={() =>
                  remind.mutate(
                    {
                      studentRecordId: selected.id,
                      studentEmail: selected.email,
                      studentName: selected.name,
                      track: selected.track,
                    },
                    {
                      onSuccess: () => Alert.alert("Sent", "Document reminder sent."),
                      onError: (error) => Alert.alert("Error", error.message),
                    },
                  )
                }
              >
                <Text className="text-center text-sm font-semibold text-text">
                  {remind.isPending ? "Sending…" : "Send document reminder"}
                </Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </DetailSheet>
    </>
  );
}
