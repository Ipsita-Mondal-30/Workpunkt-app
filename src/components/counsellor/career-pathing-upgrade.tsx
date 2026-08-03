import type { ReactNode } from "react";
import { ActivityIndicator, Text, View } from "react-native";

import { GradientButton } from "@/components/shared/gradient-button";
import { useCheckout } from "@/lib/counsellor/use-checkout";

type CareerPathingUpgradeProps = {
  error?: string | null;
  showTopup?: boolean;
};

export function CareerPathingUpgrade({
  error,
  showTopup = false,
}: CareerPathingUpgradeProps) {
  const schoolCheckout = useCheckout("school");
  const topupCheckout = useCheckout("school_topup");

  return (
    <View className="rounded-2xl border border-brand-start/30 bg-brand-start/10 px-4 py-6">
      <Text className="text-lg font-bold text-text">Career Pathing plan required</Text>
      <Text className="mt-2 text-sm text-muted">
        Unlock Grade 10–12 Germany career roadmaps, eligibility checks, and your yearly
        student quota for your school.
      </Text>
      {error ? <Text className="mt-2 text-sm text-error">{error}</Text> : null}
      <View className="mt-4 gap-3">
        <GradientButton
          text="Get Career Pathing"
          loading={schoolCheckout.isPending}
          onPress={() => schoolCheckout.mutate()}
        />
        {showTopup ? (
          <GradientButton
            text="Add +10 students"
            loading={topupCheckout.isPending}
            onPress={() => topupCheckout.mutate()}
          />
        ) : null}
      </View>
    </View>
  );
}

export function CareerPathingGate({
  planActive,
  loading,
  error,
  showTopup,
  children,
}: {
  planActive: boolean;
  loading?: boolean;
  error?: string | null;
  showTopup?: boolean;
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
    return <CareerPathingUpgrade error={error} showTopup={showTopup} />;
  }

  return children;
}
