import { useState } from "react";
import { ActivityIndicator, Image, Text, View } from "react-native";
import { DetailSheet } from "@/components/shared/detail-sheet";
import { GradientButton } from "@/components/shared/gradient-button";
import { PortalIcon } from "@/components/portal/portal-ui";
import { openExternalUrl } from "@/lib/open-external-url";
import { resolvePublicUrl } from "@/lib/config/public-env";

export type PreviewDocument = { name: string; url: string; mimeType?: string };

export function DocumentPreview({ document, onClose }: { document: PreviewDocument; onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const isImage = /^image\/(jpeg|png|webp)$/i.test(document.mimeType ?? "") || /\.(jpe?g|png|webp)(\?|#|$)/i.test(document.name) || /\.(jpe?g|png|webp)(\?|#|$)/i.test(document.url);
  return (
    <DetailSheet visible title={document.name} onClose={onClose}>
      {isImage && !failed ? (
        <View className="mb-5 overflow-hidden rounded-2xl bg-surface-end">
          <Image source={{ uri: resolvePublicUrl(document.url) }} accessibilityLabel={`Preview of ${document.name}`} resizeMode="contain" style={{ width: "100%", height: 360 }} onLoadEnd={() => setLoading(false)} onError={() => setFailed(true)} />
          {loading ? <View className="absolute inset-0 items-center justify-center"><ActivityIndicator color="#ad46ff" /></View> : null}
        </View>
      ) : (
        <View className="mb-5 items-center rounded-2xl bg-brand-start/5 px-5 py-8">
          <PortalIcon name="file" size={36} />
          <Text className="mt-4 text-center text-base font-bold text-text">{failed ? "Preview unavailable" : "Your document is ready to open"}</Text>
          <Text className="mt-2 text-center text-sm leading-6 text-muted">{failed ? "This image could not be loaded here. Try opening the original file." : "PDFs and other files open in your browser or your device's document viewer."}</Text>
        </View>
      )}
      <GradientButton text="Open original file" onPress={() => void openExternalUrl(document.url)} />
    </DetailSheet>
  );
}
