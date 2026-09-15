import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";

import { PasswordField } from "@/components/auth/password-field";
import { SignupShell } from "@/components/auth/signup-shell";
import { GradientButton } from "@/components/shared/gradient-button";
import { publicPostJson } from "@/lib/api/public-fetch";
import { useAuth } from "@/lib/auth/auth-context";
import { useTheme } from "@/lib/theme/theme-context";

export default function PartnerActivateScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const { isDark } = useTheme();
  const placeholderColor = isDark ? "#a1a1aa" : "#71717a";
  const params = useLocalSearchParams<{ token?: string }>();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setError(null);
    const token = params.token?.trim() ?? "";
    if (!token) {
      setError("This activation link is invalid.");
      return;
    }
    if (!password || password !== confirmPassword) {
      setError("Passwords must match.");
      return;
    }

    setLoading(true);
    try {
      const result = await publicPostJson<{ ok: true; email: string }>(
        "/api/agent/activate",
        { token, password, confirmPassword },
      );
      const signedIn = await signIn(result.email, password);
      if (signedIn.error) {
        setError(signedIn.error);
        return;
      }
      router.replace((signedIn.homePath || "/(agent)") as never);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Activation failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SignupShell
      title="Activate your portal"
      subtitle="Choose a password to finish setting up your partner account."
      backHref="/(auth)/login"
    >
      {error ? (
        <View className="mb-4 rounded-2xl bg-error/10 px-4 py-3">
          <Text className="text-sm text-error">{error}</Text>
        </View>
      ) : null}

      <PasswordField
        isDark={isDark}
        placeholder="Password"
        placeholderTextColor={placeholderColor}
        value={password}
        onChangeText={setPassword}
        className="mb-3 rounded-2xl border border-border bg-surface px-4 py-4 text-base text-text"
      />
      <PasswordField
        isDark={isDark}
        placeholder="Confirm password"
        placeholderTextColor={placeholderColor}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        className="mb-6 rounded-2xl border border-border bg-surface px-4 py-4 text-base text-text"
      />
      <GradientButton
        text={loading ? "Activating…" : "Activate and sign in"}
        loading={loading}
        onPress={() => void onSubmit()}
      />
    </SignupShell>
  );
}
