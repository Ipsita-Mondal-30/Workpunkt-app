import type { ReactNode } from "react";
import { useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

import { GradientButton } from "@/components/shared/gradient-button";
import {
  careerPathingPriceLabel,
  careerPathingTopupLabel,
  startMobileCheckout,
} from "@/lib/stripe/mobile-checkout";

type CareerPathingUpgradeProps = {
  error?: string | null;
  showTopup?: boolean;
  /** Soft card (website upsell) vs full-screen gate. */
  variant?: "card" | "gate";
  onCompleted?: () => void | Promise<void>;
};

export function CareerPathingUpgrade({
  error,
  showTopup = false,
  variant = "card",
  onCompleted,
}: CareerPathingUpgradeProps) {
  const [loading, setLoading] = useState<"school" | "school_topup" | null>(null);

  async function checkout(product: "school" | "school_topup") {
    setLoading(product);
    const result = await startMobileCheckout(product);
    setLoading(null);
    if (result.ok) {
      await onCompleted?.();
    }
  }

  return (
    <View
      className={
        variant === "card"
          ? "rounded-2xl border border-brand-mid/30 bg-brand-mid/10 px-4 py-5"
          : "rounded-2xl border border-brand-mid/30 bg-brand-mid/10 px-4 py-6"
      }
    >
      <Text className="text-[11px] font-bold uppercase tracking-wider text-brand-mid">
        Career Pathing
      </Text>
      <Text className="mt-2 text-lg font-bold text-text">
        {showTopup ? "Need more seats?" : "Career Pathing for Schools"}
      </Text>
      <Text className="mt-2 text-sm leading-5 text-muted">
        {showTopup
          ? `Add +10 student seats permanently for ${careerPathingTopupLabel()}.`
          : `Unlock Grade 10–12 Germany career roadmaps, eligibility checks, a ${careerPathingPriceLabel()} plan, and your yearly student quota.`}
      </Text>
      {error ? <Text className="mt-2 text-sm text-error">{error}</Text> : null}
      <View className="mt-4 gap-3">
        {!showTopup ? (
          <GradientButton
            text={`Get Career Pathing (${careerPathingPriceLabel()})`}
            loading={loading === "school"}
            onPress={() => void checkout("school")}
          />
        ) : null}
        {showTopup ? (
          <GradientButton
            text={`Add +10 students (${careerPathingTopupLabel()})`}
            loading={loading === "school_topup"}
            onPress={() => void checkout("school_topup")}
          />
        ) : null}
      </View>
    </View>
  );
}

/** Soft gate for CP-only screens — never used on the main dashboard. */
export function CareerPathingGate({
  planActive,
  loading,
  error,
  showTopup,
  onCompleted,
  children,
}: {
  planActive: boolean;
  loading?: boolean;
  error?: string | null;
  showTopup?: boolean;
  onCompleted?: () => void | Promise<void>;
  children: ReactNode;
}) {
  if (loading) {
    return (
      <View className="items-center py-12">
        <ActivityIndicator color="#f6339a" />
      </View>
    );
  }

  if (!planActive) {
    return (
      <CareerPathingUpgrade
        error={error}
        showTopup={showTopup}
        variant="gate"
        onCompleted={onCompleted}
      />
    );
  }

  return children;
}
