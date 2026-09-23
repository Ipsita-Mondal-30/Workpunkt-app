import { Pressable, Text, View } from "react-native";
import { useState } from "react";
import { appAlert } from "@/lib/ui/app-alert";

import { DetailSheet } from "@/components/shared/detail-sheet";
import {
  HorizontalDataTable,
  type DataColumn,
} from "@/components/shared/horizontal-data-table";
import { ResourceScreen } from "@/components/shared/resource-screen";
import { StatsRow } from "@/components/shared/stats-row";
import { queryKeys } from "@/lib/query/keys";
import { useApiMutation } from "@/lib/query/use-api";

type AgentApplication = {
  id: string;
  name: string;
  email: string;
  organisation: string;
  applicationStatus: string;
  partnerType: string;
  cityCountry: string;
};

type B2BAgent = {
  id: string;
  name: string;
  email: string;
  organisation: string;
  level: string;
  students: number;
  trainingStatus: string;
  showRemind?: boolean;
};

type SchoolCounsellor = {
  id: string;
  name: string;
  email: string;
  school: string;
  students: number;
  status: string;
  payStatus: "Paid" | "Unpaid" | null;
  reviewStatus: "pending" | "approved" | "declined";
};

type AgentsPartnersData = {
  stats: Array<{
    id: string;
    value: string;
    label: string;
    color?: "purple" | "pink" | "blue" | "green";
  }>;
  trainingAlert: { title: string; body: string; count: number } | null;
  websiteApplications: AgentApplication[];
  b2bAgents: B2BAgent[];
  schoolCounsellors: SchoolCounsellor[];
};

type Selected =
  | { kind: "application"; row: AgentApplication }
  | { kind: "agent"; row: B2BAgent }
  | { kind: "counsellor"; row: SchoolCounsellor };

export default function AdminAgentsPartnersScreen() {
  const [selected, setSelected] = useState<Selected | null>(null);

  const approve = useApiMutation<
    { airtableRecordId: string; kind?: "agent" | "counsellor" },
    { ok: boolean; error?: string }
  >("/api/admin/agents-partners/approve", [
    queryKeys.adminAgentsPartners(),
    queryKeys.adminCommandCentre(),
  ]);
  const decline = useApiMutation<
    { airtableRecordId: string; kind?: "agent" | "counsellor" },
    { ok: boolean; error?: string }
  >("/api/admin/agents-partners/decline", [
    queryKeys.adminAgentsPartners(),
    queryKeys.adminCommandCentre(),
  ]);
  const resend = useApiMutation<
    { airtableRecordId: string; kind?: "agent" | "counsellor" },
    { ok: boolean; error?: string }
  >("/api/admin/agents-partners/resend", [queryKeys.adminAgentsPartners()]);
  const remind = useApiMutation<
    { all?: boolean; email?: string; name?: string; airtablePartnerId?: string },
    { ok: boolean; error?: string }
  >("/api/admin/agents-partners/remind", [queryKeys.adminAgentsPartners()]);
  const payStatus = useApiMutation<
    { counsellorRecordId: string; payStatus: "Paid" | "Unpaid" },
    { ok: boolean; error?: string }
  >("/api/admin/agents-partners/pay-status", [
    queryKeys.adminAgentsPartners(),
    queryKeys.adminCommandCentre(),
  ]);
  const startChat = useApiMutation<
    { agentName: string; agentEmail: string },
    { ok: boolean; threadId?: string; error?: string }
  >("/api/admin/agents-partners/start-chat", [
    queryKeys.supportInboxAdmin(),
    queryKeys.adminCommandCentre(),
  ]);

  const appColumns: DataColumn<AgentApplication>[] = [
    {
      key: "name",
      title: "Name",
      width: 150,
      render: (row) => (
        <Text className="text-sm font-semibold text-text" numberOfLines={2}>
          {row.name}
        </Text>
      ),
    },
    {
      key: "email",
      title: "Email",
      width: 180,
      render: (row) => (
        <Text className="text-sm text-muted" numberOfLines={2}>
          {row.email}
        </Text>
      ),
    },
    {
      key: "org",
      title: "Organisation",
      width: 150,
      render: (row) => (
        <Text className="text-sm text-text" numberOfLines={2}>
          {row.organisation}
        </Text>
      ),
    },
    {
      key: "status",
      title: "Status",
      width: 140,
      render: (row) => (
        <Text className="text-sm font-semibold text-brand-mid">{row.applicationStatus}</Text>
      ),
    },
  ];

  const agentColumns: DataColumn<B2BAgent>[] = [
    {
      key: "name",
      title: "Agent",
      width: 150,
      render: (row) => (
        <Text className="text-sm font-semibold text-text">{row.name}</Text>
      ),
    },
    {
      key: "level",
      title: "Level",
      width: 90,
      render: (row) => <Text className="text-sm text-text">{row.level}</Text>,
    },
    {
      key: "students",
      title: "Students",
      width: 90,
      render: (row) => <Text className="text-sm text-text">{row.students}</Text>,
    },
    {
      key: "training",
      title: "Training",
      width: 120,
      render: (row) => (
        <Text className="text-sm text-muted">{row.trainingStatus}</Text>
      ),
    },
  ];

  const counsellorColumns: DataColumn<SchoolCounsellor>[] = [
    {
      key: "name",
      title: "Counsellor",
      width: 150,
      render: (row) => (
        <Text className="text-sm font-semibold text-text">{row.name}</Text>
      ),
    },
    {
      key: "school",
      title: "School",
      width: 160,
      render: (row) => <Text className="text-sm text-text">{row.school}</Text>,
    },
    {
      key: "pay",
      title: "Pay",
      width: 90,
      render: (row) => (
        <Text className="text-sm font-semibold text-brand-mid">
          {row.payStatus ?? "—"}
        </Text>
      ),
    },
    {
      key: "review",
      title: "Review",
      width: 100,
      render: (row) => <Text className="text-sm text-muted">{row.reviewStatus}</Text>,
    },
  ];

  return (
    <>
      <ResourceScreen<AgentsPartnersData>
        title="Agents & Partners"
        subtitle="Applications, B2B agents, and school counsellors"
        queryKey={queryKeys.adminAgentsPartners()}
        path="/api/admin/agents-partners"
      >
        {(data) => (
          <>
            <StatsRow
              stats={data.stats.map((s) => ({
                ...s,
                color: "purple",
              }))}
            />

            {data.trainingAlert ? (
              <Pressable
                className="mb-4 rounded-2xl border border-border bg-surface px-4 py-3"
                onPress={() =>
                  remind.mutate(
                    { all: true },
                    {
                      onSuccess: () => appAlert("Sent", "Training reminders sent."),
                      onError: (error) => appAlert("Error", error.message),
                    },
                  )
                }
              >
                <Text className="text-sm font-semibold text-text">
                  {data.trainingAlert.title}
                </Text>
                <Text className="mt-1 text-xs text-muted">{data.trainingAlert.body}</Text>
                <Text className="mt-2 text-xs font-semibold text-brand-mid">
                  Remind all ({data.trainingAlert.count})
                </Text>
              </Pressable>
            ) : null}

            <Text className="mb-2 text-sm font-semibold text-text">Website applications</Text>
            <HorizontalDataTable
              columns={appColumns}
              rows={data.websiteApplications}
              keyExtractor={(row) => row.id}
              onRowPress={(row) => setSelected({ kind: "application", row })}
              emptyLabel="No pending applications."
            />

            <Text className="mb-2 mt-5 text-sm font-semibold text-text">B2B agents</Text>
            <HorizontalDataTable
              columns={agentColumns}
              rows={data.b2bAgents}
              keyExtractor={(row) => row.id}
              onRowPress={(row) => setSelected({ kind: "agent", row })}
              emptyLabel="No agents."
            />

            <Text className="mb-2 mt-5 text-sm font-semibold text-text">
              School counsellor applications
            </Text>
            <HorizontalDataTable
              columns={counsellorColumns}
              rows={data.schoolCounsellors.filter((row) => row.reviewStatus === "pending")}
              keyExtractor={(row) => row.id}
              onRowPress={(row) => setSelected({ kind: "counsellor", row })}
              emptyLabel="No pending school counsellor applications."
            />

            <Text className="mb-2 mt-5 text-sm font-semibold text-text">
              Approved school counsellors
            </Text>
            <HorizontalDataTable
              columns={counsellorColumns}
              rows={data.schoolCounsellors.filter((row) => row.reviewStatus !== "pending")}
              keyExtractor={(row) => row.id}
              onRowPress={(row) => setSelected({ kind: "counsellor", row })}
              emptyLabel="No approved school counsellors."
            />
          </>
        )}
      </ResourceScreen>

      <DetailSheet
        visible={Boolean(selected)}
        title={
          selected?.kind === "application"
            ? selected.row.name
            : selected?.kind === "agent"
              ? selected.row.name
              : selected?.row.name ?? "Partner"
        }
        onClose={() => setSelected(null)}
      >
        {selected?.kind === "application" ? (
          <View className="gap-3">
            <Text className="text-sm text-muted">{selected.row.email}</Text>
            <Text className="text-sm text-text">{selected.row.organisation}</Text>
            <Text className="text-sm text-text">{selected.row.applicationStatus}</Text>
            <Pressable
              className="rounded-xl bg-brand-mid px-4 py-3"
              onPress={() =>
                approve.mutate(
                  { airtableRecordId: selected.row.id, kind: "agent" },
                  {
                    onSuccess: () => {
                      setSelected(null);
                      appAlert("Approved", "Agent approved.");
                    },
                    onError: (error) => appAlert("Error", error.message),
                  },
                )
              }
            >
              <Text className="text-center text-sm font-semibold text-white">Approve</Text>
            </Pressable>
            <Pressable
              className="rounded-xl border border-border bg-surface px-4 py-3"
              onPress={() =>
                decline.mutate(
                  { airtableRecordId: selected.row.id, kind: "agent" },
                  {
                    onSuccess: () => {
                      setSelected(null);
                      appAlert("Declined", "Application declined.");
                    },
                    onError: (error) => appAlert("Error", error.message),
                  },
                )
              }
            >
              <Text className="text-center text-sm font-semibold text-text">Decline</Text>
            </Pressable>
            <Pressable
              className="rounded-xl border border-border bg-surface px-4 py-3"
              onPress={() =>
                resend.mutate(
                  { airtableRecordId: selected.row.id, kind: "agent" },
                  {
                    onSuccess: () => appAlert("Sent", "Invite resent."),
                    onError: (error) => appAlert("Error", error.message),
                  },
                )
              }
            >
              <Text className="text-center text-sm font-semibold text-text">Resend invite</Text>
            </Pressable>
          </View>
        ) : null}

        {selected?.kind === "agent" ? (
          <View className="gap-3">
            <Text className="text-sm text-muted">{selected.row.email}</Text>
            <Text className="text-sm text-text">
              {selected.row.organisation} · {selected.row.level}
            </Text>
            {selected.row.showRemind ? (
              <Pressable
                className="rounded-xl bg-brand-mid px-4 py-3"
                onPress={() =>
                  remind.mutate(
                    {
                      email: selected.row.email,
                      name: selected.row.name,
                      airtablePartnerId: selected.row.id,
                    },
                    {
                      onSuccess: () => appAlert("Sent", "Training reminder sent."),
                      onError: (error) => appAlert("Error", error.message),
                    },
                  )
                }
              >
                <Text className="text-center text-sm font-semibold text-white">
                  Send training reminder
                </Text>
              </Pressable>
            ) : null}
            <Pressable
              className="rounded-xl border border-border bg-surface px-4 py-3"
              onPress={() =>
                startChat.mutate(
                  { agentName: selected.row.name, agentEmail: selected.row.email },
                  {
                    onSuccess: () => appAlert("Started", "Help chat thread opened."),
                    onError: (error) => appAlert("Error", error.message),
                  },
                )
              }
            >
              <Text className="text-center text-sm font-semibold text-text">
                Start help chat
              </Text>
            </Pressable>
          </View>
        ) : null}

        {selected?.kind === "counsellor" ? (
          <View className="gap-3">
            <Text className="text-sm text-muted">{selected.row.email}</Text>
            <Text className="text-sm text-text">{selected.row.school}</Text>
            <Text className="text-sm text-text">Review: {selected.row.reviewStatus}</Text>
            {selected.row.reviewStatus === "pending" ? (
              <>
                <Pressable
                  className="rounded-xl bg-brand-mid px-4 py-3"
                  onPress={() =>
                    approve.mutate(
                      { airtableRecordId: selected.row.id, kind: "counsellor" },
                      {
                        onSuccess: () => {
                          setSelected(null);
                          appAlert("Approved", "Counsellor approved.");
                        },
                        onError: (error) => appAlert("Error", error.message),
                      },
                    )
                  }
                >
                  <Text className="text-center text-sm font-semibold text-white">Approve</Text>
                </Pressable>
                <Pressable
                  className="rounded-xl border border-border bg-surface px-4 py-3"
                  onPress={() =>
                    decline.mutate(
                      { airtableRecordId: selected.row.id, kind: "counsellor" },
                      {
                        onSuccess: () => setSelected(null),
                        onError: (error) => appAlert("Error", error.message),
                      },
                    )
                  }
                >
                  <Text className="text-center text-sm font-semibold text-text">Decline</Text>
                </Pressable>
              </>
            ) : null}
            <Pressable
              className="rounded-xl border border-border bg-surface px-4 py-3"
              onPress={() =>
                payStatus.mutate(
                  {
                    counsellorRecordId: selected.row.id,
                    payStatus: selected.row.payStatus === "Paid" ? "Unpaid" : "Paid",
                  },
                  {
                    onSuccess: () => appAlert("Updated", "Pay status updated."),
                    onError: (error) => appAlert("Error", error.message),
                  },
                )
              }
            >
              <Text className="text-center text-sm font-semibold text-text">
                Toggle pay → {selected.row.payStatus === "Paid" ? "Unpaid" : "Paid"}
              </Text>
            </Pressable>
          </View>
        ) : null}
      </DetailSheet>
    </>
  );
}
