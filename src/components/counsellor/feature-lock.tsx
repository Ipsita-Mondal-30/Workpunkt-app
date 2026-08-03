import type { ReactNode } from "react";
import { ActivityIndicator, Text, View } from "react-native";

import { GradientButton } from "@/components/shared/gradient-button";
import { useCheckout } from "@/lib/counsellor/use-checkout";
import { useCounsellorAccess } from "@/lib/counsellor/use-counsellor-access";

type FeatureLockProps = {
  title?: string;
  description?: string;
  children?: ReactNode;
};

export function FeatureLock({
  title = "Counsellor access required",
  description = "Unlock partner basics — student lists, programs, and the resource library — with a one-time Counselor Access payment.",
  children,
}: FeatureLockProps) {
  const { loading, accessPaid } = useCounsellorAccess();
  const checkout = useCheckout("school_counsellor_access");

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-bg py-16">
        <ActivityIndicator color="#f6339a" />
      </View>
    );
  }

  if (accessPaid) {
    return children;
  }

  return (
    <View className="rounded-2xl border border-brand-mid/30 bg-brand-mid/10 px-4 py-6">
      <Text className="text-lg font-bold text-text">{title}</Text>
      <Text className="mt-2 text-sm text-muted">{description}</Text>
      <View className="mt-4">
        <GradientButton
          text="Unlock Counsellor Access"
          loading={checkout.isPending}
          onPress={() => checkout.mutate()}
        />
      </View>
    </View>
  );
}

export function FeatureLockScreen({
  screenTitle,
  screenSubtitle,
  ...props
}: FeatureLockProps & { screenTitle: string; screenSubtitle?: string }) {
  return (
    <View className="flex-1 bg-bg px-4 py-4">
      <Text className="text-2xl font-bold text-text">{screenTitle}</Text>
      {screenSubtitle ? (
        <Text className="mt-1 text-sm text-muted">{screenSubtitle}</Text>
      ) : null}
      <View className="mt-4">
        <FeatureLock {...props} />
      </View>
    </View>
  );
}
