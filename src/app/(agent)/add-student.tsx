import { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { FormField } from "@/components/portal/form-field";
import { PageHeading, PortalCard, PortalIcon, PortalPage } from "@/components/portal/portal-ui";
import { GradientButton } from "@/components/shared/gradient-button";
import { UNIVERSITY_TYPE_OPTIONS, emptyEnrolledStudentForm, type EnrolledStudentFormValues } from "@/lib/counsellor/student-form-schema";
import { queryKeys } from "@/lib/query/keys";
import { useApiMutation } from "@/lib/query/use-api";
import { cn } from "@/lib/utils";

type FieldErrors = Partial<Record<keyof EnrolledStudentFormValues, string>>;

function validate(form: EnrolledStudentFormValues): FieldErrors {
  const errors: FieldErrors = {};
  if (!form.name.trim()) errors.name = "Enter the student's full name.";
  if (!form.email.trim()) errors.email = "Enter the student's email address.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = "Enter a valid email address.";
  if (!form.phoneNumber.trim()) errors.phoneNumber = "Enter a contact phone number.";
  return errors;
}

export default function AgentAddStudentScreen() {
  const router = useRouter();
  const [form, setForm] = useState<EnrolledStudentFormValues>(() => ({
    ...emptyEnrolledStudentForm(),
    source: "Agent partner",
  }));
  const [submitted, setSubmitted] = useState(false);
  const errors = submitted ? validate(form) : {};
  const createStudent = useApiMutation<Record<string, unknown>, { message?: string }>(
    "/api/agent/students/create-application",
    [queryKeys.agentStudents(), queryKeys.agentStudentPrograms(), queryKeys.agentDashboard()],
  );

  function update<K extends keyof EnrolledStudentFormValues>(key: K, value: EnrolledStudentFormValues[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function submit() {
    if (createStudent.isPending) return;
    setSubmitted(true);
    if (Object.keys(validate(form)).length) return;
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
    });
  }

  return (
    <PortalPage>
      <PageHeading eyebrow="GROW YOUR STUDENT COMMUNITY" title="A new journey starts here."
        subtitle="Create a student application under your partner account. Required fields are marked with *."
        action={<Pressable accessibilityRole="button" onPress={() => router.back()} className="min-h-11 flex-row items-center gap-2 rounded-full border border-border bg-surface px-4"><PortalIcon name="back" size={16} /><Text className="text-sm font-semibold text-text">Back</Text></Pressable>}
      />
      <View className="flex-row flex-wrap gap-5">
        <View style={{ flexBasis: 380, flexGrow: 2, flexShrink: 1 }}>
          <PortalCard title="01 / Student details" caption="Use the student's own contact details for their application.">
            <View className="mt-5">
              <FormField label="Full name" required value={form.name} error={errors.name} onChangeText={(value) => update("name", value)} placeholder="Student's full name" autoCapitalize="words" autoComplete="name" editable={!createStudent.isPending} />
              <FormField label="Email address" required value={form.email} error={errors.email} onChangeText={(value) => update("email", value)} placeholder="student@example.com" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" editable={!createStudent.isPending} />
              <FormField label="Phone number" required value={form.phoneNumber} error={errors.phoneNumber} onChangeText={(value) => update("phoneNumber", value)} placeholder="+91 98765 43210" keyboardType="phone-pad" autoComplete="tel" editable={!createStudent.isPending} />
            </View>
          </PortalCard>
          <PortalCard title="02 / Study preferences" caption="Add what you know about their plans.">
            <View className="mt-5">
              <FormField label="Intended program" value={form.programOfStudy} onChangeText={(value) => update("programOfStudy", value)} placeholder="e.g. Computer Science" editable={!createStudent.isPending} />
              <FormField label="Study level" value={form.studyLevel} onChangeText={(value) => update("studyLevel", value)} placeholder="e.g. Bachelor or Master" editable={!createStudent.isPending} />
              <FormField label="Preferred intake" value={form.intake} onChangeText={(value) => update("intake", value)} placeholder="e.g. Winter" editable={!createStudent.isPending} />
              <Text className="mb-3 text-sm font-semibold text-text">University type</Text>
              <View className="flex-row flex-wrap gap-2">
                {UNIVERSITY_TYPE_OPTIONS.map((option) => (
                  <Pressable key={option.value} accessibilityRole="radio" accessibilityState={{ checked: form.universityType === option.value, disabled: createStudent.isPending }} disabled={createStudent.isPending} onPress={() => update("universityType", option.value)}
                    className={cn("min-h-12 flex-row items-center gap-2 rounded-2xl border px-4 py-3", form.universityType === option.value ? "border-brand-start bg-brand-start/10" : "border-border bg-surface-end")}>
                    {form.universityType === option.value ? <PortalIcon name="check" size={16} /> : null}
                    <Text className={cn("text-sm font-semibold", form.universityType === option.value ? "text-brand-start" : "text-text")}>{option.label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </PortalCard>
        </View>
        <View style={{ flexBasis: 240, flexGrow: 1, flexShrink: 1 }}>
          <PortalCard title="Before you submit" className="border-brand-start/20 bg-brand-start/5">
            <View className="mt-4 gap-4">
              <PortalIcon name="people" size={28} />
              <Text className="text-sm leading-6 text-muted">The application will be linked to your partner account. Your current plan's profile-credit rules apply.</Text>
              <Text className="text-sm leading-6 text-muted">Double-check the email address and phone number before creating the application.</Text>
              {Object.keys(errors).length ? <Text accessibilityRole="alert" className="text-sm text-error">Please correct the highlighted fields.</Text> : null}
              {createStudent.error ? <Text accessibilityRole="alert" className="text-sm text-error">{createStudent.error.message}</Text> : null}
              <GradientButton text="Create student application" accessibilityLabel={createStudent.isPending ? "Creating application" : "Create student application"} loading={createStudent.isPending} onPress={submit} />
            </View>
          </PortalCard>
        </View>
      </View>
    </PortalPage>
  );
}
