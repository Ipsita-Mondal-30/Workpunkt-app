import { useState } from "react";
import { Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";

import { GradientButton } from "@/components/shared/gradient-button";
import { UNIVERSITY_TYPE_OPTIONS, emptyEnrolledStudentForm, validateEnrolledStudentForm, type EnrolledStudentFormValues } from "@/lib/counsellor/student-form-schema";
import { queryKeys } from "@/lib/query/keys";
import { useApiMutation } from "@/lib/query/use-api";
import { cn } from "@/lib/utils";

function Field({ label, value, onChangeText, keyboardType = "default" }: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: "default" | "email-address" | "phone-pad";
}) {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-semibold text-text">{label}</Text>
      <TextInput value={value} onChangeText={onChangeText} keyboardType={keyboardType} placeholderTextColor="#71717a" className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text" />
    </View>
  );
}

export default function AgentAddStudentScreen() {
  const router = useRouter();
  const [form, setForm] = useState<EnrolledStudentFormValues>(() => ({
    ...emptyEnrolledStudentForm(),
    source: "Agent partner",
  }));
  const createStudent = useApiMutation<Record<string, unknown>, { message?: string }>(
    "/api/agent/students/create-application",
    [queryKeys.agentStudents(), queryKeys.agentStudentPrograms(), queryKeys.agentDashboard()],
  );

  function submit() {
    const validationError = validateEnrolledStudentForm(form);
    if (validationError) {
      Alert.alert("Check student details", validationError);
      return;
    }

    createStudent.mutate({
      name: form.name.trim(),
      email: form.email.trim(),
      phoneNumber: form.phoneNumber.trim(),
      source: form.source,
      universityType: form.universityType,
      paymentStatus: form.paymentStatus,
      academic: {
        studyLevel: form.studyLevel.trim(),
        intake: form.intake.trim(),
        programOfStudy: form.programOfStudy.trim(),
      },
    }, {
      onSuccess: (result) => {
        Alert.alert("Student added", result.message ?? "The application was created and linked to your account.", [
          { text: "View students", onPress: () => router.replace("/(agent)/students") },
        ]);
      },
      onError: (error) => Alert.alert("Could not add student", error.message),
    });
  }

  return (
    <ScrollView className="flex-1 bg-bg" contentContainerClassName="px-4 py-5 pb-12" keyboardShouldPersistTaps="handled">
      <Text className="text-2xl font-bold text-text">Add Student</Text>
      <Text className="mt-2 text-sm leading-5 text-muted">Create a student application under your partner account. Profile-credit rules are applied by your current plan.</Text>

      <View className="mt-5 rounded-2xl border border-border bg-surface px-4 py-4">
        <Text className="mb-4 text-base font-bold text-text">Student details</Text>
        <Field label="Full name" value={form.name} onChangeText={(value) => setForm((current) => ({ ...current, name: value }))} />
        <Field label="Email" value={form.email} onChangeText={(value) => setForm((current) => ({ ...current, email: value }))} keyboardType="email-address" />
        <Field label="Phone number" value={form.phoneNumber} onChangeText={(value) => setForm((current) => ({ ...current, phoneNumber: value }))} keyboardType="phone-pad" />
        <Field label="Intended program" value={form.programOfStudy} onChangeText={(value) => setForm((current) => ({ ...current, programOfStudy: value }))} />
      </View>

      <View className="mt-4 rounded-2xl border border-border bg-surface px-4 py-4">
        <Text className="mb-4 text-base font-bold text-text">Study preferences</Text>
        <Field label="Study level" value={form.studyLevel} onChangeText={(value) => setForm((current) => ({ ...current, studyLevel: value }))} />
        <Field label="Preferred intake" value={form.intake} onChangeText={(value) => setForm((current) => ({ ...current, intake: value }))} />
        <Text className="mb-2 text-sm font-semibold text-text">University type</Text>
        <View className="gap-2">
          {UNIVERSITY_TYPE_OPTIONS.map((option) => (
            <Pressable key={option.value} onPress={() => setForm((current) => ({ ...current, universityType: option.value }))} className={cn("rounded-xl border px-4 py-3", form.universityType === option.value ? "border-brand-mid bg-brand-mid/10" : "border-border bg-surface-end")}>
              <Text className={cn("text-sm font-semibold", form.universityType === option.value ? "text-brand-mid" : "text-text")}>{option.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View className="mt-5">
        <GradientButton text={createStudent.isPending ? "Creating application…" : "Create student application"} loading={createStudent.isPending} onPress={submit} />
      </View>
    </ScrollView>
  );
}
