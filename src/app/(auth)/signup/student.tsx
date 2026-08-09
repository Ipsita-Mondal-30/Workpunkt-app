import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";

import { SignupShell } from "@/components/auth/signup-shell";
import { TermsPrivacyConsent } from "@/components/legal/terms-privacy-consent";
import { GradientButton } from "@/components/shared/gradient-button";
import { publicPostJson } from "@/lib/api/public-fetch";
import { savePrivateDraft } from "@/lib/signup/private-draft";
import { useTheme } from "@/lib/theme/theme-context";
import { cn } from "@/lib/utils";

const SOURCE_OPTIONS = [
  { value: "google-search", label: "Google Search" },
  { value: "instagram", label: "Instagram" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "youtube", label: "YouTube" },
  { value: "webinar", label: "Webinar" },
  { value: "school-college-counsellor", label: "School / College Counsellor" },
  { value: "friend-family-referral", label: "Friend / Family Referral" },
  { value: "education-fair-event", label: "Education Fair / Event" },
  { value: "university-partner", label: "University Partner" },
  { value: "whatsapp-group", label: "WhatsApp Group" },
  { value: "email-newsletter", label: "Email / Newsletter" },
  { value: "other", label: "Other" },
] as const;

export default function StudentSignupScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const placeholderColor = isDark ? "#a1a1aa" : "#71717a";
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [source, setSource] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setError(null);
    setTermsError(null);
    if (!firstName.trim() || !email.trim() || !mobile.trim() || !source) {
      setError("Please fill in all required fields.");
      return;
    }
    if (!termsAccepted) {
      setTermsError("Please agree to the Terms and Conditions");
      return;
    }

    const signup = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      mobile: mobile.trim(),
      source,
      track: "private-university" as const,
    };

    setLoading(true);
    try {
      const data = await publicPostJson<{ reference?: string }>(
        "/api/private/signup",
        { signup },
      );
      await savePrivateDraft({
        signup,
        reference: data.reference,
      });
      router.push("/(auth)/signup/student/check-email");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SignupShell
      title="Student sign up"
      subtitle="Start your private university application."
      backHref="/(auth)/signup"
    >
      {error ? (
        <View className="mb-4 rounded-2xl bg-error/10 px-4 py-3">
          <Text className="text-sm text-error">{error}</Text>
        </View>
      ) : null}

      <TextInput
        placeholder="First name"
        placeholderTextColor={placeholderColor}
        value={firstName}
        onChangeText={setFirstName}
        className="mb-3 rounded-2xl border border-border bg-surface px-4 py-4 text-base text-text"
      />
      <TextInput
        placeholder="Last name"
        placeholderTextColor={placeholderColor}
        value={lastName}
        onChangeText={setLastName}
        className="mb-3 rounded-2xl border border-border bg-surface px-4 py-4 text-base text-text"
      />
      <TextInput
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="Email"
        placeholderTextColor={placeholderColor}
        value={email}
        onChangeText={setEmail}
        className="mb-3 rounded-2xl border border-border bg-surface px-4 py-4 text-base text-text"
      />
      <TextInput
        keyboardType="phone-pad"
        placeholder="Mobile (with country code)"
        placeholderTextColor={placeholderColor}
        value={mobile}
        onChangeText={setMobile}
        className="mb-4 rounded-2xl border border-border bg-surface px-4 py-4 text-base text-text"
      />

      <Text className="mb-2 text-xs font-semibold uppercase text-muted">
        How did you hear about us?
      </Text>
      <View className="mb-6 flex-row flex-wrap gap-2">
        {SOURCE_OPTIONS.map((option) => (
          <Pressable
            key={option.value}
            onPress={() => setSource(option.value)}
            className={cn(
              "rounded-lg border px-3 py-2",
              source === option.value
                ? "border-brand-mid bg-brand-mid/15"
                : "border-border bg-surface",
            )}
          >
            <Text className="text-xs text-text">{option.label}</Text>
          </Pressable>
        ))}
      </View>

      <TermsPrivacyConsent
        checked={termsAccepted}
        onCheckedChange={(value) => {
          setTermsAccepted(value);
          if (value) setTermsError(null);
        }}
        error={termsError}
      />

      <GradientButton
        text={loading ? "Submitting…" : "Continue"}
        loading={loading}
        disabled={!termsAccepted}
        onPress={() => void onSubmit()}
      />
    </SignupShell>
  );
}
