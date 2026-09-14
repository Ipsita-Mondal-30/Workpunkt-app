import { useState } from "react";
import { Alert, Linking, Pressable, Text, View } from "react-native";
import * as DocumentPicker from "expo-document-picker";

import { GradientButton } from "@/components/shared/gradient-button";
import { ResourceScreen } from "@/components/shared/resource-screen";
import { getAccessToken } from "@/lib/api/auth-fetch";
import { useAuth } from "@/lib/auth/auth-context";
import { getApiBaseUrl } from "@/lib/config/public-env";
import { queryKeys } from "@/lib/query/keys";
import { PRIVATE_OPTIONAL_DOCUMENTS, PRIVATE_REQUIRED_DOCUMENTS } from "@/lib/signup/form-options";
import { collectDocuments, textValue } from "@/lib/student/presentation";
import { createUuid } from "@/lib/utils";

const DOCUMENTS = [...PRIVATE_REQUIRED_DOCUMENTS, ...PRIVATE_OPTIONAL_DOCUMENTS];

export default function StudentDocumentsScreen() {
  const { profile, user } = useAuth();
  const [uploading, setUploading] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function pickAndUpload(documentId: string, refetch: () => void) {
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      multiple: false,
      type: ["application/pdf", "image/jpeg", "image/png"],
    });
    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    setUploading(documentId);
    setMessage(null);
    try {
      const form = new FormData();
      form.append("documentId", documentId || `other-document-${createUuid()}`);
      form.append("email", profile?.email ?? user?.email ?? "");
      form.append("studentName", profile?.name ?? "Student");
      form.append("file", {
        uri: asset.uri,
        name: asset.name,
        type: asset.mimeType ?? "application/octet-stream",
      } as unknown as Blob);
      const token = await getAccessToken();
      const response = await fetch(`${getApiBaseUrl()}/api/private/documents/upload-proxy`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: form,
      });
      const json = (await response.json()) as { error?: string; data?: { fileName?: string } };
      if (!response.ok) throw new Error(json.error ?? "Upload failed.");
      setMessage(`${json.data?.fileName ?? asset.name} uploaded successfully.`);
      refetch();
    } catch (error) {
      Alert.alert("Upload failed", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setUploading(null);
    }
  }

  return (
    <ResourceScreen<unknown>
      title="Documents"
      subtitle="Upload documents and see everything already shared with Workpunkt."
      queryKey={queryKeys.studentDocuments()}
      path="/api/applications"
      staleTime={30_000}
    >
      {(data, { refetch }) => {
        const uploaded = collectDocuments(data);
        return (
          <View className="gap-5">
            <View className="rounded-2xl border border-border bg-surface px-4 py-4">
              <Text className="text-base font-bold text-text">Upload your documents</Text>
              <Text className="mt-1 text-xs leading-5 text-muted">PDF or JPG · You can upload incomplete and complete later.</Text>
              <View className="mt-4 gap-2">
                {DOCUMENTS.map((document) => {
                  const present = uploaded.some((item) => {
                    const label = textValue(item, "documentId", "id", "label").toLowerCase();
                    return label.includes(document.id);
                  });
                  return (
                    <Pressable
                      key={document.id}
                      disabled={Boolean(uploading)}
                      onPress={() => void pickAndUpload(document.id, refetch)}
                      className="flex-row items-center rounded-xl border border-border bg-surface-end px-3 py-3"
                    >
                      <Text className={present ? "text-success" : "text-brand-mid"}>{present ? "✓" : "+"}</Text>
                      <View className="ml-3 flex-1">
                        <Text className="text-sm font-semibold text-text">{document.title}</Text>
                        <Text className="mt-0.5 text-[11px] text-muted">{uploading === document.id ? "Uploading…" : document.hint || (present ? "Uploaded" : "Tap to choose")}</Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
              <View className="mt-3">
                <GradientButton
                  text={uploading?.startsWith("other-document-") ? "Uploading…" : "Upload other documents"}
                  disabled={Boolean(uploading)}
                  onPress={() => void pickAndUpload(`other-document-${createUuid()}`, refetch)}
                />
              </View>
              {message ? <Text className="mt-3 text-sm text-success">{message}</Text> : null}
            </View>

            <View>
              <Text className="mb-3 text-base font-bold text-text">Uploaded documents</Text>
              {uploaded.length === 0 ? (
                <View className="rounded-2xl border border-border bg-surface px-4 py-5">
                  <Text className="text-sm text-muted">No documents are attached to your application record yet.</Text>
                </View>
              ) : uploaded.map((item, index) => {
                const url = textValue(item, "downloadUrl", "url", "previewUrl");
                return (
                  <Pressable
                    key={textValue(item, "id", "storageKey") || String(index)}
                    disabled={!url}
                    onPress={() => void Linking.openURL(url)}
                    className="mb-2 flex-row items-center rounded-2xl border border-border bg-surface px-4 py-3"
                  >
                    <Text className="text-lg text-brand-mid">▤</Text>
                    <View className="ml-3 flex-1">
                      <Text className="text-sm font-semibold text-text">{textValue(item, "label", "documentId") || "Document"}</Text>
                      <Text className="mt-1 text-xs text-muted">{textValue(item, "fileName", "filename") || "Uploaded file"}</Text>
                    </View>
                    <Text className="text-xs font-bold text-brand-mid">{url ? "View" : "Saved"}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        );
      }}
    </ResourceScreen>
  );
}
