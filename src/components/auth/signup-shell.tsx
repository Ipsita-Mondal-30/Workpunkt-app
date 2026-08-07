import type { ReactNode } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAvoidingView, Platform } from "react-native";

import { WorkpunktLogo } from "@/components/shared/workpunkt-logo";

type SignupShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  backHref?: string;
  onBack?: () => void;
};

export function SignupShell({
  title,
  subtitle,
  children,
  backHref,
  onBack,
}: SignupShellProps) {
  const router = useRouter();

  function handleBack() {
    if (onBack) {
      onBack();
      return;
    }
    if (backHref) {
      router.push(backHref as never);
      return;
    }
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/(auth)/login");
  }

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top", "bottom", "left", "right"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <View className="flex-row items-center justify-between px-4 py-3">
          <Pressable
            onPress={handleBack}
            className="rounded-xl bg-surface-end px-3 py-2"
            hitSlop={8}
          >
            <Text className="text-sm font-semibold text-text">Back</Text>
          </Pressable>
          <WorkpunktLogo fontSize={22} />
          <View className="w-16" />
        </View>

        <ScrollView
          contentContainerClassName="px-6 pb-10"
          keyboardShouldPersistTaps="handled"
        >
          <Text className="text-2xl font-bold text-text">{title}</Text>
          {subtitle ? (
            <Text className="mt-2 text-sm text-muted">{subtitle}</Text>
          ) : null}
          <View className="mt-6">{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
