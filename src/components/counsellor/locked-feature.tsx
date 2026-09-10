import type { ReactNode } from "react";
import { Text, View } from "react-native";

import { GradientButton } from "@/components/shared/gradient-button";
import type { CheckoutProductType } from "@/lib/api/counsellor-types";
import {
  careerPathingPriceLabel,
  counsellorAccessPriceLabel,
  careerPathingTopupLabel,
} from "@/lib/stripe/mobile-checkout";

type LockedFeatureProps = {
  title: string;
  description: string;
  productType?: CheckoutProductType;
  priceLabel?: string;
  onUpgrade?: () => void;
  loading?: boolean;
  children?: ReactNode;
};

export function LockedFeature({
  title,
  description,
  productType,
  priceLabel,
  onUpgrade,
  loading = false,
  children,
}: LockedFeatureProps) {
  const resolvedPrice =
    priceLabel ??
    (productType === "school_counsellor_access"
      ? counsellorAccessPriceLabel()
      : productType === "school"
        ? careerPathingPriceLabel()
        : productType === "school_topup"
          ? careerPathingTopupLabel()
          : null);

  return (
    <View className="flex-1 items-center justify-center bg-bg px-6 py-10">
      <View className="w-full max-w-md rounded-3xl border border-brand-mid/25 bg-surface px-6 py-8">
        <Text className="text-xs font-bold uppercase tracking-wider text-brand-mid">
          Upgrade required
        </Text>
        <Text className="mt-3 text-2xl font-bold text-text">{title}</Text>
        <Text className="mt-3 text-base leading-6 text-muted">{description}</Text>
        {resolvedPrice ? (
          <Text className="mt-4 text-lg font-semibold text-text">{resolvedPrice}</Text>
        ) : null}
        {onUpgrade ? (
          <View className="mt-6">
            <GradientButton
              text={loading ? "Processing…" : "Continue to payment"}
              loading={loading}
              onPress={onUpgrade}
            />
          </View>
        ) : null}
        {children}
      </View>
    </View>
  );
}
