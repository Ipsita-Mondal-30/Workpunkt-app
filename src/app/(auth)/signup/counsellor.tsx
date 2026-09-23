import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";

import { PhoneNumberInput } from "@/components/auth/phone-number-input";
import { SignupField, signupInputClass } from "@/components/auth/signup-field";
import { SignupShell } from "@/components/auth/signup-shell";
import { TermsPrivacyConsent } from "@/components/legal/terms-privacy-consent";
import { GradientButton } from "@/components/shared/gradient-button";
import { publicPostJson } from "@/lib/api/public-fetch";
import { isValidPhoneNumber } from "@/lib/phone/phone-number";
import { normalizeLeadEmail } from "@/lib/signup/email";
import { useThemeColors } from "@/lib/theme/theme-context";

export default function CounsellorSignupScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const [fullName, setFullName] = useState("");
  const [workEmail, setWorkEmail] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [roleDesignation, setRole] = useState("");
  const [cityCountry, setCity] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setError(null);
    setTermsError(null);

    const emailResult = normalizeLeadEmail(workEmail);
    if (!emailResult.ok) {
      setError("Enter a valid work email address.");
      return;
    }

    if (!fullName.trim() || !schoolName.trim()) {
      setError("Please fill in your name, email, and school name.");
      return;
    }

    const whatsappNumber = whatsapp.trim();
    if (whatsappNumber && !isValidPhoneNumber(whatsappNumber)) {
      setError("Please enter a valid WhatsApp number.");
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
        workEmail: emailResult.email,
        schoolName: schoolName.trim(),
        roleDesignation: roleDesignation.trim() || undefined,
        cityCountry: cityCountry.trim() || undefined,
        whatsapp: whatsappNumber || undefined,
        intent: "counsellor_access",
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
      title="School Counsellor Sign Up"
      subtitle="Create your school counsellor account for Counselor Access (₹5,000). After admin approval, sign in to your dashboard and complete payment there."
      backHref="/(auth)/signup"
    >
      {error ? (
        <View className="mb-4 rounded-2xl bg-error/10 px-4 py-3">
          <Text className="text-sm text-error">{error}</Text>
        </View>
      ) : null}

      <SignupField label="Full name">
        <TextInput
          placeholder="Priya Sharma"
          placeholderTextColor={colors.placeholder}
          value={fullName}
          onChangeText={setFullName}
          className={signupInputClass()}
        />
      </SignupField>

      <SignupField label="Work email">
        <TextInput
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          placeholder="counsellor@school.edu"
          placeholderTextColor={colors.placeholder}
          value={workEmail}
          onChangeText={setWorkEmail}
          className={signupInputClass()}
        />
      </SignupField>

      <SignupField label="School / university name">
        <TextInput
          placeholder="Delhi Public School"
          placeholderTextColor={colors.placeholder}
          value={schoolName}
          onChangeText={setSchoolName}
          className={signupInputClass()}
        />
      </SignupField>

      <SignupField label="Role / designation">
        <TextInput
          placeholder="College Counselor"
          placeholderTextColor={colors.placeholder}
          value={roleDesignation}
          onChangeText={setRole}
          className={signupInputClass()}
        />
      </SignupField>

      <SignupField label="City & country">
        <TextInput
          placeholder="Mumbai, India"
          placeholderTextColor={colors.placeholder}
          value={cityCountry}
          onChangeText={setCity}
          className={signupInputClass()}
        />
      </SignupField>

      <SignupField label="WhatsApp">
        <PhoneNumberInput
          value={whatsapp}
          onChange={setWhatsapp}
          placeholder="Mobile number"
        />
      </SignupField>

      <TermsPrivacyConsent
        checked={termsAccepted}
        onCheckedChange={(value) => {
          setTermsAccepted(value);
          if (value) setTermsError(null);
        }}
        error={termsError}
      />

      <GradientButton
        text={loading ? "Submitting…" : "Submit school counsellor application"}
        loading={loading}
        disabled={!termsAccepted}
        onPress={() => void onSubmit()}
      />

      <View className="mt-4 flex-row flex-wrap items-center justify-center gap-1">
        <Text className="text-sm text-muted">Already joined?</Text>
        <Pressable onPress={() => router.push("/(auth)/login")}>
          <Text className="text-sm font-semibold text-text underline">Partner Login</Text>
        </Pressable>
      </View>
    </SignupShell>
  );
}
