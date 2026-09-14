import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";
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
import { DocumentPreview, type PreviewDocument } from "@/components/portal/document-preview";
import { EmptyState, PortalIcon, ProgressBar } from "@/components/portal/portal-ui";

const DOCUMENTS = [...PRIVATE_REQUIRED_DOCUMENTS, ...PRIVATE_OPTIONAL_DOCUMENTS];

export default function StudentDocumentsScreen() {
  const { profile, user } = useAuth();
  const [uploading, setUploading] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewDocument | null>(null);

  async function pickAndUpload(documentId: string, refetch: () => Promise<void>) {
    if (uploading) return;
    setUploading(documentId);
    setMessage(null);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: false,
        type: ["application/pdf", "image/jpeg", "image/png"],
      });
      if (result.canceled || !result.assets[0]) return;

      const asset = result.assets[0];
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
      await refetch();
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
        const hasDocument = (id: string) => uploaded.some((item) => textValue(item, "documentId", "id", "label").toLowerCase().includes(id));
        const requiredCount = PRIVATE_REQUIRED_DOCUMENTS.filter((document) => hasDocument(document.id)).length;
        return (
          <View className="gap-5">
            <View className="rounded-3xl border border-brand-start/20 bg-brand-start/5 p-5">
              <View className="mb-3 flex-row items-center justify-between gap-3"><Text className="flex-1 text-sm font-bold text-text">Required documents shared</Text><Text className="font-bold text-brand-start">{requiredCount} / {PRIVATE_REQUIRED_DOCUMENTS.length}</Text></View>
              <ProgressBar value={PRIVATE_REQUIRED_DOCUMENTS.length ? requiredCount / PRIVATE_REQUIRED_DOCUMENTS.length * 100 : 0} label="Required documents shared" />
              <Text className="mt-3 text-xs leading-5 text-muted">Based on files visible in your application. Uploaded files still need review by your counsellor.</Text>
            </View>
            <View className="rounded-3xl border border-border bg-surface p-5">
              <Text className="text-base font-bold text-text">Upload your documents</Text>
              <Text className="mt-1 text-xs leading-5 text-muted">PDF, JPG or PNG. Start with the documents you have and return for the rest.</Text>
              <View className="mt-4 gap-2">
                {DOCUMENTS.map((document) => {
                  const present = hasDocument(document.id);
                  return (
                    <Pressable
                      key={document.id}
                      accessibilityRole="button"
                      accessibilityLabel={`${document.title}, ${present ? "uploaded" : "not uploaded"}. Choose a file to upload.`}
                      accessibilityState={{ disabled: Boolean(uploading), busy: uploading === document.id }}
                      disabled={Boolean(uploading)}
                      onPress={() => void pickAndUpload(document.id, refetch)}
                      className="flex-row items-center rounded-xl border border-border bg-surface-end px-3 py-3"
                    >
                      {uploading === document.id ? <ActivityIndicator size="small" color="#ad46ff" /> : <PortalIcon name={present ? "check" : "upload"} color={present ? "#16a34a" : "#ad46ff"} />}
                      <View className="ml-3 flex-1">
                        <Text className="text-sm font-semibold text-text">{document.title}</Text>
                        <Text className="mt-0.5 text-[11px] text-muted">{uploading === document.id ? "Choosing or uploading file…" : present ? "Uploaded · Tap to upload another file" : document.hint || "Tap to choose"}</Text>
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
              {message ? <Text accessibilityLiveRegion="polite" className="mt-3 text-sm text-success">{message}</Text> : null}
            </View>

            <View>
              <Text className="mb-3 text-base font-bold text-text">Uploaded documents</Text>
              {uploaded.length === 0 ? (
                <EmptyState icon="upload" title="Your documents belong here." description="No files are visible in your application yet. Choose a document above to get started." />
              ) : uploaded.map((item, index) => {
                const url = textValue(item, "downloadUrl", "url", "previewUrl");
                return (
                  <Pressable
                    key={textValue(item, "id", "storageKey") || String(index)}
                    accessibilityRole="button"
                    disabled={!url}
                    onPress={() => setPreview({ url, name: textValue(item, "fileName", "filename", "label") || "Document", mimeType: textValue(item, "mimeType", "contentType") })}
                    className="mb-2 flex-row items-center rounded-2xl border border-border bg-surface px-4 py-3"
                  >
                    <PortalIcon name="file" />
                    <View className="ml-3 flex-1">
                      <Text className="text-sm font-semibold text-text">{textValue(item, "label", "documentId") || "Document"}</Text>
                      <Text className="mt-1 text-xs text-muted">{textValue(item, "fileName", "filename") || "Uploaded file"}</Text>
                    </View>
                    <Text className="text-xs font-bold text-brand-mid">{url ? "View" : "Saved"}</Text>
                  </Pressable>
                );
              })}
            </View>
            {preview ? <DocumentPreview key={preview.url} document={preview} onClose={() => setPreview(null)} /> : null}
          </View>
        );
      }}
    </ResourceScreen>
  );
}
