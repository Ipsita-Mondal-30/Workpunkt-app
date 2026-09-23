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

type UsersLeadsRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  airtableLinked: boolean;
  airtableRecordId: string | null;
  createdAt: string;
  source: string;
  inStudentPipeline: boolean;
  leadDetail: { leadId: string; fullName: string; phone: string | null } | null;
};

type UsersLeadsData = {
  users: UsersLeadsRow[];
  stats: Array<{
    id: string;
    value: string;
    label: string;
    sub: string;
    color: "purple" | "pink" | "blue" | "green";
  }>;
};

export default function AdminLeadsScreen() {
  const [selected, setSelected] = useState<UsersLeadsRow | null>(null);
  const promote = useApiMutation<{ leadId: string }, { ok: boolean; error?: string }>(
    "/api/admin/users-leads/promote",
    [
      queryKeys.adminUsersLeads(),
      queryKeys.adminStudentPipeline(),
      queryKeys.adminCommandCentre(),
    ],
  );

  const columns: DataColumn<UsersLeadsRow>[] = [
    {
      key: "name",
      title: "Name",
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
      key: "role",
      title: "Role",
      width: 100,
      render: (row) => <Text className="text-sm text-text">{row.role}</Text>,
    },
    {
      key: "status",
      title: "Status",
      width: 110,
      render: (row) => (
        <Text className="text-sm font-semibold text-brand-mid">{row.status}</Text>
      ),
    },
    {
      key: "airtable",
      title: "Airtable",
      width: 90,
      render: (row) => (
        <Text className="text-sm text-text">{row.airtableLinked ? "Linked" : "—"}</Text>
      ),
    },
    {
      key: "source",
      title: "Source",
      width: 120,
      render: (row) => <Text className="text-sm text-muted">{row.source}</Text>,
    },
    {
      key: "created",
      title: "Created",
      width: 120,
      render: (row) => <Text className="text-sm text-muted">{row.createdAt}</Text>,
    },
  ];

  return (
    <>
      <ResourceScreen<UsersLeadsData>
        title="Users / Leads"
        subtitle="Website logins, form submissions, and Airtable leads"
        queryKey={queryKeys.adminUsersLeads()}
        path="/api/admin/users-leads"
      >
        {(data) => (
          <>
            <StatsRow stats={data.stats} />
            <HorizontalDataTable
              columns={columns}
              rows={data.users}
              keyExtractor={(row) => row.id}
              onRowPress={setSelected}
              emptyLabel="No leads found."
            />
          </>
        )}
      </ResourceScreen>

      <DetailSheet
        visible={Boolean(selected)}
        title={selected?.name ?? "Lead"}
        onClose={() => setSelected(null)}
      >
        {selected ? (
          <View className="gap-3">
            <Text className="text-sm text-muted">{selected.email}</Text>
            <Text className="text-sm text-text">Status: {selected.status}</Text>
            <Text className="text-sm text-text">Role: {selected.role}</Text>
            <Text className="text-sm text-text">Source: {selected.source}</Text>
            <Text className="text-sm text-text">
              Pipeline: {selected.inStudentPipeline ? "Yes" : "No"}
            </Text>
            {selected.leadDetail?.phone ? (
              <Text className="text-sm text-text">Phone: {selected.leadDetail.phone}</Text>
            ) : null}

            {selected.leadDetail?.leadId && !selected.inStudentPipeline ? (
              <Pressable
                className="mt-2 rounded-xl bg-brand-mid px-4 py-3"
                disabled={promote.isPending}
                onPress={() => {
                  Alert.alert("Promote lead", "Move this lead to Student Pipeline?", [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Promote",
                      onPress: () => {
                        promote.mutate(
                          { leadId: selected.leadDetail!.leadId },
                          {
                            onSuccess: () => {
                              setSelected(null);
                              Alert.alert("Done", "Lead promoted to Student Pipeline.");
                            },
                            onError: (error) => Alert.alert("Error", error.message),
                          },
                        );
                      },
                    },
                  ]);
                }}
              >
                <Text className="text-center text-sm font-semibold text-white">
                  {promote.isPending ? "Promoting…" : "Promote to Pipeline"}
                </Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </DetailSheet>
    </>
  );
}
