import { Alert, Text, View } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { GradientButton } from "@/components/shared/gradient-button";
import { ResourceScreen } from "@/components/shared/resource-screen";
import { StatsRow } from "@/components/shared/stats-row";
import { authFetch } from "@/lib/api/auth-fetch";
import { queryKeys } from "@/lib/query/keys";

type EntitlementsMeSummary = {
  agentPlan: {
    label: "free_partner" | "starter" | "growth" | "agency_pro" | "none";
    tier: string | null;
    profileCap: number;
    availableProfileCredits: number;
    profilesUsed: number;
    totalPurchased: number;
  };
  agentPurchaseHistory: Array<{
    paymentId: string;
    label: string;
    purchasedAt: string;
    amountCents: number;
    currency: string;
    creditsGranted: number;
  }>;
};

const PLAN_LABELS: Record<EntitlementsMeSummary["agentPlan"]["label"], string> = {
  free_partner: "Free partner",
  starter: "Starter",
  growth: "Growth",
  agency_pro: "Agency Pro",
  none: "No plan",
};

export default function AgentPaymentsScreen() {
  const queryClient = useQueryClient();
  const checkout = useMutation({
    mutationFn: async () => {
      const response = await authFetch("/api/checkout/create-session", {
        method: "POST",
        body: JSON.stringify({ product_type: "agent_starter" }),
      });
      const json = (await response.json()) as {
        data?: { url?: string };
        error?: string;
      };

      if (!response.ok) {
        throw new Error(json.error ?? "Checkout failed");
      }

      const url = json.data?.url;
      if (!url) {
        throw new Error("No checkout URL returned");
      }

      return url;
    },
    onSuccess: async (url) => {
      await WebBrowser.openBrowserAsync(url);
      await queryClient.invalidateQueries({ queryKey: queryKeys.entitlementsMe() });
    },
    onError: (error) => {
      Alert.alert("Checkout error", error.message);
    },
  });

  return (
    <ResourceScreen<EntitlementsMeSummary>
      title="Payments"
      subtitle="Plan status and profile credits"
      queryKey={queryKeys.entitlementsMe()}
      path="/api/entitlements/me"
      staleTime={30_000}
    >
      {(data) => (
        <>
          <StatsRow
            stats={[
              {
                id: "plan",
                value: PLAN_LABELS[data.agentPlan.label],
                label: "Current plan",
                color: "purple",
              },
              {
                id: "credits",
                value: String(data.agentPlan.availableProfileCredits),
                label: "Profile credits",
                sub: `${data.agentPlan.profilesUsed} used · cap ${data.agentPlan.profileCap}`,
                color: "pink",
              },
            ]}
          />

          <View className="mb-4 rounded-2xl border border-border bg-surface px-4 py-4">
            <Text className="text-sm text-muted">
              Total purchased profiles: {data.agentPlan.totalPurchased}
            </Text>
          </View>

          <GradientButton
            text="Buy Starter pack"
            loading={checkout.isPending}
            onPress={() => checkout.mutate()}
          />

          {data.agentPurchaseHistory.length > 0 ? (
            <View className="mt-6 gap-2">
              <Text className="text-sm font-semibold text-text">Purchase history</Text>
              {data.agentPurchaseHistory.map((item) => (
                <View
                  key={item.paymentId}
                  className="rounded-2xl border border-border bg-surface px-4 py-3"
                >
                  <Text className="text-sm font-semibold text-text">{item.label}</Text>
                  <Text className="mt-1 text-xs text-muted">
                    {(item.amountCents / 100).toFixed(2)} {item.currency.toUpperCase()} ·{" "}
                    {item.creditsGranted} credits · {item.purchasedAt}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </>
      )}
    </ResourceScreen>
  );
}
