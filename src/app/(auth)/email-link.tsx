import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";

import { SignupShell } from "@/components/auth/signup-shell";
import { GradientButton } from "@/components/shared/gradient-button";

export default function EmailLinkGateScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    token_hash?: string;
    type?: string;
    next?: string;
  }>();
  const [error, setError] = useState<string | null>(null);

  const isValid = Boolean(params.token_hash && params.type);

  function onContinue() {
    if (!isValid) {
      setError("This link is incomplete or has expired.");
      return;
    }
    router.replace({
      pathname: "/(auth)/confirm",
      params: {
        token_hash: params.token_hash ?? "",
        type: params.type ?? "",
        next: params.next ?? "",
      },
    });
  }

  return (
    <SignupShell
      title="Continue to Workpunkt"
      subtitle="Tap continue to finish signing in. This step keeps invitation links safe from email scanners."
      backHref="/(auth)/login"
    >
      {error || !isValid ? (
        <View className="mb-4 rounded-2xl bg-error/10 px-4 py-3">
          <Text className="text-sm text-error">
            {error ??
              "This link is incomplete or has expired. Ask Workpunkt to resend the invite."}
          </Text>
        </View>
      ) : null}

      <GradientButton
        text="Set my password and continue"
        onPress={onContinue}
        disabled={!isValid}
      />
    </SignupShell>
  );
}
