import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import { useTheme, useThemeColors } from "@/lib/theme/theme-context";
import { cn } from "@/lib/utils";

const PATHS = {
  home: "M3 10 12 3l9 7v11h-6v-7H9v7H3Z",
  people: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 4a4 4 0 0 1 0 8M22 21v-2a4 4 0 0 0-3-3.87M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0",
  file: "M14 2H5v20h14V7Zm0 0v5h5M8 12h8M8 16h6",
  target: "M22 12a10 10 0 1 1-10-10M18 12a6 6 0 1 1-6-6M12 12 22 2M17 2h5v5",
  book: "M12 7v14M3 3h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5v16h-5a4 4 0 0 0-4 2 4 4 0 0 0-4-2H3Z",
  chat: "M21 11a9 9 0 0 1-9 9H3l2-5a9 9 0 1 1 16-4ZM8 10h8M8 14h5",
  sparkle: "m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5ZM20 2v4M18 4h4",
  wallet: "M3 6h17v15H3V5a2 2 0 0 1 2-2h12M16 12h5v5h-5Z",
  bell: "M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4",
  arrow: "M5 12h14M13 6l6 6-6 6",
  back: "M19 12H5m6-6-6 6 6 6",
  check: "m5 12 4 4L19 6",
  close: "m6 6 12 12M6 18 18 6",
  menu: "M4 6h16M4 12h16M4 18h16",
  search: "M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
  upload: "M12 16V3m-5 5 5-5 5 5M3 16v5h18v-5",
  play: "m8 4 13 8-13 8Z",
  settings: "M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2",
  plus: "M12 5v14M5 12h14",
} as const;
export type PortalIconName = keyof typeof PATHS;

export function PortalIcon({ name, size = 20, color = "#ba43ed" }: { name: PortalIconName; size?: number; color?: string }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" accessible={false}><Path d={PATHS[name]} /></Svg>;
}

export function PortalPage({ children, refreshing = false, onRefresh }: { children: ReactNode; refreshing?: boolean; onRefresh?: () => void }) {
  const colors = useThemeColors();
  return <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={90}><LinearGradient colors={colors.pageGradient} style={{ flex: 1 }}><ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 112 }} refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brandStart} /> : undefined}><View style={{ width: "100%", maxWidth: 1080, alignSelf: "center" }}>{children}</View></ScrollView></LinearGradient></KeyboardAvoidingView>;
}

export function PageHeading({ title, subtitle, eyebrow = "YOUR WORKPUNKT PORTAL", action }: { title: string; subtitle?: string; eyebrow?: string; action?: ReactNode }) {
  const colors = useThemeColors();
  return (
    <View style={{ marginBottom: 24, gap: 12 }}>
      <Text
        style={{
          fontSize: 10,
          fontWeight: "700",
          letterSpacing: 2,
          textTransform: "uppercase",
          color: colors.brandStart,
        }}
      >
        {eyebrow}
      </Text>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <Text
          accessibilityRole="header"
          style={{
            flexShrink: 1,
            fontSize: 30,
            fontWeight: "700",
            letterSpacing: -0.4,
            color: colors.text,
          }}
        >
          {title}
        </Text>
        {action}
      </View>
      {subtitle ? (
        <Text style={{ maxWidth: 672, fontSize: 14, lineHeight: 24, color: colors.muted }}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

export function PortalCard({ title, caption, children, className }: { title?: string; caption?: string; children?: ReactNode; className?: string }) {
  const colors = useThemeColors();
  return (
    <View
      className={cn("mb-4 rounded-3xl p-5", className)}
      style={{ borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }}
    >
      {title ? (
        <Text accessibilityRole="header" style={{ fontSize: 16, fontWeight: "700", color: colors.text }}>
          {title}
        </Text>
      ) : null}
      {caption ? (
        <Text style={{ marginTop: 4, fontSize: 14, lineHeight: 20, color: colors.muted }}>
          {caption}
        </Text>
      ) : null}
      {children}
    </View>
  );
}

export function PortalHero({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children?: ReactNode }) {
  const colors = useThemeColors();
  return (
    <View
      style={{
        marginBottom: 24,
        overflow: "hidden",
        borderRadius: 24,
        borderWidth: 1,
        borderColor: "rgba(173, 70, 255, 0.2)",
      }}
    >
      <LinearGradient
        colors={colors.heroGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ padding: 24 }}
      >
        <View
          pointerEvents="none"
          accessible={false}
          style={{
            position: "absolute",
            right: -45,
            top: -65,
            width: 190,
            height: 190,
            borderRadius: 95,
            borderWidth: 1,
            borderColor: "rgba(186,67,237,0.15)",
          }}
        />
        <Text
          style={{
            fontSize: 10,
            fontWeight: "700",
            letterSpacing: 2,
            textTransform: "uppercase",
            color: colors.brandStart,
          }}
        >
          {eyebrow}
        </Text>
        <Text
          style={{
            marginTop: 12,
            maxWidth: 672,
            fontSize: 30,
            fontWeight: "700",
            letterSpacing: -0.4,
            color: colors.text,
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            marginTop: 12,
            maxWidth: 672,
            fontSize: 14,
            lineHeight: 24,
            color: colors.muted,
          }}
        >
          {description}
        </Text>
        {children ? <View style={{ marginTop: 20 }}>{children}</View> : null}
      </LinearGradient>
    </View>
  );
}

export function ActionTile({
  title,
  description,
  icon,
  onPress,
  width,
  variant = "row",
}: {
  title: string;
  description: string;
  icon: PortalIconName;
  onPress: () => void;
  /** Fixed width for horizontal rails (disables flex grow/wrap sizing). */
  width?: number;
  /** `rail` stacks content for peek carousels; `row` is the default list tile. */
  variant?: "row" | "rail";
}) {
  const { isDark, colors } = useTheme();
  const isRail = variant === "rail";
  const iconWell = isDark
    ? "rgba(186, 67, 237, 0.16)"
    : "rgba(173, 70, 255, 0.1)";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${description}`}
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.72 : 1,
        width: width ?? undefined,
        flexGrow: width != null ? 0 : 1,
        flexShrink: width != null ? 0 : 1,
        flexBasis: width != null ? undefined : 240,
        minHeight: isRail ? 156 : undefined,
        flexDirection: isRail ? "column" : "row",
        alignItems: isRail ? "stretch" : "center",
        justifyContent: isRail ? "space-between" : "flex-start",
        gap: isRail ? 0 : 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        padding: 16,
      })}
    >
      <View
        style={{
          height: 44,
          width: 44,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 16,
          backgroundColor: iconWell,
        }}
      >
        <PortalIcon name={icon} />
      </View>
      <View style={{ marginTop: isRail ? 12 : 0, flex: 1, minWidth: 0 }}>
        <Text
          numberOfLines={2}
          style={{
            fontSize: 14,
            fontWeight: "700",
            color: colors.text,
            lineHeight: 20,
          }}
        >
          {title}
        </Text>
        <Text
          numberOfLines={isRail ? 3 : 2}
          style={{
            marginTop: 4,
            fontSize: 12,
            lineHeight: 18,
            color: colors.muted,
          }}
        >
          {description}
        </Text>
      </View>
      <View
        style={{
          marginTop: isRail ? 12 : 0,
          alignItems: isRail ? "flex-end" : "center",
        }}
      >
        <PortalIcon name="arrow" size={16} />
      </View>
    </Pressable>
  );
}

export function ProgressBar({ value, label }: { value: number; label: string }) {
  const percent = Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0;
  return <View accessible accessibilityRole="progressbar" accessibilityLabel={label} accessibilityValue={{ min: 0, max: 100, now: percent }} className="h-2 overflow-hidden rounded-full bg-surface-end"><LinearGradient colors={["#ad46ff", "#f6339a", "#ff6900"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ width: `${percent}%`, height: 8, borderRadius: 8 }} /></View>;
}

export function EmptyState({ title, description, icon = "file", action }: { title: string; description: string; icon?: PortalIconName; action?: ReactNode }) {
  const colors = useThemeColors();
  return (
    <PortalCard>
      <View style={{ alignItems: "center", paddingVertical: 24 }}>
        <View
          style={{
            marginBottom: 16,
            height: 56,
            width: 56,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 16,
            backgroundColor: "rgba(173, 70, 255, 0.1)",
          }}
        >
          <PortalIcon name={icon} size={26} />
        </View>
        <Text style={{ textAlign: "center", fontSize: 16, fontWeight: "700", color: colors.text }}>
          {title}
        </Text>
        <Text
          style={{
            marginTop: 8,
            maxWidth: 448,
            textAlign: "center",
            fontSize: 14,
            lineHeight: 24,
            color: colors.muted,
          }}
        >
          {description}
        </Text>
        {action ? <View style={{ marginTop: 20, width: "100%", maxWidth: 320 }}>{action}</View> : null}
      </View>
    </PortalCard>
  );
}

export function LoadingCards() {
  const colors = useThemeColors();
  return (
    <View accessibilityLabel="Loading content" accessibilityState={{ busy: true }} style={{ gap: 16 }}>
      {[0, 1, 2].map((index) => (
        <View
          key={index}
          style={{
            borderRadius: 24,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.surface,
            padding: 20,
          }}
        >
          <View
            style={{
              marginBottom: 16,
              height: 12,
              width: 96,
              borderRadius: 999,
              backgroundColor: "rgba(173, 70, 255, 0.1)",
            }}
          />
          <View
            style={{
              marginBottom: 12,
              height: 20,
              width: "75%",
              borderRadius: 999,
              backgroundColor: colors.surfaceEnd,
            }}
          />
          <View
            style={{
              height: 12,
              width: "50%",
              borderRadius: 999,
              backgroundColor: colors.surfaceEnd,
            }}
          />
        </View>
      ))}
    </View>
  );
}
