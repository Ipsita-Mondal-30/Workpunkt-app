import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import type { EmailOtpType } from "@supabase/supabase-js";

import { SignupShell } from "@/components/auth/signup-shell";
import { GradientButton } from "@/components/shared/gradient-button";
import { mapAuthNextPath } from "@/lib/auth/deep-link";
import { useAuth } from "@/lib/auth/auth-context";
import { supabase } from "@/lib/supabase/client";

export default function AuthConfirmScreen() {
  const router = useRouter();
  const { refreshProfile } = useAuth();
  const params = useLocalSearchParams<{
    token_hash?: string;
    type?: string;
    next?: string;
  }>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function verify() {
      const tokenHash = params.token_hash?.trim();
      const type = params.type?.trim() as EmailOtpType | undefined;
      if (!tokenHash || !type) {
        setError("This link is incomplete or has expired.");
        return;
      }

      const { error: otpError } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type,
      });

      if (cancelled) return;

      if (otpError) {
        setError(otpError.message || "Could not verify this link.");
        return;
      }

      await refreshProfile();
      router.replace(mapAuthNextPath(params.next) as never);
    }

    void verify();
    return () => {
      cancelled = true;
    };
  }, [params.next, params.token_hash, params.type, refreshProfile, router]);

  return (
    <SignupShell title="Signing you in" subtitle="Verifying your secure link…" backHref="/(auth)/login">
      {error ? (
        <View>
          <View className="mb-4 rounded-2xl bg-error/10 px-4 py-3">
            <Text className="text-sm text-error">{error}</Text>
          </View>
          <GradientButton
            text="Continue application"
            onPress={() => router.replace("/(auth)/signup/student/academic")}
          />
        </View>
      ) : (
        <View className="items-center py-10">
          <ActivityIndicator color="#f6339a" size="large" />
        </View>
      )}
    </SignupShell>
  );
}
