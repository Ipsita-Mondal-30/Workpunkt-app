import type { ReactNode } from "react";
import {
  Pressable,
  Text,
  View,
} from "react-native";
import { LoadingCards, PortalPage } from "@/components/portal/portal-ui";

type CounsellorScrollProps = {
  children: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  loading?: boolean;
  error?: string | null;
};

export function CounsellorScroll({
  children,
  refreshing = false,
  onRefresh,
  loading = false,
  error,
}: CounsellorScrollProps) {
  if (loading) {
    return (
      <PortalPage><LoadingCards /></PortalPage>
    );
  }

  return (
    <PortalPage refreshing={refreshing} onRefresh={onRefresh}>
      {error ? (
        <View className="mb-4 rounded-2xl bg-error/10 px-4 py-3">
          <Text className="text-sm text-error">{error}</Text>
        </View>
      ) : null}
      {children}
    </PortalPage>
  );
}

export function SectionCard({
  title,
  subtitle,
  children,
  accent = false,
}: {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  accent?: boolean;
}) {
  return (
    <View
      className={`mb-4 rounded-3xl border px-5 py-5 ${
        accent ? "border-brand-mid/35 bg-brand-mid/5" : "border-border bg-surface"
      }`}
    >
      <Text className="text-xs font-bold uppercase tracking-wider text-brand-mid">
        {title}
      </Text>
      {subtitle ? (
        <Text className="mt-2 text-base leading-6 text-muted">{subtitle}</Text>
      ) : null}
      {children}
    </View>
  );
}

export function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <View className="rounded-2xl border border-border bg-bg px-4 py-3">
      <Text className="text-xs font-semibold uppercase text-muted">{label}</Text>
      <Text className="mt-1 text-lg font-bold text-text">{value}</Text>
    </View>
  );
}

export function ListRow({
  title,
  subtitle,
  badge,
  onPress,
}: {
  title: string;
  subtitle?: string;
  badge?: string;
  onPress?: () => void;
}) {
  const content = (
    <>
      <Text className="text-base font-semibold text-text">{title}</Text>
      {subtitle ? <Text className="mt-1 text-sm text-muted">{subtitle}</Text> : null}
      {badge ? (
        <Text className="mt-2 text-xs font-bold uppercase text-brand-mid">{badge}</Text>
      ) : null}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        className="mb-3 rounded-2xl border border-border bg-surface px-4 py-4"
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View className="mb-3 rounded-2xl border border-border bg-surface px-4 py-4">
      {content}
    </View>
  );
}
