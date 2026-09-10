import { useState } from "react";
import { Text, View } from "react-native";

import { CareerPathingUpgrade } from "@/components/counsellor/career-pathing-upgrade";
import {
  CounsellorScroll,
  SectionCard,
  StatPill,
} from "@/components/counsellor/counsellor-scroll";
import { CounsellorScreenShell } from "@/components/counsellor/counsellor-screen-shell";
import { GradientButton } from "@/components/shared/gradient-button";
import { useCounsellorContext } from "@/lib/counsellor/use-counsellor-context";
import {
  counsellorAccessPriceLabel,
  startMobileCheckout,
} from "@/lib/stripe/mobile-checkout";

function formatMoney(cents: number, currency: string) {
  const amount = cents / 100;
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount);
}

export default function PaymentsScreen() {
  const {
    loading,
    refreshing,
    refresh,
    entitlements,
    context,
    counsellorAccessPaid,
    careerPathingActive,
  } = useCounsellorContext();
  const [checkoutLoading, setCheckoutLoading] = useState<
    "school_counsellor_access" | "school" | "school_topup" | null
  >(null);

  const schoolPlan = entitlements?.schoolPlan ?? context?.schoolPlan;
  const history = entitlements?.schoolPurchaseHistory ?? [];
  const quota = context?.careerPathingQuota;
  const remaining = quota?.remaining ?? null;

  async function checkout(
    product: "school_counsellor_access" | "school" | "school_topup",
  ) {
    setCheckoutLoading(product);
    const result = await startMobileCheckout(product);
    setCheckoutLoading(null);
    if (result.ok) await refresh();
  }

  return (
    <CounsellorScreenShell title="Payments" subtitle="Plans and purchase history">
      <CounsellorScroll
        loading={loading}
        refreshing={refreshing}
        onRefresh={() => void refresh()}
      >
        <View className="mb-4 flex-row gap-3">
          <View className="flex-1">
            <StatPill
              label="Counselor Access"
              value={counsellorAccessPaid ? "Active" : "Not paid"}
            />
          </View>
          <View className="flex-1">
            <StatPill
              label="Career Pathing"
              value={careerPathingActive || schoolPlan?.active ? "Active" : "Inactive"}
            />
          </View>
        </View>

        {!counsellorAccessPaid ? (
          <SectionCard
            accent
            title="Unlock Counselor Access"
            subtitle={`One-time ${counsellorAccessPriceLabel()} for Students, Programs, and Resource Hub.`}
          >
            <View className="mt-4">
              <GradientButton
                text={`Pay Counselor Access (${counsellorAccessPriceLabel()})`}
                loading={checkoutLoading === "school_counsellor_access"}
                onPress={() => void checkout("school_counsellor_access")}
              />
            </View>
          </SectionCard>
        ) : (
          <SectionCard
            title="Counselor Access"
            subtitle="Unlocked — portal basics and application tools are available."
          />
        )}

        {careerPathingActive || schoolPlan?.active ? (
          <SectionCard
            title="Career Pathing plan"
            subtitle={`Cap ${schoolPlan?.studentCap ?? quota?.studentCap ?? 20} students${
              remaining != null ? ` · Remaining ${remaining}` : ""
            } · Valid until ${schoolPlan?.validUntil ?? "—"}`}
          >
            {remaining != null && remaining <= 0 ? (
              <View className="mt-4">
                <CareerPathingUpgrade
                  showTopup
                  onCompleted={() => void refresh()}
                />
              </View>
            ) : null}
          </SectionCard>
        ) : (
          <View className="mb-4">
            <CareerPathingUpgrade onCompleted={() => void refresh()} />
          </View>
        )}

        <SectionCard title="Purchase history">
          {history.length === 0 ? (
            <Text className="mt-2 text-sm text-muted">No purchases yet.</Text>
          ) : (
            history.map((item) => (
              <View
                key={item.id}
                className="mb-3 rounded-2xl border border-border bg-bg px-4 py-3"
              >
                <Text className="font-semibold text-text">{item.productType}</Text>
                <Text className="mt-1 text-sm text-muted">
                  {formatMoney(item.amountCents, item.currency)} · {item.status}
                </Text>
                <Text className="mt-1 text-xs text-muted">{item.createdAt}</Text>
              </View>
            ))
          )}
        </SectionCard>
      </CounsellorScroll>
    </CounsellorScreenShell>
  );
}
