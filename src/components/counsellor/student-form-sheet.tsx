import { useEffect, useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";

import { DetailSheet } from "@/components/shared/detail-sheet";
import { GradientButton } from "@/components/shared/gradient-button";
import { queryKeys } from "@/lib/query/keys";
import { useApiMutation } from "@/lib/query/use-api";

type StudentFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
};

const EMPTY_FORM: StudentFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  dateOfBirth: "",
  gender: "",
};

type StudentFormSheetProps = {
  visible: boolean;
  mode: "create" | "edit";
  initialName?: string;
  schoolStudentId?: string | null;
  onClose: () => void;
  onSaved: () => void;
};

function splitName(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 1) {
    return { firstName: parts[0] ?? "", lastName: "" };
  }
  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  };
}

export function StudentFormSheet({
  visible,
  mode,
  initialName = "",
  schoolStudentId,
  onClose,
  onSaved,
}: StudentFormSheetProps) {
  const [form, setForm] = useState<StudentFormValues>(EMPTY_FORM);

  useEffect(() => {
    if (!visible) return;
    if (mode === "edit" && initialName) {
      const { firstName, lastName } = splitName(initialName);
      setForm({ ...EMPTY_FORM, firstName, lastName });
      return;
    }
    setForm(EMPTY_FORM);
  }, [visible, mode, initialName]);

  const createMutation = useApiMutation<StudentFormValues>(
    "/api/agent/career-pathing/students/create",
    [queryKeys.agentCareerPathing()],
  );

  const updateMutation = useApiMutation<StudentFormValues & { schoolStudentId: string }>(
    "/api/agent/career-pathing/students/update",
    [queryKeys.agentCareerPathing()],
  );

  const pending = createMutation.isPending || updateMutation.isPending;

  function updateField<K extends keyof StudentFormValues>(key: K, value: StudentFormValues[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSave() {
    if (!form.firstName.trim() && !form.lastName.trim()) {
      Alert.alert("Missing name", "Enter the student's first or last name.");
      return;
    }
    if (!form.email.trim()) {
      Alert.alert("Missing email", "Student email is required.");
      return;
    }
    if (!form.dateOfBirth.trim()) {
      Alert.alert("Missing date of birth", "Use DD/MM/YYYY format.");
      return;
    }

    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phoneNumber: form.phoneNumber.trim(),
      dateOfBirth: form.dateOfBirth.trim(),
      gender: form.gender.trim(),
    };

    if (mode === "edit") {
      if (!schoolStudentId) {
        Alert.alert("Cannot edit", "This student is not linked for editing yet.");
        return;
      }
      updateMutation.mutate(
        { ...payload, schoolStudentId },
        {
          onSuccess: () => {
            onSaved();
            onClose();
          },
          onError: (error) => Alert.alert("Error", error.message),
        },
      );
      return;
    }

    createMutation.mutate(payload, {
      onSuccess: () => {
        onSaved();
        onClose();
      },
      onError: (error) => Alert.alert("Error", error.message),
    });
  }

  return (
    <DetailSheet
      visible={visible}
      title={mode === "create" ? "Add student" : "Edit student"}
      onClose={onClose}
    >
      <View className="gap-3">
        <TextInput
          value={form.firstName}
          onChangeText={(value) => updateField("firstName", value)}
          placeholder="First name"
          placeholderTextColor="#71717a"
          className="rounded-xl border border-border bg-surface px-3 py-3 text-sm text-text"
        />
        <TextInput
          value={form.lastName}
          onChangeText={(value) => updateField("lastName", value)}
          placeholder="Last name"
          placeholderTextColor="#71717a"
          className="rounded-xl border border-border bg-surface px-3 py-3 text-sm text-text"
        />
        <TextInput
          value={form.email}
          onChangeText={(value) => updateField("email", value)}
          placeholder="Email"
          placeholderTextColor="#71717a"
          autoCapitalize="none"
          keyboardType="email-address"
          className="rounded-xl border border-border bg-surface px-3 py-3 text-sm text-text"
        />
        <TextInput
          value={form.dateOfBirth}
          onChangeText={(value) => updateField("dateOfBirth", value)}
          placeholder="Date of birth (DD/MM/YYYY)"
          placeholderTextColor="#71717a"
          className="rounded-xl border border-border bg-surface px-3 py-3 text-sm text-text"
        />
        <TextInput
          value={form.phoneNumber}
          onChangeText={(value) => updateField("phoneNumber", value)}
          placeholder="Phone (optional)"
          placeholderTextColor="#71717a"
          keyboardType="phone-pad"
          className="rounded-xl border border-border bg-surface px-3 py-3 text-sm text-text"
        />
        <TextInput
          value={form.gender}
          onChangeText={(value) => updateField("gender", value)}
          placeholder="Gender (optional)"
          placeholderTextColor="#71717a"
          className="rounded-xl border border-border bg-surface px-3 py-3 text-sm text-text"
        />

        <GradientButton
          text={pending ? "Saving…" : mode === "create" ? "Add student" : "Save changes"}
          loading={pending}
          onPress={handleSave}
        />

        {mode === "edit" && !schoolStudentId ? (
          <Pressable onPress={onClose}>
            <Text className="text-center text-xs text-muted">
              This roster entry cannot be edited until the school student record is linked.
            </Text>
          </Pressable>
        ) : null}
      </View>
    </DetailSheet>
  );
}
