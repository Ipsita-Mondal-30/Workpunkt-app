import type { ReactNode } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { WorkpunktLogo } from "@/components/shared/workpunkt-logo";

type CounsellorScreenShellProps = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  headerRight?: ReactNode;
};

export function CounsellorScreenShell({
  title,
  subtitle,
  children,
  headerRight,
}: CounsellorScreenShellProps) {
  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["left", "right"]}>
      {title ? (
        <View className="border-b border-border px-4 py-4">
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-text">{title}</Text>
              {subtitle ? (
                <Text className="mt-1 text-sm text-muted">{subtitle}</Text>
              ) : null}
            </View>
            {headerRight}
          </View>
        </View>
      ) : null}
      <View className="flex-1">{children}</View>
    </SafeAreaView>
  );
}

export function PendingApprovalScreen() {
  return (
    <SafeAreaView className="flex-1 bg-bg px-6">
      <View className="flex-1 items-center justify-center">
        <WorkpunktLogo fontSize={32} />
        <Text className="mt-8 text-center text-2xl font-bold text-text">
          Pending approval
        </Text>
        <Text className="mt-4 text-center text-base leading-6 text-muted">
          Your school counsellor application is being reviewed. You will receive an
          activation email once approved.
        </Text>
        <Text className="mt-4 text-center text-sm text-muted">
          Need help? Message the Workpunkt team from the web portal or email support.
        </Text>
      </View>
    </SafeAreaView>
  );
}

export function PasswordSetupScreen() {
  return (
    <SafeAreaView className="flex-1 bg-bg px-6">
      <View className="flex-1 items-center justify-center">
        <WorkpunktLogo fontSize={32} />
        <Text className="mt-8 text-center text-2xl font-bold text-text">
          Activate your portal
        </Text>
        <Text className="mt-4 text-center text-base leading-6 text-muted">
          Open the activation link from your Workpunkt email to set your password,
          then sign in here again.
        </Text>
      </View>
    </SafeAreaView>
  );
}
