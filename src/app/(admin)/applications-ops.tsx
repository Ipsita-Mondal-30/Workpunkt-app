import { Alert, Linking, Pressable, Text, TextInput, View } from "react-native";
import { useState } from "react";
import * as WebBrowser from "expo-web-browser";

import { DetailSheet } from "@/components/shared/detail-sheet";
import {
  HorizontalDataTable,
  type DataColumn,
} from "@/components/shared/horizontal-data-table";
import { ResourceScreen } from "@/components/shared/resource-screen";
import { StatsRow } from "@/components/shared/stats-row";
import { queryKeys } from "@/lib/query/keys";
import { useApiMutation } from "@/lib/query/use-api";

const STATUS_OPTIONS = [
  "Submitted",
  "In Review",
  "Admission Offered",
  "Admission Granted",
  "Accepted",
  "Rejected",
  "Withdrawn",
  "Insufficient Documents",
  "To be applied",
];

type ActiveApplication = {
  id: string;
  studentRecordId: string;
  student: string;
  university: string;
  track: string;
  stage: string;
  source: string;
  status: string;
  lastUpdate: string;
  hasOfferLetter: boolean;
};

type OverdueDoc = {
  id: string;
  student: string;
  missing: string;
  deadline: string;
  assignedTo: string;
  phone: string | null;
  email: string | null;
};

type AppOpsData = {
  stats: Array<{
    id: string;
    value: string;
    label: string;
    color?: "purple" | "pink" | "blue" | "green";
  }>;
  overdueDocuments: OverdueDoc[];
  activeApplications: ActiveApplication[];
};

function escapeCsv(value: string) {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export default function AdminApplicationsOpsScreen() {
  const [selected, setSelected] = useState<ActiveApplication | null>(null);
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [filter, setFilter] = useState("");

  const updateStatus = useApiMutation<
    {
      applicationRecordId: string;
      status: string;
      pendingDocumentsNotes?: string;
    },
    { ok: boolean; error?: string }
  >("/api/admin/applications-ops/status", [queryKeys.adminApplicationsOps()]);

  const columns: DataColumn<ActiveApplication>[] = [
    {
      key: "student",
      title: "Student",
      width: 150,
      render: (row) => (
        <Text className="text-sm font-semibold text-text" numberOfLines={2}>
          {row.student}
        </Text>
      ),
    },
    {
      key: "university",
      title: "University",
      width: 160,
      render: (row) => (
        <Text className="text-sm text-text" numberOfLines={2}>
          {row.university}
        </Text>
      ),
    },
    {
      key: "track",
      title: "Track",
      width: 90,
      render: (row) => <Text className="text-sm text-muted">{row.track}</Text>,
    },
    {
      key: "status",
      title: "Status",
      width: 140,
      render: (row) => (
        <Text className="text-sm font-semibold text-brand-mid" numberOfLines={2}>
          {row.status}
        </Text>
      ),
    },
    {
      key: "source",
      title: "Source",
      width: 120,
      render: (row) => <Text className="text-sm text-muted">{row.source}</Text>,
    },
    {
      key: "updated",
      title: "Updated",
      width: 100,
      render: (row) => <Text className="text-sm text-muted">{row.lastUpdate}</Text>,
    },
  ];

  return (
    <>
      <ResourceScreen<AppOpsData>
        title="Applications Ops"
        subtitle="Active applications, status updates, and overdue docs"
        queryKey={queryKeys.adminApplicationsOps()}
        path="/api/admin/applications-ops"
      >
        {(data) => {
          const q = filter.trim().toLowerCase();
          const filtered = !q
            ? data.activeApplications
            : data.activeApplications.filter(
                (row) =>
                  row.student.toLowerCase().includes(q) ||
                  row.university.toLowerCase().includes(q) ||
                  row.status.toLowerCase().includes(q),
              );

          return (
            <>
              <StatsRow
                stats={data.stats.map((s) => ({
                  ...s,
                  color: (s.color as "pink" | "blue" | "green" | "purple") ?? "pink",
                }))}
              />

              {data.overdueDocuments.length > 0 ? (
                <View className="mb-4 gap-2">
                  <Text className="text-sm font-semibold text-text">Overdue documents</Text>
                  {data.overdueDocuments.slice(0, 5).map((doc) => (
                    <View
                      key={doc.id}
                      className="rounded-2xl border border-border bg-surface px-3 py-3"
                    >
                      <Text className="text-sm font-semibold text-text">{doc.student}</Text>
                      <Text className="mt-1 text-xs text-muted">{doc.missing}</Text>
                      <View className="mt-2 flex-row gap-3">
                        {doc.phone ? (
                          <Pressable
                            onPress={() =>
                              void Linking.openURL(
                                `https://wa.me/${doc.phone!.replace(/\D/g, "")}`,
                              )
                            }
                          >
                            <Text className="text-xs font-semibold text-brand-mid">
                              WhatsApp
                            </Text>
                          </Pressable>
                        ) : null}
                        {doc.email ? (
                          <Pressable
                            onPress={() => void Linking.openURL(`mailto:${doc.email}`)}
                          >
                            <Text className="text-xs font-semibold text-brand-mid">
                              Email
                            </Text>
                          </Pressable>
                        ) : null}
                      </View>
                    </View>
                  ))}
                </View>
              ) : null}

              <TextInput
                value={filter}
                onChangeText={setFilter}
                placeholder="Filter by student, university, status…"
                placeholderTextColor="#71717a"
                className="mb-3 rounded-xl border border-border bg-surface px-3 py-3 text-sm text-text"
              />

              <Pressable
                className="mb-3 self-start rounded-xl border border-border bg-surface px-3 py-2"
                onPress={() => {
                  const header = [
                    "Student",
                    "University",
                    "Track",
                    "Status",
                    "Source",
                    "Updated",
                  ];
                  const lines = [
                    header.join(","),
                    ...filtered.map((row) =>
                      [
                        row.student,
                        row.university,
                        row.track,
                        row.status,
                        row.source,
                        row.lastUpdate,
                      ]
                        .map(escapeCsv)
                        .join(","),
                    ),
                  ];
                  const csv = lines.join("\n");
                  void WebBrowser.openBrowserAsync(
                    `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`,
                  );
                }}
              >
                <Text className="text-xs font-semibold text-text">Export CSV</Text>
              </Pressable>

              <HorizontalDataTable
                columns={columns}
                rows={filtered}
                keyExtractor={(row) => row.id}
                onRowPress={(row) => {
                  setSelected(row);
                  setStatus(row.status);
                  setNotes("");
                }}
                emptyLabel="No applications."
              />
            </>
          );
        }}
      </ResourceScreen>

      <DetailSheet
        visible={Boolean(selected)}
        title={selected?.student ?? "Application"}
        onClose={() => setSelected(null)}
      >
        {selected ? (
          <View className="gap-3">
            <Text className="text-sm text-muted">{selected.university}</Text>
            <Text className="text-sm text-text">Current: {selected.status}</Text>
            <Text className="text-xs font-semibold uppercase text-muted">New status</Text>
            <View className="flex-row flex-wrap gap-2">
              {STATUS_OPTIONS.map((option) => (
                <Pressable
                  key={option}
                  onPress={() => setStatus(option)}
                  className={`rounded-lg border px-2 py-1 ${
                    status === option
                      ? "border-brand-mid bg-brand-mid/15"
                      : "border-border bg-surface"
                  }`}
                >
                  <Text className="text-xs text-text">{option}</Text>
                </Pressable>
              ))}
            </View>
            {status === "Insufficient Documents" ? (
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Pending documents…"
                placeholderTextColor="#71717a"
                multiline
                className="min-h-[80px] rounded-xl border border-border bg-surface px-3 py-3 text-sm text-text"
              />
            ) : null}
            <Pressable
              className="rounded-xl bg-brand-mid px-4 py-3"
              disabled={updateStatus.isPending}
              onPress={() =>
                updateStatus.mutate(
                  {
                    applicationRecordId: selected.id,
                    status,
                    pendingDocumentsNotes: notes || undefined,
                  },
                  {
                    onSuccess: () => {
                      setSelected(null);
                      Alert.alert("Saved", "Application status updated.");
                    },
                    onError: (error) => Alert.alert("Error", error.message),
                  },
                )
              }
            >
              <Text className="text-center text-sm font-semibold text-white">
                {updateStatus.isPending ? "Saving…" : "Update status"}
              </Text>
            </Pressable>
          </View>
        ) : null}
      </DetailSheet>
    </>
  );
}
