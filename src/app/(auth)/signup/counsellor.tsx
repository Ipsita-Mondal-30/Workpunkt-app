import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";

import { SignupShell } from "@/components/auth/signup-shell";
import { TermsPrivacyConsent } from "@/components/legal/terms-privacy-consent";
import { GradientButton } from "@/components/shared/gradient-button";
import { publicPostJson } from "@/lib/api/public-fetch";
import { useTheme } from "@/lib/theme/theme-context";
import { cn } from "@/lib/utils";

export default function CounsellorSignupScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const placeholderColor = isDark ? "#a1a1aa" : "#71717a";
  const [fullName, setFullName] = useState("");
  const [workEmail, setWorkEmail] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [roleDesignation, setRole] = useState("");
  const [cityCountry, setCity] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [intent, setIntent] = useState<"counsellor_access" | "career_pathing">(
    "counsellor_access",
  );
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setError(null);
    setTermsError(null);
    if (!fullName.trim() || !workEmail.trim() || !schoolName.trim()) {
      setError("Please fill in your name, email, and school name.");
      return;
    }
    if (!termsAccepted) {
      setTermsError("Please agree to the Terms and Conditions");
      return;
    }

    setLoading(true);
    try {
      await publicPostJson("/api/school-counsellor/apply", {
        fullName: fullName.trim(),
        workEmail: workEmail.trim(),
        schoolName: schoolName.trim(),
        roleDesignation: roleDesignation.trim() || undefined,
        cityCountry: cityCountry.trim() || undefined,
        whatsapp: whatsapp.trim() || undefined,
        intent,
      });
      router.replace({
        pathname: "/(auth)/signup/pending",
        params: { role: "counsellor" },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Application failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SignupShell
      title="School counsellor apply"
      subtitle="Apply for Counsellor Access or Career Pathing."
      backHref="/(auth)/signup"
    >
      {error ? (
        <View className="mb-4 rounded-2xl bg-error/10 px-4 py-3">
          <Text className="text-sm text-error">{error}</Text>
        </View>
      ) : null}

      <View className="mb-4 flex-row gap-2">
        {(
          [
            ["counsellor_access", "Counsellor Access"],
            ["career_pathing", "Career Pathing"],
          ] as const
        ).map(([value, label]) => (
          <Pressable
            key={value}
            onPress={() => setIntent(value)}
            className={cn(
              "flex-1 rounded-xl border px-3 py-3",
              intent === value
                ? "border-brand-mid bg-brand-mid/15"
                : "border-border bg-surface",
            )}
          >
            <Text className="text-center text-xs font-semibold text-text">{label}</Text>
          </Pressable>
        ))}
      </View>

      <TextInput
        placeholder="Full name"
        placeholderTextColor={placeholderColor}
        value={fullName}
        onChangeText={setFullName}
        className="mb-3 rounded-2xl border border-border bg-surface px-4 py-4 text-base text-text"
      />
      <TextInput
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="Work email"
        placeholderTextColor={placeholderColor}
        value={workEmail}
        onChangeText={setWorkEmail}
        className="mb-3 rounded-2xl border border-border bg-surface px-4 py-4 text-base text-text"
      />
      <TextInput
        placeholder="School name"
        placeholderTextColor={placeholderColor}
        value={schoolName}
        onChangeText={setSchoolName}
        className="mb-3 rounded-2xl border border-border bg-surface px-4 py-4 text-base text-text"
      />
      <TextInput
        placeholder="Role / designation (optional)"
        placeholderTextColor={placeholderColor}
        value={roleDesignation}
        onChangeText={setRole}
        className="mb-3 rounded-2xl border border-border bg-surface px-4 py-4 text-base text-text"
      />
      <TextInput
        placeholder="City, Country (optional)"
        placeholderTextColor={placeholderColor}
        value={cityCountry}
        onChangeText={setCity}
        className="mb-3 rounded-2xl border border-border bg-surface px-4 py-4 text-base text-text"
      />
      <TextInput
        placeholder="WhatsApp (optional)"
        placeholderTextColor={placeholderColor}
        value={whatsapp}
        onChangeText={setWhatsapp}
        className="mb-4 rounded-2xl border border-border bg-surface px-4 py-4 text-base text-text"
      />

      <TermsPrivacyConsent
        checked={termsAccepted}
        onCheckedChange={(value) => {
          setTermsAccepted(value);
          if (value) setTermsError(null);
        }}
        error={termsError}
      />

      <GradientButton
        text={loading ? "Submitting…" : "Submit application"}
        loading={loading}
        disabled={!termsAccepted}
        onPress={() => void onSubmit()}
      />
    </SignupShell>
  );
}
