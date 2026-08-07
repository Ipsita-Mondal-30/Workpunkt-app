import { useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";

import { SignupShell } from "@/components/auth/signup-shell";
import { GradientButton } from "@/components/shared/gradient-button";
import { publicPostJson } from "@/lib/api/public-fetch";
import {
  loadPrivateDraft,
  savePrivateDraft,
  type PrivateAcademicDraft,
} from "@/lib/signup/private-draft";
import { useTheme } from "@/lib/theme/theme-context";
import { cn } from "@/lib/utils";

const QUALIFICATIONS = [
  { value: "class-10", label: "Class 10 / Secondary School" },
  { value: "class-12", label: "Class 12 / High School (in progress)" },
  { value: "class-12-completed", label: "Class 12 / High School (completed)" },
  { value: "bachelors-in-progress", label: "Bachelor's degree (in progress)" },
  { value: "bachelors-completed", label: "Bachelor's degree (completed)" },
  { value: "masters-in-progress", label: "Master's degree (in progress)" },
  { value: "masters-completed", label: "Master's degree (completed)" },
];

const STUDY_LEVELS = [
  { value: "bachelors", label: "Bachelor's" },
  { value: "masters", label: "Master's" },
  { value: "fully-funded-phd", label: "Fully Funded PhD" },
  { value: "ausbildung", label: "Ausbildung" },
  { value: "chancenkarte", label: "Chancenkarte" },
  { value: "paid-internships", label: "Paid Internships" },
];

const LANGUAGE = [
  { value: "ielts", label: "IELTS" },
  { value: "toefl", label: "TOEFL" },
  { value: "yet-to-appear", label: "Yet to appear" },
  { value: "others", label: "Others" },
];

const BOARDS = [
  { value: "cbse-state", label: "CBSE/State Boards" },
  { value: "icse-isc", label: "ICSE/ISC" },
  { value: "ibdp", label: "IBDP" },
  { value: "cambridge-a-levels", label: "Cambridge A-levels" },
  { value: "nios", label: "NIOS" },
  { value: "others", label: "Others" },
];

const INTAKES = [
  { value: "winter-2026", label: "Winter 2026" },
  { value: "summer-2027", label: "Summer 2027" },
];

function ChipRow({
  options,
  value,
  onChange,
}: {
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <View className="mb-4 flex-row flex-wrap gap-2">
      {options.map((option) => (
        <Pressable
          key={option.value}
          onPress={() => onChange(option.value)}
          className={cn(
            "rounded-lg border px-3 py-2",
            value === option.value
              ? "border-brand-mid bg-brand-mid/15"
              : "border-border bg-surface",
          )}
        >
          <Text className="text-xs text-text">{option.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export default function StudentAcademicScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const placeholderColor = isDark ? "#a1a1aa" : "#71717a";
  const [form, setForm] = useState<PrivateAcademicDraft>({
    qualification: "",
    institution: "",
    year: "",
    grade: "",
    boards: "",
    boardsOther: "",
    studyGoal: "",
    studyLevel: "",
    languageCert: "",
    intake: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void loadPrivateDraft().then((draft) => {
      if (draft?.academic) setForm(draft.academic);
    });
  }, []);

  function patch(partial: Partial<PrivateAcademicDraft>) {
    setForm((prev) => ({ ...prev, ...partial }));
  }

  async function onSubmit() {
    setError(null);
    if (
      !form.qualification ||
      !form.institution.trim() ||
      !form.year.trim() ||
      !form.grade.trim() ||
      !form.boards ||
      !form.studyGoal.trim() ||
      !form.studyLevel ||
      !form.languageCert ||
      !form.intake
    ) {
      setError("Please complete all required academic fields.");
      return;
    }
    if (form.boards === "others" && !form.boardsOther?.trim()) {
      setError("Enter your board name.");
      return;
    }

    const draft = await loadPrivateDraft();
    if (!draft?.signup) {
      setError("Signup details missing. Start again from student sign up.");
      return;
    }

    setLoading(true);
    try {
      await publicPostJson("/api/private/applications/draft", {
        signup: draft.signup,
        academic: form,
        reference: draft.reference,
      });
      await savePrivateDraft({ ...draft, academic: form });
      router.push("/(auth)/signup/student/upload");
    } catch (err) {
      // Still allow local continue if draft sync fails (same as website).
      await savePrivateDraft({ ...draft, academic: form });
      setError(err instanceof Error ? err.message : "Could not sync draft.");
      router.push("/(auth)/signup/student/upload");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SignupShell
      title="Academic background"
      subtitle="Tell us about your studies so we can match programmes."
      backHref="/(auth)/signup/student/check-email"
    >
      {error ? (
        <View className="mb-4 rounded-2xl bg-error/10 px-4 py-3">
          <Text className="text-sm text-error">{error}</Text>
        </View>
      ) : null}

      <Text className="mb-2 text-xs font-semibold uppercase text-muted">Qualification</Text>
      <ChipRow
        options={QUALIFICATIONS}
        value={form.qualification}
        onChange={(qualification) => patch({ qualification })}
      />

      <TextInput
        placeholder="School / college"
        placeholderTextColor={placeholderColor}
        value={form.institution}
        onChangeText={(institution) => patch({ institution })}
        className="mb-3 rounded-2xl border border-border bg-surface px-4 py-4 text-base text-text"
      />
      <TextInput
        placeholder="Year (YYYY)"
        placeholderTextColor={placeholderColor}
        keyboardType="number-pad"
        value={form.year}
        onChangeText={(year) => patch({ year })}
        className="mb-3 rounded-2xl border border-border bg-surface px-4 py-4 text-base text-text"
      />
      <TextInput
        placeholder="Percentage / CGPA"
        placeholderTextColor={placeholderColor}
        value={form.grade}
        onChangeText={(grade) => patch({ grade })}
        className="mb-3 rounded-2xl border border-border bg-surface px-4 py-4 text-base text-text"
      />

      <Text className="mb-2 text-xs font-semibold uppercase text-muted">Board</Text>
      <ChipRow options={BOARDS} value={form.boards} onChange={(boards) => patch({ boards })} />
      {form.boards === "others" ? (
        <TextInput
          placeholder="Board name"
          placeholderTextColor={placeholderColor}
          value={form.boardsOther}
          onChangeText={(boardsOther) => patch({ boardsOther })}
          className="mb-3 rounded-2xl border border-border bg-surface px-4 py-4 text-base text-text"
        />
      ) : null}

      <TextInput
        placeholder="What would you like to study in Germany?"
        placeholderTextColor={placeholderColor}
        value={form.studyGoal}
        onChangeText={(studyGoal) => patch({ studyGoal })}
        className="mb-3 rounded-2xl border border-border bg-surface px-4 py-4 text-base text-text"
      />

      <Text className="mb-2 text-xs font-semibold uppercase text-muted">Study level</Text>
      <ChipRow
        options={STUDY_LEVELS}
        value={form.studyLevel}
        onChange={(studyLevel) => patch({ studyLevel })}
      />

      <Text className="mb-2 text-xs font-semibold uppercase text-muted">Language cert</Text>
      <ChipRow
        options={LANGUAGE}
        value={form.languageCert}
        onChange={(languageCert) => patch({ languageCert })}
      />

      <Text className="mb-2 text-xs font-semibold uppercase text-muted">Target intake</Text>
      <ChipRow options={INTAKES} value={form.intake} onChange={(intake) => patch({ intake })} />

      <GradientButton
        text={loading ? "Saving…" : "Continue to documents"}
        loading={loading}
        onPress={() => void onSubmit()}
      />
    </SignupShell>
  );
}
