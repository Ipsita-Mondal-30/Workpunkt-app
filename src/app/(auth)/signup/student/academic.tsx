import { useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";

import { OptionSelect } from "@/components/auth/option-select";
import { SignupField, signupInputClass } from "@/components/auth/signup-field";
import { SignupShell } from "@/components/auth/signup-shell";
import { GradientButton } from "@/components/shared/gradient-button";
import { publicPostJson } from "@/lib/api/public-fetch";
import { studentAcademicCopy } from "@/lib/signup/copy";
import {
  PRIVATE_BOARD_OPTIONS,
  PRIVATE_INTAKE_FORM_OPTIONS,
  PRIVATE_LANGUAGE_CERT_OPTIONS,
  PRIVATE_QUALIFICATION_OPTIONS,
  PRIVATE_STUDY_LEVEL_OPTIONS,
} from "@/lib/signup/form-options";
import {
  loadPrivateDraft,
  savePrivateDraft,
  type PrivateAcademicDraft,
} from "@/lib/signup/private-draft";
import { useThemeColors } from "@/lib/theme/theme-context";
import { cn } from "@/lib/utils";

const EMPTY_FORM: PrivateAcademicDraft = {
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
};

type FieldErrors = Partial<Record<keyof PrivateAcademicDraft, string>>;

export default function StudentAcademicScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const copy = studentAcademicCopy;
  const [form, setForm] = useState<PrivateAcademicDraft>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deferring, setDeferring] = useState(false);

  useEffect(() => {
    void loadPrivateDraft().then((draft) => {
      if (draft?.academic) setForm({ ...EMPTY_FORM, ...draft.academic });
    });
  }, []);

  function patch(partial: Partial<PrivateAcademicDraft>) {
    setForm((prev) => ({ ...prev, ...partial }));
    setFieldErrors((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(partial) as Array<keyof PrivateAcademicDraft>) {
        delete next[key];
      }
      return next;
    });
  }

  function validate(): FieldErrors | null {
    const next: FieldErrors = {};
    if (!form.qualification) {
      next.qualification = "Select your current or most recent qualification from the list.";
    }
    if (!form.institution.trim()) next.institution = "Enter your school or college name.";
    if (!form.year.trim()) {
      next.year = "Enter the year of completion or expected completion.";
    } else if (!/^\d{4}$/.test(form.year.trim())) {
      next.year = "Use a four-digit year, for example 2025.";
    }
    if (!form.grade.trim()) next.grade = "Enter your percentage or CGPA.";
    if (!form.boards) next.boards = "Select your board from the list.";
    if (form.boards === "others" && !form.boardsOther?.trim()) {
      next.boardsOther = "Enter your board name.";
    }
    if (!form.studyGoal.trim()) {
      next.studyGoal = "Tell us what you would like to study in Germany.";
    }
    if (!form.studyLevel) next.studyLevel = "Select your preferred study level.";
    if (!form.languageCert) next.languageCert = "Select whether you have a language certificate.";
    if (!form.intake) next.intake = "Select a target intake from the list.";
    return Object.keys(next).length > 0 ? next : null;
  }

  async function onSubmit() {
    setError(null);
    const nextErrors = validate();
    setFieldErrors(nextErrors ?? {});
    if (nextErrors) return;

    const draft = await loadPrivateDraft();
    if (!draft?.signup) {
      setError("Signup details missing. Start again from student sign up.");
      return;
    }

    const academic: PrivateAcademicDraft = {
      ...form,
      institution: form.institution.trim(),
      year: form.year.trim(),
      grade: form.grade.trim(),
      studyGoal: form.studyGoal.trim(),
      boardsOther: form.boards === "others" ? form.boardsOther?.trim() ?? "" : "",
    };

    setLoading(true);
    try {
      await publicPostJson("/api/private/applications/draft", {
        signup: draft.signup,
        academic,
        ...(draft.reference?.trim() ? { reference: draft.reference.trim() } : {}),
      });
      await savePrivateDraft({ ...draft, academic });
      router.push("/(auth)/signup/student/upload");
    } catch (err) {
      await savePrivateDraft({ ...draft, academic });
      setError(err instanceof Error ? err.message : "Could not sync draft.");
      router.push("/(auth)/signup/student/upload");
    } finally {
      setLoading(false);
    }
  }

  async function onDefer() {
    setError(null);
    const draft = await loadPrivateDraft();
    if (!draft?.signup) {
      setError("Signup details missing. Start again from student sign up.");
      return;
    }

    setDeferring(true);
    try {
      await publicPostJson("/api/private/applications/defer", {
        signup: {
          ...draft.signup,
          source: draft.signup.source.trim() || "Website",
        },
        ...(draft.reference?.trim() ? { reference: draft.reference.trim() } : {}),
      });
      router.replace("/(auth)/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save your profile. Please try again.");
    } finally {
      setDeferring(false);
    }
  }

  const busy = loading || deferring;

  return (
    <SignupShell
      title={copy.title}
      subtitle={copy.subtitle}
      backHref="/(auth)/signup/student/check-email"
    >
      {error ? (
        <View className="mb-4 rounded-2xl bg-error/10 px-4 py-3">
          <Text className="text-sm text-error">{error}</Text>
        </View>
      ) : null}

      <SignupField
        label={copy.fields.qualification.label}
        error={fieldErrors.qualification}
        hint={copy.fields.qualification.hint}
      >
        <OptionSelect
          value={form.qualification}
          placeholder={copy.fields.qualification.placeholder}
          options={PRIVATE_QUALIFICATION_OPTIONS}
          onChange={(qualification) => patch({ qualification })}
          hasError={Boolean(fieldErrors.qualification)}
          disabled={busy}
        />
      </SignupField>

      <SignupField label={copy.fields.institution.label} error={fieldErrors.institution}>
        <TextInput
          placeholder={copy.fields.institution.placeholder}
          placeholderTextColor={colors.placeholder}
          value={form.institution}
          editable={!busy}
          onChangeText={(institution: string) => patch({ institution })}
          className={signupInputClass(Boolean(fieldErrors.institution))}
        />
      </SignupField>

      <SignupField label={copy.fields.year.label} error={fieldErrors.year} hint={copy.fields.year.hint}>
        <TextInput
          placeholder={copy.fields.year.placeholder}
          placeholderTextColor={colors.placeholder}
          keyboardType="number-pad"
          value={form.year}
          editable={!busy}
          onChangeText={(year: string) => patch({ year })}
          className={signupInputClass(Boolean(fieldErrors.year))}
        />
      </SignupField>

      <SignupField label={copy.fields.grade.label} error={fieldErrors.grade}>
        <TextInput
          placeholder={copy.fields.grade.placeholder}
          placeholderTextColor={colors.placeholder}
          value={form.grade}
          editable={!busy}
          onChangeText={(grade: string) => patch({ grade })}
          className={signupInputClass(Boolean(fieldErrors.grade))}
        />
      </SignupField>

      <SignupField label={copy.fields.boards.label} error={fieldErrors.boards ?? fieldErrors.boardsOther}>
        <OptionSelect
          value={form.boards}
          placeholder={copy.fields.boards.placeholder}
          options={PRIVATE_BOARD_OPTIONS}
          onChange={(boards) => patch({ boards, boardsOther: boards === "others" ? form.boardsOther : "" })}
          hasError={Boolean(fieldErrors.boards || fieldErrors.boardsOther)}
          disabled={busy}
        />
        {form.boards === "others" ? (
          <TextInput
            placeholder={copy.fields.boardsOther.placeholder}
            placeholderTextColor={colors.placeholder}
            value={form.boardsOther}
            editable={!busy}
            onChangeText={(boardsOther: string) => patch({ boardsOther })}
            className={cn(signupInputClass(Boolean(fieldErrors.boardsOther)), "mt-2")}
          />
        ) : null}
      </SignupField>

      <SignupField label={copy.fields.studyGoal.label} error={fieldErrors.studyGoal}>
        <TextInput
          placeholder={copy.fields.studyGoal.placeholder}
          placeholderTextColor={colors.placeholder}
          value={form.studyGoal}
          editable={!busy}
          onChangeText={(studyGoal: string) => patch({ studyGoal })}
          className={signupInputClass(Boolean(fieldErrors.studyGoal))}
        />
      </SignupField>

      <SignupField label={copy.fields.studyLevel.label} error={fieldErrors.studyLevel}>
        <OptionSelect
          value={form.studyLevel}
          placeholder={copy.fields.studyLevel.placeholder}
          options={PRIVATE_STUDY_LEVEL_OPTIONS}
          onChange={(studyLevel) => patch({ studyLevel })}
          hasError={Boolean(fieldErrors.studyLevel)}
          disabled={busy}
        />
      </SignupField>

      <SignupField label={copy.fields.languageCert.label} error={fieldErrors.languageCert}>
        <OptionSelect
          value={form.languageCert}
          placeholder={copy.fields.languageCert.placeholder}
          options={PRIVATE_LANGUAGE_CERT_OPTIONS}
          onChange={(languageCert) => patch({ languageCert })}
          hasError={Boolean(fieldErrors.languageCert)}
          disabled={busy}
        />
      </SignupField>

      <SignupField label={copy.fields.intake.label} error={fieldErrors.intake} hint={copy.fields.intake.hint}>
        <OptionSelect
          value={form.intake}
          placeholder={copy.fields.intake.placeholder}
          options={PRIVATE_INTAKE_FORM_OPTIONS}
          onChange={(intake) => patch({ intake })}
          hasError={Boolean(fieldErrors.intake)}
          disabled={busy}
        />
      </SignupField>

      <GradientButton
        text={loading ? "Saving…" : copy.submit}
        loading={loading}
        disabled={busy}
        onPress={() => void onSubmit()}
      />
      <Pressable disabled={busy} onPress={() => void onDefer()} className="mt-4 py-2">
        <Text className="text-center text-sm font-semibold text-brand-mid">
          {deferring ? "Saving…" : copy.skip}
        </Text>
      </Pressable>
    </SignupShell>
  );
}
