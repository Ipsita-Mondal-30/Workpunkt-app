import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import { useTheme } from "@/lib/theme/theme-context";
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
  const { isDark } = useTheme();
  return <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={90}><LinearGradient colors={isDark ? ["#15101d", "#09090b", "#120e14"] : ["#faf7ff", "#fffafb", "#ffffff"]} style={{ flex: 1 }}><ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 112 }} refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ba43ed" /> : undefined}><View style={{ width: "100%", maxWidth: 1080, alignSelf: "center" }}>{children}</View></ScrollView></LinearGradient></KeyboardAvoidingView>;
}

export function PageHeading({ title, subtitle, eyebrow = "YOUR WORKPUNKT PORTAL", action }: { title: string; subtitle?: string; eyebrow?: string; action?: ReactNode }) {
  return <View className="mb-6 gap-3"><Text className="text-[10px] font-bold uppercase tracking-[2px] text-brand-start">{eyebrow}</Text><View className="flex-row flex-wrap items-center justify-between gap-3"><Text accessibilityRole="header" className="shrink text-3xl font-bold tracking-tight text-text">{title}</Text>{action}</View>{subtitle ? <Text className="max-w-2xl text-sm leading-6 text-muted">{subtitle}</Text> : null}</View>;
}

export function PortalCard({ title, caption, children, className }: { title?: string; caption?: string; children?: ReactNode; className?: string }) {
  return <View className={cn("mb-4 rounded-3xl border border-border bg-surface p-5", className)}>{title ? <Text accessibilityRole="header" className="text-base font-bold text-text">{title}</Text> : null}{caption ? <Text className="mt-1 text-sm leading-5 text-muted">{caption}</Text> : null}{children}</View>;
}

export function PortalHero({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children?: ReactNode }) {
  const { isDark } = useTheme();
  return <View className="mb-6 overflow-hidden rounded-3xl border border-brand-start/20"><LinearGradient colors={isDark ? ["#291637", "#32172d", "#301d19"] : ["#f0e5ff", "#ffe8f3", "#fff0df"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ padding: 24 }}><View pointerEvents="none" accessible={false} style={{ position: "absolute", right: -45, top: -65, width: 190, height: 190, borderRadius: 95, borderWidth: 1, borderColor: "rgba(186,67,237,0.15)" }} /><Text className="text-[10px] font-bold uppercase tracking-[2px] text-brand-start">{eyebrow}</Text><Text className="mt-3 max-w-2xl text-3xl font-bold tracking-tight text-text">{title}</Text><Text className="mt-3 max-w-2xl text-sm leading-6 text-muted">{description}</Text>{children ? <View className="mt-5">{children}</View> : null}</LinearGradient></View>;
}

export function ActionTile({ title, description, icon, onPress }: { title: string; description: string; icon: PortalIconName; onPress: () => void }) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.72 : 1, flexGrow: 1, flexShrink: 1, flexBasis: 240 })} className="flex-row items-center gap-4 rounded-2xl border border-border bg-surface p-4"><View className="h-11 w-11 items-center justify-center rounded-2xl bg-brand-start/10"><PortalIcon name={icon} /></View><View className="flex-1"><Text className="text-sm font-bold text-text">{title}</Text><Text className="mt-1 text-xs leading-5 text-muted">{description}</Text></View><PortalIcon name="arrow" size={16} /></Pressable>;
}

export function ProgressBar({ value, label }: { value: number; label: string }) {
  const percent = Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0;
  return <View accessible accessibilityRole="progressbar" accessibilityLabel={label} accessibilityValue={{ min: 0, max: 100, now: percent }} className="h-2 overflow-hidden rounded-full bg-surface-end"><LinearGradient colors={["#ad46ff", "#f6339a", "#ff6900"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ width: `${percent}%`, height: 8, borderRadius: 8 }} /></View>;
}

export function EmptyState({ title, description, icon = "file", action }: { title: string; description: string; icon?: PortalIconName; action?: ReactNode }) {
  return <PortalCard><View className="items-center py-6"><View className="mb-4 h-14 w-14 items-center justify-center rounded-2xl bg-brand-start/10"><PortalIcon name={icon} size={26} /></View><Text className="text-center text-base font-bold text-text">{title}</Text><Text className="mt-2 max-w-md text-center text-sm leading-6 text-muted">{description}</Text>{action ? <View className="mt-5 w-full max-w-xs">{action}</View> : null}</View></PortalCard>;
}

export function LoadingCards() {
  return <View accessibilityLabel="Loading content" accessibilityState={{ busy: true }} className="gap-4">{[0, 1, 2].map((index) => <View key={index} className="rounded-3xl border border-border bg-surface p-5"><View className="mb-4 h-3 w-24 rounded-full bg-brand-start/10" /><View className="mb-3 h-5 w-3/4 rounded-full bg-surface-end" /><View className="h-3 w-1/2 rounded-full bg-surface-end" /></View>)}</View>;
}
