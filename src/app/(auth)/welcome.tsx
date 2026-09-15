import { useState } from "react";
import { Text, View } from "react-native";
import { useRouter } from "expo-router";

import { PasswordField } from "@/components/auth/password-field";
import { SignupShell } from "@/components/auth/signup-shell";
import { GradientButton } from "@/components/shared/gradient-button";
import { authFetch } from "@/lib/api/auth-fetch";
import { useAuth } from "@/lib/auth/auth-context";
import { supabase } from "@/lib/supabase/client";
import { useTheme } from "@/lib/theme/theme-context";

export default function WelcomePasswordScreen() {
  const router = useRouter();
  const { refreshProfile, homePath } = useAuth();
  const { isDark } = useTheme();
  const placeholderColor = isDark ? "#a1a1aa" : "#71717a";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setError(null);
    if (!password || password !== confirmPassword) {
      setError("Passwords must match.");
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;

      const response = await authFetch("/api/auth/complete-password-setup", {
        method: "POST",
        body: JSON.stringify({}),
      });
      if (!response.ok) {
        const json = (await response.json()) as { error?: string };
        throw new Error(json.error ?? "Could not finish password setup.");
      }

      await refreshProfile();

      // Enrolled invitees go through profile onboarding; others enter their role home.
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: nextProfile } = await supabase
          .from("profiles")
          .select("is_enrolled, needs_password_setup, role, admin_role, is_agent_active")
          .eq("id", user.id)
          .maybeSingle();
        if (nextProfile?.is_enrolled) {
          router.replace("/(auth)/onboarding");
          return;
        }
      }

      router.replace(homePath as never);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not set password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SignupShell
      title="Set your password"
      subtitle="Choose a password to finish activating your account."
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
        text={loading ? "Saving…" : "Continue"}
        loading={loading}
        onPress={() => void onSubmit()}
      />
    </SignupShell>
  );
}
