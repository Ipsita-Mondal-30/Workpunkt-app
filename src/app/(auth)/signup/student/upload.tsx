import { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";

import { SignupShell } from "@/components/auth/signup-shell";
import { GradientButton } from "@/components/shared/gradient-button";
import { getAccessToken } from "@/lib/api/auth-fetch";
import { publicPostJson } from "@/lib/api/public-fetch";
import {
  clearPrivateDraft,
  loadPrivateDraft,
} from "@/lib/signup/private-draft";

const REQUIRED = [
  { id: "marksheets", label: "Marksheets" },
  { id: "passport", label: "Passport" },
  { id: "photograph", label: "Photograph" },
] as const;

const OPTIONAL = [
  { id: "cv", label: "CV" },
  { id: "language", label: "Language certificate" },
] as const;

type PickedDoc = { id: string; fileName: string; uri: string; mimeType?: string };

const apiBase = (process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000").replace(
  /\/$/,
  "",
);

export default function StudentUploadScreen() {
  const router = useRouter();
  const [docs, setDocs] = useState<Record<string, PickedDoc>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function pick(docId: string) {
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    setDocs((prev) => ({
      ...prev,
      [docId]: {
        id: docId,
        fileName: asset.name,
        uri: asset.uri,
        mimeType: asset.mimeType ?? undefined,
      },
    }));
  }

  async function uploadOne(doc: PickedDoc, email: string, studentName: string, phone: string) {
    const form = new FormData();
    form.append("documentId", doc.id);
    form.append("email", email);
    form.append("studentName", studentName);
    form.append("phone", phone);
    form.append("file", {
      uri: doc.uri,
      name: doc.fileName,
      type: doc.mimeType || "application/octet-stream",
    } as unknown as Blob);

    const token = await getAccessToken();
    const headers: HeadersInit = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(`${apiBase}/api/private/documents/upload`, {
      method: "POST",
      headers,
      body: form,
    });
    const json = (await response.json()) as { error?: string };
    if (!response.ok) {
      throw new Error(json.error ?? `Upload failed for ${doc.id}`);
    }
  }

  async function onSubmit(incomplete = false) {
    setError(null);
    const draft = await loadPrivateDraft();
    if (!draft?.signup || !draft.academic) {
      setError("Application draft incomplete. Go back and finish academic details.");
      return;
    }

    for (const required of REQUIRED) {
      if (!docs[required.id] && !incomplete) {
        setError(`Please upload ${required.label}.`);
        return;
      }
    }

    setLoading(true);
    try {
      const studentName = `${draft.signup.firstName} ${draft.signup.lastName}`.trim();
      const uploaded: Array<{ id: string; fileName: string }> = [];

      for (const doc of Object.values(docs)) {
        await uploadOne(doc, draft.signup.email, studentName, draft.signup.mobile);
        uploaded.push({ id: doc.id, fileName: doc.fileName });
      }

      await publicPostJson("/api/private/applications", {
        signup: draft.signup,
        academic: draft.academic,
        reference: draft.reference,
        documents: uploaded,
        submittedIncomplete: incomplete,
      });

      await clearPrivateDraft();
      router.replace({
        pathname: "/(auth)/signup/student/submitted",
        params: {
          email: draft.signup.email,
          ref: draft.reference ?? "",
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submit failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SignupShell
      title="Upload documents"
      subtitle="Required: marksheets, passport, and photograph."
      backHref="/(auth)/signup/student/academic"
    >
      {error ? (
        <View className="mb-4 rounded-2xl bg-error/10 px-4 py-3">
          <Text className="text-sm text-error">{error}</Text>
        </View>
      ) : null}

      {[...REQUIRED, ...OPTIONAL].map((doc) => (
        <Pressable
          key={doc.id}
          onPress={() => void pick(doc.id)}
          className="mb-3 rounded-2xl border border-border bg-surface px-4 py-4"
        >
          <Text className="text-sm font-semibold text-text">{doc.label}</Text>
          <Text className="mt-1 text-xs text-muted">
            {docs[doc.id]?.fileName ?? "Tap to choose a file"}
          </Text>
        </Pressable>
      ))}

      <GradientButton
        text={loading ? "Submitting…" : "Submit application"}
        loading={loading}
        onPress={() => void onSubmit(false)}
      />
      <View className="h-3" />
      <Pressable
        onPress={() =>
          Alert.alert(
            "Submit incomplete?",
            "You can submit now and upload remaining documents later.",
            [
              { text: "Cancel", style: "cancel" },
              { text: "Submit incomplete", onPress: () => void onSubmit(true) },
            ],
          )
        }
      >
        <Text className="text-center text-sm font-semibold text-brand-mid">
          Submit incomplete
        </Text>
      </Pressable>
    </SignupShell>
  );
}
