import { useState } from "react";
import { Alert, Text, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { CounsellorScroll, SectionCard } from "@/components/counsellor/counsellor-scroll";
import { CounsellorScreenShell } from "@/components/counsellor/counsellor-screen-shell";
import { GradientButton } from "@/components/shared/gradient-button";
import { authFetch } from "@/lib/api/auth-fetch";
import {
  CP_GRADE_OPTIONS,
  UNIVERSITY_TYPE_OPTIONS,
  emptyCpStudentForm,
  emptyEnrolledStudentForm,
  validateCpStudentForm,
  validateEnrolledStudentForm,
  type CpStudentFormValues,
  type EnrolledStudentFormValues,
} from "@/lib/counsellor/student-form-schema";
import { useCounsellorContext } from "@/lib/counsellor/use-counsellor-context";

function FormField({
  label,
  value,
  onChangeText,
  keyboardType,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: "default" | "email-address" | "phone-pad";
  multiline?: boolean;
}) {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-semibold text-text">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        multiline={multiline}
        placeholderTextColor="#94a3b8"
        className="rounded-2xl border border-border bg-surface px-4 py-3 text-base text-text"
      />
    </View>
  );
}

export default function AddStudentScreen() {
  const router = useRouter();
  const { track: trackParam } = useLocalSearchParams<{ track?: string }>();
  const { refresh, careerPathingActive, counsellorAccessPaid } = useCounsellorContext();
  const track = trackParam === "enrolled" ? "enrolled" : "cp";
  const [loading, setLoading] = useState(false);
  const [cpForm, setCpForm] = useState<CpStudentFormValues>(emptyCpStudentForm());
  const [enrolledForm, setEnrolledForm] = useState<EnrolledStudentFormValues>(
    emptyEnrolledStudentForm(),
  );

  async function submitCp() {
    const error = validateCpStudentForm(cpForm);
    if (error) {
      Alert.alert("Validation", error);
      return;
    }

    setLoading(true);
    try {
      const response = await authFetch("/api/agent/career-pathing/students/create", {
        method: "POST",
        body: JSON.stringify({
          firstName: cpForm.name.split(" ")[0] ?? cpForm.name,
          lastName: cpForm.name.split(" ").slice(1).join(" ") || "—",
          email: cpForm.email,
          phoneNumber: cpForm.phone,
          currentGrade: `Grade ${cpForm.grade}`,
          stream: cpForm.stream,
          schoolName: cpForm.schoolName,
          parentName: cpForm.parentName,
          parentEmail: cpForm.parentEmail,
          parentPhone: cpForm.parentPhone,
          counsellorNotes: cpForm.notes,
          interests:
            cpForm.germanyInterest === "yes"
              ? ["Study in Germany after school"]
              : cpForm.germanyInterest === "no"
                ? ["Not sure yet"]
                : ["Explore university options"],
          parentConsent: true,
        }),
      });
      const json = (await response.json()) as { ok?: boolean; error?: string; message?: string };
      if (!response.ok || !json.ok) {
        throw new Error(json.error ?? "Could not create student.");
      }
      await refresh();
      Alert.alert("Success", json.message ?? "Student added.");
      router.back();
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Could not create student.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function submitEnrolled() {
    const error = validateEnrolledStudentForm(enrolledForm);
    if (error) {
      Alert.alert("Validation", error);
      return;
    }

    setLoading(true);
    try {
      const response = await authFetch("/api/agent/students/create-application", {
        method: "POST",
        body: JSON.stringify({
          name: enrolledForm.name,
          email: enrolledForm.email,
          phoneNumber: enrolledForm.phoneNumber,
          source: enrolledForm.source,
          universityType: enrolledForm.universityType,
          paymentStatus: enrolledForm.paymentStatus,
          academic: {
            studyLevel: enrolledForm.studyLevel,
            intake: enrolledForm.intake,
            programOfStudy: enrolledForm.programOfStudy,
          },
        }),
      });
      const json = (await response.json()) as { ok?: boolean; error?: string; message?: string };
      if (!response.ok || !json.ok) {
        throw new Error(json.error ?? "Could not create application.");
      }
      await refresh();
      Alert.alert("Success", json.message ?? "Application created.");
      router.back();
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Could not create application.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (track === "cp" && !careerPathingActive) {
    return (
      <CounsellorScreenShell title="Add student">
        <CounsellorScroll>
          <Text className="text-sm text-muted">
            Career Pathing must be active to add CP students.
          </Text>
        </CounsellorScroll>
      </CounsellorScreenShell>
    );
  }

  if (track === "enrolled" && !counsellorAccessPaid) {
    return (
      <CounsellorScreenShell title="Add student">
        <CounsellorScroll>
          <Text className="text-sm text-muted">
            Counselor Access is required to add enrolled students.
          </Text>
        </CounsellorScroll>
      </CounsellorScreenShell>
    );
  }

  return (
    <CounsellorScreenShell
      title={track === "cp" ? "Add CP student" : "Add enrolled student"}
      subtitle="Required fields only — add documents on web if needed."
    >
      <CounsellorScroll>
        {track === "cp" ? (
          <>
            <SectionCard title="Personal">
              <FormField label="Full name" value={cpForm.name} onChangeText={(v) => setCpForm((f) => ({ ...f, name: v }))} />
              <FormField label="Email" value={cpForm.email} onChangeText={(v) => setCpForm((f) => ({ ...f, email: v }))} keyboardType="email-address" />
              <FormField label="Phone" value={cpForm.phone} onChangeText={(v) => setCpForm((f) => ({ ...f, phone: v }))} keyboardType="phone-pad" />
              <FormField label="School name" value={cpForm.schoolName} onChangeText={(v) => setCpForm((f) => ({ ...f, schoolName: v }))} />
              <Text className="mb-2 text-sm font-semibold text-text">Grade</Text>
              <View className="mb-4 flex-row gap-2">
                {CP_GRADE_OPTIONS.map((option) => (
                  <GradientButton
                    key={option.value}
                    text={option.label}
                    className="flex-1"
                    onPress={() => setCpForm((f) => ({ ...f, grade: option.value }))}
                  />
                ))}
              </View>
              <FormField label="Stream / subjects" value={cpForm.stream} onChangeText={(v) => setCpForm((f) => ({ ...f, stream: v }))} />
            </SectionCard>
            <SectionCard title="Parent / guardian">
              <FormField label="Parent name" value={cpForm.parentName} onChangeText={(v) => setCpForm((f) => ({ ...f, parentName: v }))} />
              <FormField label="Parent email" value={cpForm.parentEmail} onChangeText={(v) => setCpForm((f) => ({ ...f, parentEmail: v }))} keyboardType="email-address" />
              <FormField label="Parent phone" value={cpForm.parentPhone} onChangeText={(v) => setCpForm((f) => ({ ...f, parentPhone: v }))} keyboardType="phone-pad" />
            </SectionCard>
            <SectionCard title="Counsellor notes">
              <FormField label="Notes" value={cpForm.notes} onChangeText={(v) => setCpForm((f) => ({ ...f, notes: v }))} multiline />
            </SectionCard>
            <GradientButton text="Create student" loading={loading} onPress={() => void submitCp()} />
          </>
        ) : (
          <>
            <SectionCard title="Student">
              <FormField label="Full name" value={enrolledForm.name} onChangeText={(v) => setEnrolledForm((f) => ({ ...f, name: v }))} />
              <FormField label="Email" value={enrolledForm.email} onChangeText={(v) => setEnrolledForm((f) => ({ ...f, email: v }))} keyboardType="email-address" />
              <FormField label="Phone" value={enrolledForm.phoneNumber} onChangeText={(v) => setEnrolledForm((f) => ({ ...f, phoneNumber: v }))} keyboardType="phone-pad" />
              <FormField label="Program of study" value={enrolledForm.programOfStudy} onChangeText={(v) => setEnrolledForm((f) => ({ ...f, programOfStudy: v }))} />
            </SectionCard>
            <SectionCard title="Academic">
              <FormField label="Study level" value={enrolledForm.studyLevel} onChangeText={(v) => setEnrolledForm((f) => ({ ...f, studyLevel: v }))} />
              <FormField label="Intake" value={enrolledForm.intake} onChangeText={(v) => setEnrolledForm((f) => ({ ...f, intake: v }))} />
              <Text className="mb-2 text-sm font-semibold text-text">University type</Text>
              <View className="mb-2 gap-2">
                {UNIVERSITY_TYPE_OPTIONS.map((option) => (
                  <GradientButton
                    key={option.value}
                    text={option.label}
                    onPress={() =>
                      setEnrolledForm((f) => ({ ...f, universityType: option.value }))
                    }
                  />
                ))}
              </View>
            </SectionCard>
            <GradientButton text="Create application" loading={loading} onPress={() => void submitEnrolled()} />
          </>
        )}
      </CounsellorScroll>
    </CounsellorScreenShell>
  );
}
