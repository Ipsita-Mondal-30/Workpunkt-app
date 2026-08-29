import { Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { SignupShell } from "@/components/auth/signup-shell";
import { GradientButton } from "@/components/shared/gradient-button";
import { partnerSubmittedCopy } from "@/lib/signup/copy";
import { cn } from "@/lib/utils";

export default function AgentSubmittedScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string; ref?: string; emailSent?: string }>();
  const copy = partnerSubmittedCopy;
  const email = params.email?.trim() ?? "";
  const reference = params.ref?.trim() ?? "";
  const emailSent = params.emailSent !== "0";

  const steps = copy.steps.map((step) => {
    if (step.id === "email") {
      if (!emailSent) {
        return {
          id: step.id,
          status: "pending" as const,
          stepNumber: 2,
          title: `Confirmation email to ${email || "your inbox"}`,
          timing: "Sending shortly",
        };
      }
      return {
        id: step.id,
        status: "complete" as const,
        title: `${step.titlePrefix}${email}${step.titleSuffix}`,
        timing: step.timing,
      };
    }

    if (!emailSent && "stepNumber" in step) {
      return {
        id: step.id,
        status: step.status,
        stepNumber: (step.stepNumber ?? 2) + 1,
        title: step.title,
        timing: "timing" in step ? step.timing : undefined,
      };
    }

    return {
      id: step.id,
      status: step.status,
      stepNumber: "stepNumber" in step ? step.stepNumber : undefined,
      title: step.title,
      timing: "timing" in step ? step.timing : undefined,
    };
  });

  return (
    <SignupShell title={copy.title} subtitle={copy.subtitle} backHref="/(auth)/login">
      <View className="mb-6 items-center">
        <Text className="text-4xl">📬</Text>
      </View>

      {reference ? (
        <View className="mb-6 rounded-2xl border border-border bg-surface px-4 py-4">
          <Text className="text-sm text-muted">Application reference</Text>
          <Text className="mt-1 text-base font-semibold text-text">{reference}</Text>
        </View>
      ) : null}

      <Text className="mb-3 text-base font-semibold text-text">{copy.nextTitle}</Text>
      <View className="mb-6 gap-3">
        {steps.map((step) => (
          <View key={step.id} className="flex-row items-start gap-3">
            <View
              className={cn(
                "h-8 w-8 items-center justify-center rounded-full",
                step.status === "complete" ? "bg-brand-mid" : "bg-surface-end",
              )}
            >
              <Text
                className={cn(
                  "text-xs font-bold",
                  step.status === "complete" ? "text-white" : "text-muted",
                )}
              >
                {step.status === "complete" ? "✓" : step.stepNumber}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-text">{step.title}</Text>
              {step.timing ? <Text className="mt-0.5 text-xs text-muted">{step.timing}</Text> : null}
            </View>
          </View>
        ))}
      </View>

      <View className="mb-6 rounded-2xl border border-border bg-surface px-4 py-4">
        <Text className="text-base font-semibold text-text">{copy.emailCardTitle}</Text>
        <Text className="mt-2 text-sm leading-5 text-muted">
          {emailSent ? (
            <>
              {copy.emailCardBodyPrefix}
              <Text className="font-semibold text-text">{email}</Text>
              {copy.emailCardBodySuffix}
            </>
          ) : (
            <>
              We're sending your confirmation to{" "}
              <Text className="font-semibold text-text">{email}</Text>. If you don't receive it
              within a few minutes, contact partners@workpunkt.com.
            </>
          )}
        </Text>
      </View>

      <GradientButton text={copy.signInLink} onPress={() => router.replace("/(auth)/login")} />
    </SignupShell>
  );
}
