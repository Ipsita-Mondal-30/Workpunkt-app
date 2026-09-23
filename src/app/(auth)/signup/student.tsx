import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";

import { OptionSelect } from "@/components/auth/option-select";
import { PhoneNumberInput } from "@/components/auth/phone-number-input";
import { SignupField, signupInputClass } from "@/components/auth/signup-field";
import { SignupShell } from "@/components/auth/signup-shell";
import { TermsPrivacyConsent } from "@/components/legal/terms-privacy-consent";
import { GradientButton } from "@/components/shared/gradient-button";
import { publicPostJson } from "@/lib/api/public-fetch";
import { parseSignupContinueUrl } from "@/lib/auth/deep-link";
import { isValidPhoneNumber } from "@/lib/phone/phone-number";
import { studentSignUpCopy } from "@/lib/signup/copy";
import { normalizeLeadEmail } from "@/lib/signup/email";
import { labelForPrivateLeadSource, PRIVATE_LEAD_SOURCE_OPTIONS } from "@/lib/signup/form-options";
import { loadPrivateDraft, savePrivateDraft } from "@/lib/signup/private-draft";
import { useThemeColors } from "@/lib/theme/theme-context";

type FieldErrors = {
  firstName?: string;
  lastName?: string;
  email?: string;
  mobile?: string;
  source?: string;
};

type SignupApiResult = {
  reference?: string;
  leadRecordId?: string;
  emailSent?: boolean;
  continueUrl?: string;
};

export default function StudentSignupScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const copy = studentSignUpCopy;

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [source, setSource] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [continuing, setContinuing] = useState(false);

  const busy = loading || continuing;

  function validate(): FieldErrors | null {
    const next: FieldErrors = {};
    if (!firstName.trim()) next.firstName = "First name is required";
    if (!lastName.trim()) next.lastName = "Last name is required";

    const emailResult = normalizeLeadEmail(email);
    if (!emailResult.ok) next.email = "Enter a valid email address";

    if (!isValidPhoneNumber(mobile)) next.mobile = "Enter a valid mobile number";
    if (!source) next.source = "Tell us how you heard about us";

    return Object.keys(next).length > 0 ? next : null;
  }

  async function onSubmit() {
    setError(null);
    setMessage(null);
    setTermsError(null);

    const nextErrors = validate();
    setFieldErrors(nextErrors ?? {});
    if (nextErrors) return;

    if (!termsAccepted) {
      setTermsError("Please agree to the Terms and Conditions");
      return;
    }

    const emailResult = normalizeLeadEmail(email);
    if (!emailResult.ok) return;

    const signup = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: emailResult.email,
      mobile: mobile.trim(),
      source: labelForPrivateLeadSource(source),
      track: "private-university" as const,
    };

    setLoading(true);
    try {
      const draft = await loadPrivateDraft();
      const data = await publicPostJson<SignupApiResult>("/api/private/signup", {
        signup,
        ...(draft?.reference?.trim() ? { reference: draft.reference.trim() } : {}),
      });

      await savePrivateDraft({
        signup,
        reference: data.reference ?? draft?.reference,
        academic: draft?.academic,
      });

      const parsed = parseSignupContinueUrl(data.continueUrl);
      if (
        (parsed.kind === "confirm" || parsed.kind === "email-link") &&
        parsed.tokenHash &&
        parsed.type
      ) {
        setContinuing(true);
        setMessage(
          data.emailSent
            ? copy.emailBackupMessage.replace("{email}", signup.email)
            : copy.continuingMessage,
        );
        router.replace({
          pathname: parsed.kind === "email-link" ? "/(auth)/email-link" : "/(auth)/confirm",
          params: {
            token_hash: parsed.tokenHash,
            type: parsed.type,
            next: parsed.next ?? "",
          },
        });
        return;
      }

      router.push("/(auth)/signup/student/check-email");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create your account. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SignupShell title={copy.title} subtitle={copy.subtitle} backHref="/(auth)/signup">
      {error ? (
        <View className="mb-4 rounded-2xl bg-error/10 px-4 py-3">
          <Text className="text-sm text-error">{error}</Text>
        </View>
      ) : null}
      {message ? (
        <View className="mb-4 rounded-2xl border border-border bg-surface px-4 py-3">
          <Text className="text-sm text-muted">{message}</Text>
        </View>
      ) : null}

      <View className="flex-row gap-3">
        <SignupField label={copy.fields.firstName.label} error={fieldErrors.firstName} className="mb-4 flex-1">
          <TextInput
            autoComplete="given-name"
            placeholder={copy.fields.firstName.placeholder}
            placeholderTextColor={colors.placeholder}
            value={firstName}
            editable={!busy}
            onChangeText={(value: string) => {
              setFirstName(value);
              if (fieldErrors.firstName) setFieldErrors((prev) => ({ ...prev, firstName: undefined }));
            }}
            className={signupInputClass(Boolean(fieldErrors.firstName))}
          />
        </SignupField>
        <SignupField label={copy.fields.lastName.label} error={fieldErrors.lastName} className="mb-4 flex-1">
          <TextInput
            autoComplete="family-name"
            placeholder={copy.fields.lastName.placeholder}
            placeholderTextColor={colors.placeholder}
            value={lastName}
            editable={!busy}
            onChangeText={(value: string) => {
              setLastName(value);
              if (fieldErrors.lastName) setFieldErrors((prev) => ({ ...prev, lastName: undefined }));
            }}
            className={signupInputClass(Boolean(fieldErrors.lastName))}
          />
        </SignupField>
      </View>

      <SignupField label={copy.fields.email.label} error={fieldErrors.email}>
        <TextInput
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          placeholder={copy.fields.email.placeholder}
          placeholderTextColor={colors.placeholder}
          value={email}
          editable={!busy}
          onChangeText={(value: string) => {
            setEmail(value);
            if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
          }}
          className={signupInputClass(Boolean(fieldErrors.email))}
        />
      </SignupField>

      <SignupField label={copy.fields.mobile.label} error={fieldErrors.mobile}>
        <PhoneNumberInput
          value={mobile}
          onChange={(value) => {
            setMobile(value);
            if (fieldErrors.mobile) setFieldErrors((prev) => ({ ...prev, mobile: undefined }));
          }}
          placeholder={copy.fields.mobile.placeholder}
          hasError={Boolean(fieldErrors.mobile)}
          disabled={busy}
        />
      </SignupField>

      <SignupField label={copy.fields.source.label} error={fieldErrors.source}>
        <OptionSelect
          value={source}
          placeholder={copy.fields.source.placeholder}
          options={PRIVATE_LEAD_SOURCE_OPTIONS}
          onChange={(value) => {
            setSource(value);
            if (fieldErrors.source) setFieldErrors((prev) => ({ ...prev, source: undefined }));
          }}
          hasError={Boolean(fieldErrors.source)}
          disabled={busy}
        />
      </SignupField>

      {!continuing ? (
        <TermsPrivacyConsent
          checked={termsAccepted}
          onCheckedChange={(value) => {
            setTermsAccepted(value);
            if (value) setTermsError(null);
          }}
          error={termsError}
        />
      ) : null}

      <GradientButton
        text={continuing ? copy.continuing : loading ? copy.creating : copy.submit}
        loading={loading}
        disabled={busy}
        onPress={() => void onSubmit()}
      />

      <Pressable onPress={() => router.replace("/(auth)/login")} className="mt-6">
        <Text className="text-center text-sm text-muted">
          {copy.footerPrefix}{" "}
          <Text className="font-semibold text-text">{copy.footerLink}</Text>
        </Text>
      </Pressable>
    </SignupShell>
  );
}
