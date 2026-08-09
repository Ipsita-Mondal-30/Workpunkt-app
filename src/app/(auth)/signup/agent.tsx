import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";

import { SignupShell } from "@/components/auth/signup-shell";
import { TermsPrivacyConsent } from "@/components/legal/terms-privacy-consent";
import { GradientButton } from "@/components/shared/gradient-button";
import { publicPostJson } from "@/lib/api/public-fetch";
import { useTheme } from "@/lib/theme/theme-context";
import { cn } from "@/lib/utils";

const PARTNER_TYPES = [
  "Independent B2B Agent",
  "School Partner",
  "School Counsellor (Institutional)",
  "Independent Counsellor (Commercial)",
] as const;

const GOALS = [
  { id: "student-recruitment", label: "Student Recruitment — German Universities" },
  { id: "ausbildung", label: "Ausbildung / Vocational Placement" },
  { id: "counsellor-training", label: "School Counsellor Training Programme" },
  { id: "institutional-mou", label: "Institutional MOU Partnership" },
] as const;

const SOURCING = [
  { id: "school-partnerships", label: "School / College Partnerships" },
  { id: "social-media", label: "Social Media / Digital Marketing" },
  { id: "education-fairs", label: "Education Fairs & Exhibitions" },
  { id: "walk-in", label: "Walk-in Enquiries" },
  { id: "referrals", label: "Referrals from Past Students" },
] as const;

const ANNUAL = ["0–25 students", "26–100 students", "101–300 students", "300+ students"] as const;
const COUNTRIES = ["Germany Only", "2–3 Countries", "4–6 Countries", "7+ Countries"] as const;
const TEAM = ["Just Me", "2–3 People", "4–6 People", "7+ People"] as const;

type Step1 = {
  fullName: string;
  designation: string;
  workEmail: string;
  whatsapp: string;
  organisation: string;
  cityCountry: string;
  partnerType: string;
  partnershipServices: string[];
};

export default function AgentSignupScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const placeholderColor = isDark ? "#a1a1aa" : "#71717a";
  const [step, setStep] = useState<1 | 2>(1);
  const [step1, setStep1] = useState<Step1>({
    fullName: "",
    designation: "",
    workEmail: "",
    whatsapp: "",
    organisation: "",
    cityCountry: "",
    partnerType: "",
    partnershipServices: [],
  });
  const [hasGermanyExperience, setHasGermanyExperience] = useState(false);
  const [annualStudentsRecruited, setAnnual] = useState("");
  const [countriesRecruitedFor, setCountries] = useState("");
  const [sourcingIds, setSourcingIds] = useState<string[]>([]);
  const [teamSize, setTeamSize] = useState("");
  const [whyWorkpunkt, setWhy] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function toggleService(label: string) {
    setStep1((prev) => ({
      ...prev,
      partnershipServices: prev.partnershipServices.includes(label)
        ? prev.partnershipServices.filter((item) => item !== label)
        : [...prev.partnershipServices, label],
    }));
  }

  function toggleSourcing(id: string) {
    setSourcingIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  function validateStep1() {
    if (
      !step1.fullName.trim() ||
      !step1.workEmail.trim() ||
      !step1.whatsapp.trim() ||
      !step1.organisation.trim() ||
      !step1.partnerType ||
      step1.partnershipServices.length === 0
    ) {
      setError("Please fill in all required fields and select at least one goal.");
      return false;
    }
    return true;
  }

  async function submit() {
    setError(null);
    setTermsError(null);
    if (!annualStudentsRecruited || !countriesRecruitedFor || !teamSize || !whyWorkpunkt.trim()) {
      setError("Please complete all step 2 fields.");
      return;
    }
    if (sourcingIds.length === 0) {
      setError("Select at least one sourcing method.");
      return;
    }
    if (!termsAccepted) {
      setTermsError("Please agree to the Terms and Conditions");
      return;
    }

    setLoading(true);
    try {
      await publicPostJson("/api/agent/apply", {
        ...step1,
        hasGermanyExperience,
        annualStudentsRecruited,
        countriesRecruitedFor,
        sourcingMethods: sourcingIds.map(
          (id) => SOURCING.find((item) => item.id === id)?.label ?? id,
        ),
        teamSize,
        whyWorkpunkt: whyWorkpunkt.trim(),
      });
      router.replace({
        pathname: "/(auth)/signup/pending",
        params: { role: "agent" },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Application failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SignupShell
      title={step === 1 ? "Partner application" : "About your business"}
      subtitle={
        step === 1
          ? "Step 1 of 2 — basic information"
          : "Step 2 of 2 — help us understand your business"
      }
      backHref={step === 1 ? "/(auth)/signup" : undefined}
      onBack={step === 2 ? () => setStep(1) : undefined}
    >
      {error ? (
        <View className="mb-4 rounded-2xl bg-error/10 px-4 py-3">
          <Text className="text-sm text-error">{error}</Text>
        </View>
      ) : null}

      {step === 1 ? (
        <>
          {(
            [
              ["fullName", "Full name", step1.fullName],
              ["designation", "Designation", step1.designation],
              ["workEmail", "Work email", step1.workEmail],
              ["whatsapp", "WhatsApp", step1.whatsapp],
              ["organisation", "Organisation", step1.organisation],
              ["cityCountry", "City, Country", step1.cityCountry],
            ] as const
          ).map(([key, label, value]) => (
            <TextInput
              key={key}
              placeholder={label}
              placeholderTextColor={placeholderColor}
              autoCapitalize={key === "workEmail" ? "none" : "sentences"}
              keyboardType={key === "workEmail" ? "email-address" : "default"}
              value={value}
              onChangeText={(text) => setStep1((prev) => ({ ...prev, [key]: text }))}
              className="mb-3 rounded-2xl border border-border bg-surface px-4 py-4 text-base text-text"
            />
          ))}

          <Text className="mb-2 text-xs font-semibold uppercase text-muted">Partner type</Text>
          <View className="mb-4 flex-row flex-wrap gap-2">
            {PARTNER_TYPES.map((option) => (
              <Pressable
                key={option}
                onPress={() => setStep1((prev) => ({ ...prev, partnerType: option }))}
                className={cn(
                  "rounded-lg border px-3 py-2",
                  step1.partnerType === option
                    ? "border-brand-mid bg-brand-mid/15"
                    : "border-border bg-surface",
                )}
              >
                <Text className="text-xs text-text">{option}</Text>
              </Pressable>
            ))}
          </View>

          <Text className="mb-2 text-xs font-semibold uppercase text-muted">
            Partnership goals
          </Text>
          <View className="mb-6 gap-2">
            {GOALS.map((goal) => (
              <Pressable
                key={goal.id}
                onPress={() => toggleService(goal.label)}
                className={cn(
                  "rounded-xl border px-3 py-3",
                  step1.partnershipServices.includes(goal.label)
                    ? "border-brand-mid bg-brand-mid/15"
                    : "border-border bg-surface",
                )}
              >
                <Text className="text-sm text-text">{goal.label}</Text>
              </Pressable>
            ))}
          </View>

          <GradientButton
            text="Continue"
            onPress={() => {
              setError(null);
              if (validateStep1()) setStep(2);
            }}
          />
        </>
      ) : (
        <>
          <Pressable
            onPress={() => setHasGermanyExperience((v) => !v)}
            className="mb-4 rounded-xl border border-border bg-surface px-4 py-3"
          >
            <Text className="text-sm text-text">
              Germany experience: {hasGermanyExperience ? "Yes" : "No"} (tap to toggle)
            </Text>
          </Pressable>

          <Text className="mb-2 text-xs font-semibold uppercase text-muted">
            Annual students
          </Text>
          <View className="mb-4 flex-row flex-wrap gap-2">
            {ANNUAL.map((option) => (
              <Pressable
                key={option}
                onPress={() => setAnnual(option)}
                className={cn(
                  "rounded-lg border px-3 py-2",
                  annualStudentsRecruited === option
                    ? "border-brand-mid bg-brand-mid/15"
                    : "border-border bg-surface",
                )}
              >
                <Text className="text-xs text-text">{option}</Text>
              </Pressable>
            ))}
          </View>

          <Text className="mb-2 text-xs font-semibold uppercase text-muted">Countries</Text>
          <View className="mb-4 flex-row flex-wrap gap-2">
            {COUNTRIES.map((option) => (
              <Pressable
                key={option}
                onPress={() => setCountries(option)}
                className={cn(
                  "rounded-lg border px-3 py-2",
                  countriesRecruitedFor === option
                    ? "border-brand-mid bg-brand-mid/15"
                    : "border-border bg-surface",
                )}
              >
                <Text className="text-xs text-text">{option}</Text>
              </Pressable>
            ))}
          </View>

          <Text className="mb-2 text-xs font-semibold uppercase text-muted">Sourcing</Text>
          <View className="mb-4 gap-2">
            {SOURCING.map((method) => (
              <Pressable
                key={method.id}
                onPress={() => toggleSourcing(method.id)}
                className={cn(
                  "rounded-xl border px-3 py-3",
                  sourcingIds.includes(method.id)
                    ? "border-brand-mid bg-brand-mid/15"
                    : "border-border bg-surface",
                )}
              >
                <Text className="text-sm text-text">{method.label}</Text>
              </Pressable>
            ))}
          </View>

          <Text className="mb-2 text-xs font-semibold uppercase text-muted">Team size</Text>
          <View className="mb-4 flex-row flex-wrap gap-2">
            {TEAM.map((option) => (
              <Pressable
                key={option}
                onPress={() => setTeamSize(option)}
                className={cn(
                  "rounded-lg border px-3 py-2",
                  teamSize === option
                    ? "border-brand-mid bg-brand-mid/15"
                    : "border-border bg-surface",
                )}
              >
                <Text className="text-xs text-text">{option}</Text>
              </Pressable>
            ))}
          </View>

          <TextInput
            placeholder="Why Workpunkt?"
            placeholderTextColor={placeholderColor}
            multiline
            value={whyWorkpunkt}
            onChangeText={setWhy}
            className="mb-4 min-h-[100px] rounded-2xl border border-border bg-surface px-4 py-4 text-base text-text"
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
            onPress={() => void submit()}
          />
        </>
      )}
    </SignupShell>
  );
}
