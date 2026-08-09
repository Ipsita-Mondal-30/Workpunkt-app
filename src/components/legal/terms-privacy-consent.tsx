import { useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { GradientButton } from "@/components/shared/gradient-button";
import {
  TERMS_AND_CONDITIONS_PARAGRAPHS,
  TERMS_AND_CONDITIONS_TITLE,
  legalAppRoutes,
} from "@/lib/legal";
import { cn } from "@/lib/utils";

type TermsPrivacyConsentProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  error?: string | null;
  className?: string;
};

export function TermsPrivacyConsent({
  checked,
  onCheckedChange,
  error,
  className,
}: TermsPrivacyConsentProps) {
  const router = useRouter();
  const [termsOpen, setTermsOpen] = useState(false);

  return (
    <View className={cn("mb-4", className)}>
      <View className="flex-row items-start gap-3">
        <Pressable
          onPress={() => onCheckedChange(!checked)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked }}
          hitSlop={8}
          className={cn(
            "mt-0.5 h-5 w-5 items-center justify-center rounded border",
            checked ? "border-brand-mid bg-brand-mid" : "border-border bg-surface",
          )}
        >
          {checked ? <Text className="text-xs font-bold text-white">✓</Text> : null}
        </Pressable>

        <Text className="flex-1 text-sm leading-5 text-muted">
          I agree to the{" "}
          <Text
            className="font-semibold text-text underline"
            onPress={() => setTermsOpen(true)}
          >
            Terms and Conditions
          </Text>{" "}
          and the{" "}
          <Text
            className="font-semibold text-text underline"
            onPress={() => router.push(legalAppRoutes.privacyPolicy as never)}
          >
            Privacy Policy
          </Text>
          . I consent to Workpunkt processing my data as described there.
        </Text>
      </View>

      {error ? <Text className="mt-2 text-xs font-medium text-error">{error}</Text> : null}

      <Modal
        visible={termsOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setTermsOpen(false)}
      >
        <SafeAreaView className="flex-1 bg-bg" edges={["top", "bottom"]}>
          <View className="flex-row items-center justify-between border-b border-border px-4 py-4">
            <Text className="flex-1 text-lg font-semibold text-text">
              {TERMS_AND_CONDITIONS_TITLE}
            </Text>
            <Pressable
              onPress={() => setTermsOpen(false)}
              className="rounded-xl bg-surface-end px-3 py-2"
            >
              <Text className="text-sm font-semibold text-text">Close</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerClassName="px-5 py-4 pb-8">
            {TERMS_AND_CONDITIONS_PARAGRAPHS.map((paragraph) => (
              <Text key={paragraph.slice(0, 48)} className="mb-4 text-sm leading-6 text-muted">
                {paragraph}
              </Text>
            ))}
          </ScrollView>

          <View className="border-t border-border px-4 py-3">
            <GradientButton
              text="I agree"
              onPress={() => {
                onCheckedChange(true);
                setTermsOpen(false);
              }}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}
