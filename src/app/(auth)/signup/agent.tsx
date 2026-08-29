import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";

import { CheckboxRow } from "@/components/auth/checkbox-row";
import { OptionSelect } from "@/components/auth/option-select";
import { PhoneNumberInput } from "@/components/auth/phone-number-input";
import { SignupField, signupInputClass } from "@/components/auth/signup-field";
import { SignupShell } from "@/components/auth/signup-shell";
import { SignupStepIndicator } from "@/components/auth/signup-step-indicator";
import { TermsPrivacyConsent } from "@/components/legal/terms-privacy-consent";
import { GradientButton } from "@/components/shared/gradient-button";
import { publicPostJson } from "@/lib/api/public-fetch";
import { isValidPhoneNumber } from "@/lib/phone/phone-number";
import { partnerSignUpCopy } from "@/lib/signup/copy";
import { normalizeLeadEmail } from "@/lib/signup/email";
import {
  PARTNER_ANNUAL_STUDENTS_OPTIONS,
  PARTNER_COUNTRIES_RECRUITED_OPTIONS,
  PARTNER_GOAL_ID_TO_SERVICE,
  PARTNER_GOALS,
  PARTNER_SOURCING_ID_TO_LABEL,
  PARTNER_SOURCING_METHODS,
  PARTNER_TEAM_SIZE_OPTIONS,
  PARTNER_TYPE_OPTIONS,
} from "@/lib/signup/form-options";
import { useTheme } from "@/lib/theme/theme-context";
import { cn } from "@/lib/utils";

type Step1 = {
  fullName: string;
  designation: string;
  workEmail: string;
  whatsapp: string;
  organisation: string;
  cityCountry: string;
  partnerType: string;
};

type FieldErrors = Partial<Record<keyof Step1, string>> & {
  goals?: string;
  annual?: string;
  countries?: string;
  sourcing?: string;
  team?: string;
  why?: string;
};

type AgentApplyResult = {
  ok?: boolean;
  applicationReference?: string;
  emailSent?: boolean;
};

export default function AgentSignupScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const placeholderColor = isDark ? "#a1a1aa" : "#71717a";
  const copy = partnerSignUpCopy;
  const [step, setStep] = useState<1 | 2>(1);
  const [step1, setStep1] = useState<Step1>({
    fullName: "",
    designation: "",
    workEmail: "",
    whatsapp: "",
    organisation: "",
    cityCountry: "",
    partnerType: "",
  });
  const [goalIds, setGoalIds] = useState<string[]>([]);
  const [hasGermanyExperience, setHasGermanyExperience] = useState(false);
  const [annualStudentsRecruited, setAnnual] = useState("");
  const [countriesRecruitedFor, setCountries] = useState("");
  const [sourcingIds, setSourcingIds] = useState<string[]>([]);
  const [teamSize, setTeamSize] = useState("");
  const [whyWorkpunkt, setWhy] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function patchStep1(partial: Partial<Step1>) {
    setStep1((prev) => ({ ...prev, ...partial }));
    setFieldErrors((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(partial) as Array<keyof Step1>) {
        delete next[key];
      }
      return next;
    });
  }

  function toggleGoal(id: string) {
    setGoalIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
    if (fieldErrors.goals) setFieldErrors((prev) => ({ ...prev, goals: undefined }));
  }

  function toggleSourcing(id: string) {
    setSourcingIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
    if (fieldErrors.sourcing) setFieldErrors((prev) => ({ ...prev, sourcing: undefined }));
  }

  function validateStep1(): FieldErrors | null {
    const next: FieldErrors = {};
    if (!step1.fullName.trim()) next.fullName = "Please fill in all required fields.";
    const emailResult = normalizeLeadEmail(step1.workEmail);
    if (!emailResult.ok) next.workEmail = "Enter a valid work email address.";
    if (!isValidPhoneNumber(step1.whatsapp)) next.whatsapp = "Enter a valid WhatsApp number.";
    if (!step1.organisation.trim()) next.organisation = "Please fill in all required fields.";
    if (!step1.partnerType) next.partnerType = "Please fill in all required fields.";
    if (goalIds.length === 0) next.goals = "Select at least one partnership goal.";
    return Object.keys(next).length > 0 ? next : null;
  }

  function goToStep2() {
    setError(null);
    setTermsError(null);
    const nextErrors = validateStep1();
    setFieldErrors(nextErrors ?? {});
    if (nextErrors) return;
    if (!termsAccepted) {
      setTermsError("Please agree to the Terms and Conditions");
      return;
    }
    setTermsAccepted(false);
    setTermsError(null);
    setStep(2);
  }

  async function submit() {
    setError(null);
    setTermsError(null);
    const next: FieldErrors = {};
    if (!annualStudentsRecruited) next.annual = "Please complete all required fields.";
    if (!countriesRecruitedFor) next.countries = "Please complete all required fields.";
    if (!teamSize) next.team = "Please complete all required fields.";
    if (!whyWorkpunkt.trim()) next.why = "Please complete all required fields.";
    if (sourcingIds.length === 0) next.sourcing = "Select at least one student sourcing method.";
    setFieldErrors(next);
    if (Object.keys(next).length > 0) return;

    if (!termsAccepted) {
      setTermsError("Please agree to the Terms and Conditions");
      return;
    }

    const emailResult = normalizeLeadEmail(step1.workEmail);
    if (!emailResult.ok) {
      setStep(1);
      setFieldErrors({ workEmail: "Enter a valid work email address." });
      return;
    }

    setLoading(true);
    try {
      const result = await publicPostJson<AgentApplyResult>("/api/agent/apply", {
        fullName: step1.fullName.trim(),
        designation: step1.designation.trim(),
        workEmail: emailResult.email,
        whatsapp: step1.whatsapp.trim(),
        organisation: step1.organisation.trim(),
        cityCountry: step1.cityCountry.trim(),
        partnerType: step1.partnerType,
        partnershipServices: goalIds.map(
          (id) => PARTNER_GOAL_ID_TO_SERVICE[id as keyof typeof PARTNER_GOAL_ID_TO_SERVICE] ?? id,
        ),
        hasGermanyExperience,
        annualStudentsRecruited,
        countriesRecruitedFor,
        sourcingMethods: sourcingIds.map(
          (id) => PARTNER_SOURCING_ID_TO_LABEL[id as keyof typeof PARTNER_SOURCING_ID_TO_LABEL] ?? id,
        ),
        teamSize,
        whyWorkpunkt: whyWorkpunkt.trim(),
      });

      router.replace({
        pathname: "/(auth)/signup/agent/submitted",
        params: {
          email: emailResult.email,
          ref: result.applicationReference ?? "",
          emailSent: result.emailSent === false ? "0" : "1",
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Application failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SignupShell
      title={copy.title}
      subtitle={step === 1 ? copy.step1Subtitle : copy.step2Subtitle}
      backHref={step === 1 ? "/(auth)/signup" : undefined}
      onBack={step === 2 ? () => setStep(1) : undefined}
    >
      <SignupStepIndicator current={step} />

      {error ? (
        <View className="mb-4 rounded-2xl bg-error/10 px-4 py-3">
          <Text className="text-sm text-error">{error}</Text>
        </View>
      ) : null}

      {step === 1 ? (
        <>
          <SignupField label={copy.fields.fullName.label} error={fieldErrors.fullName}>
            <TextInput
              autoComplete="name"
              placeholder={copy.fields.fullName.placeholder}
              placeholderTextColor={placeholderColor}
              value={step1.fullName}
              onChangeText={(fullName: string) => patchStep1({ fullName })}
              className={signupInputClass(Boolean(fieldErrors.fullName))}
            />
          </SignupField>
          <SignupField label={copy.fields.designation.label} error={fieldErrors.designation}>
            <TextInput
              placeholder={copy.fields.designation.placeholder}
              placeholderTextColor={placeholderColor}
              value={step1.designation}
              onChangeText={(designation: string) => patchStep1({ designation })}
              className={signupInputClass(Boolean(fieldErrors.designation))}
            />
          </SignupField>
          <SignupField label={copy.fields.workEmail.label} error={fieldErrors.workEmail}>
            <TextInput
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              placeholder={copy.fields.workEmail.placeholder}
              placeholderTextColor={placeholderColor}
              value={step1.workEmail}
              onChangeText={(workEmail: string) => patchStep1({ workEmail })}
              className={signupInputClass(Boolean(fieldErrors.workEmail))}
            />
          </SignupField>
          <SignupField label={copy.fields.whatsapp.label} error={fieldErrors.whatsapp}>
            <PhoneNumberInput
              value={step1.whatsapp}
              onChange={(whatsapp) => patchStep1({ whatsapp })}
              placeholder={copy.fields.whatsapp.placeholder}
              hasError={Boolean(fieldErrors.whatsapp)}
            />
          </SignupField>
          <SignupField label={copy.fields.organisation.label} error={fieldErrors.organisation}>
            <TextInput
              placeholder={copy.fields.organisation.placeholder}
              placeholderTextColor={placeholderColor}
              value={step1.organisation}
              onChangeText={(organisation: string) => patchStep1({ organisation })}
              className={signupInputClass(Boolean(fieldErrors.organisation))}
            />
          </SignupField>
          <SignupField label={copy.fields.cityCountry.label} error={fieldErrors.cityCountry}>
            <TextInput
              placeholder={copy.fields.cityCountry.placeholder}
              placeholderTextColor={placeholderColor}
              value={step1.cityCountry}
              onChangeText={(cityCountry: string) => patchStep1({ cityCountry })}
              className={signupInputClass(Boolean(fieldErrors.cityCountry))}
            />
          </SignupField>
          <SignupField label={copy.fields.partnerType.label} error={fieldErrors.partnerType}>
            <OptionSelect
              value={step1.partnerType}
              placeholder={copy.fields.partnerType.placeholder}
              options={PARTNER_TYPE_OPTIONS}
              onChange={(partnerType) => patchStep1({ partnerType })}
              hasError={Boolean(fieldErrors.partnerType)}
            />
          </SignupField>

          <View className="mb-4">
            <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
              {copy.fields.goals}
            </Text>
            <View className="gap-2">
              {PARTNER_GOALS.map((goal) => (
                <CheckboxRow
                  key={goal.id}
                  checked={goalIds.includes(goal.id)}
                  onToggle={() => toggleGoal(goal.id)}
                  label={`${goal.emoji} ${goal.label}`}
                />
              ))}
            </View>
            {fieldErrors.goals ? (
              <Text className="mt-1.5 text-xs font-medium text-error">{fieldErrors.goals}</Text>
            ) : null}
          </View>

          <TermsPrivacyConsent
            checked={termsAccepted}
            onCheckedChange={(value) => {
              setTermsAccepted(value);
              if (value) setTermsError(null);
            }}
            error={termsError}
          />

          <GradientButton text={copy.continue} onPress={goToStep2} />

          <Pressable onPress={() => router.replace("/(auth)/login")} className="mt-6">
            <Text className="text-center text-sm text-muted">
              {copy.footerPrefix}{" "}
              <Text className="font-semibold text-text">{copy.footerLink}</Text>
            </Text>
          </Pressable>
        </>
      ) : (
        <>
          <View className="mb-4">
            <CheckboxRow
              checked={hasGermanyExperience}
              onToggle={() => setHasGermanyExperience((value) => !value)}
              label={copy.fields.germanyExperience}
            />
          </View>

          <SignupField label={copy.fields.annual.label} error={fieldErrors.annual}>
            <OptionSelect
              value={annualStudentsRecruited}
              placeholder={copy.fields.annual.placeholder}
              options={PARTNER_ANNUAL_STUDENTS_OPTIONS}
              onChange={setAnnual}
              hasError={Boolean(fieldErrors.annual)}
            />
          </SignupField>

          <SignupField label={copy.fields.countries.label} error={fieldErrors.countries}>
            <OptionSelect
              value={countriesRecruitedFor}
              placeholder={copy.fields.countries.placeholder}
              options={PARTNER_COUNTRIES_RECRUITED_OPTIONS}
              onChange={setCountries}
              hasError={Boolean(fieldErrors.countries)}
            />
          </SignupField>

          <View className="mb-4">
            <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
              {copy.fields.sourcing}
            </Text>
            <View className="gap-2">
              {PARTNER_SOURCING_METHODS.map((method) => (
                <CheckboxRow
                  key={method.id}
                  checked={sourcingIds.includes(method.id)}
                  onToggle={() => toggleSourcing(method.id)}
                  label={method.label}
                />
              ))}
            </View>
            {fieldErrors.sourcing ? (
              <Text className="mt-1.5 text-xs font-medium text-error">{fieldErrors.sourcing}</Text>
            ) : null}
          </View>

          <SignupField label={copy.fields.team.label} error={fieldErrors.team}>
            <OptionSelect
              value={teamSize}
              placeholder={copy.fields.team.placeholder}
              options={PARTNER_TEAM_SIZE_OPTIONS}
              onChange={setTeamSize}
              hasError={Boolean(fieldErrors.team)}
            />
          </SignupField>

          <SignupField label={copy.fields.why.label} error={fieldErrors.why}>
            <TextInput
              placeholder={copy.fields.why.placeholder}
              placeholderTextColor={placeholderColor}
              multiline
              value={whyWorkpunkt}
              onChangeText={(value: string) => {
                setWhy(value);
                if (fieldErrors.why) setFieldErrors((prev) => ({ ...prev, why: undefined }));
              }}
              className={cn(signupInputClass(Boolean(fieldErrors.why)), "min-h-[120px]")}
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
            text={loading ? copy.submitting : copy.submit}
            loading={loading}
            onPress={() => void submit()}
          />
        </>
      )}
    </SignupShell>
  );
}
