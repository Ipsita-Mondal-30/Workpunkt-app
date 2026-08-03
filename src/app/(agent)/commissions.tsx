import { Text, View } from "react-native";

import { ResourceScreen } from "@/components/shared/resource-screen";
import { StatsRow } from "@/components/shared/stats-row";
import { queryKeys } from "@/lib/query/keys";

type CommissionRecord = {
  id: string;
  studentName: string;
  placementType: string;
  milestone: string;
  amountInr: number | null;
  amountEur: number | null;
  amountLabel?: "tbc";
  status: "paid" | "pending" | "not_due";
  date: string;
};

type AgentCommissionsData = {
  agentName: string | null;
  summary: {
    paidThisYearInr: number;
    pendingInr: number;
    totalEarnedInr: number;
  };
  records: CommissionRecord[];
};

function formatInr(value: number | null) {
  if (value == null) return "TBC";
  return `₹${value.toLocaleString("en-IN")}`;
}

export default function AgentCommissionsScreen() {
  return (
    <ResourceScreen<AgentCommissionsData>
      title="Commissions"
      subtitle="Earnings and payout status"
      queryKey={queryKeys.agentCommissions()}
      path="/api/agent/commissions"
    >
      {(data) => (
        <>
          <StatsRow
            stats={[
              {
                id: "paid-year",
                value: formatInr(data.summary.paidThisYearInr),
                label: "Paid this year",
                color: "green",
              },
              {
                id: "pending",
                value: formatInr(data.summary.pendingInr),
                label: "Pending",
                color: "pink",
              },
              {
                id: "total",
                value: formatInr(data.summary.totalEarnedInr),
                label: "Total earned",
                color: "purple",
              },
            ]}
          />

          <View className="gap-2">
            {data.records.length === 0 ? (
              <View className="rounded-2xl border border-border bg-surface px-4 py-6">
                <Text className="text-sm text-muted">No commission records yet.</Text>
              </View>
            ) : (
              data.records.map((record) => (
                <View
                  key={record.id}
                  className="rounded-2xl border border-border bg-surface px-4 py-4"
                >
                  <Text className="text-base font-semibold text-text">
                    {record.studentName}
                  </Text>
                  <Text className="mt-1 text-sm text-muted">
                    {record.placementType} · {record.milestone}
                  </Text>
                  <View className="mt-2 flex-row items-center justify-between gap-2">
                    <Text className="text-sm font-semibold text-text">
                      {record.amountLabel === "tbc"
                        ? "TBC"
                        : formatInr(record.amountInr)}
                    </Text>
                    <Text className="text-xs font-semibold uppercase text-brand-mid">
                      {record.status.replace(/_/g, " ")}
                    </Text>
                  </View>
                  <Text className="mt-1 text-xs text-muted">{record.date}</Text>
                </View>
              ))
            )}
          </View>
        </>
      )}
    </ResourceScreen>
  );
}
