import { useState } from "react";
import { Pressable, Share, Text, View } from "react-native";
import * as Clipboard from "expo-clipboard";

import { GradientButton } from "@/components/shared/gradient-button";
import { startMobileCheckout } from "@/lib/stripe/mobile-checkout";
import { useThemeColors } from "@/lib/theme/theme-context";
import { cn } from "@/lib/utils";

export type KlaraMatchProgram = {
  programRecordId?: string;
  universityName: string;
  programName: string;
  reason: string;
};

type KlaraMatchResultsProps = {
  programs: KlaraMatchProgram[];
  emailSent?: boolean | null;
  emailError?: string | null;
  onBookCounselling?: () => void;
  className?: string;
};

function formatProgramsPlainText(programs: KlaraMatchProgram[]) {
  return [
    "Your Workpunkt free university matches",
    "",
    ...programs.map(
      (program, index) =>
        `${index + 1}. ${program.universityName}\n   ${program.programName}\n   ${program.reason}`,
    ),
    "",
    "Book counselling in the Workpunkt app (Ask Klara → counsellor chat).",
    "Detailed personalised report: €29 (checkout in app).",
  ].join("\n");
}

/** Mobile port of website `KlaraMatchResults` (copy / share / report CTA). */
export function KlaraMatchResults({
  programs,
  emailSent = null,
  emailError = null,
  onBookCounselling,
  className,
}: KlaraMatchResultsProps) {
  const colors = useThemeColors();
  const [copied, setCopied] = useState(false);
  const [reportBusy, setReportBusy] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  if (!programs.length) return null;

  async function handleCopy() {
    const text = formatProgramsPlainText(programs);
    try {
      await Clipboard.setStringAsync(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      await Share.share({ message: text });
    }
  }

  async function handleShare() {
    await Share.share({ message: formatProgramsPlainText(programs) });
  }

  async function handleBuyReport() {
    setReportBusy(true);
    setReportError(null);
    const result = await startMobileCheckout("report");
    setReportBusy(false);
    if (!result.ok) {
      setReportError(result.error);
    }
  }

  return (
    <View
      className={cn("mt-2 rounded-2xl border px-3 py-3", className)}
      style={{ backgroundColor: colors.surface, borderColor: colors.border }}
    >
      <View className="mb-2 flex-row items-center justify-between gap-2">
        <Text className="flex-1 text-sm font-bold text-text">
          {programs.length === 1
            ? "Your 1 university match"
            : `Your ${programs.length} university matches`}
        </Text>
        <View className="flex-row gap-2">
          <Pressable
            onPress={() => void handleCopy()}
            className="rounded-lg px-2 py-1"
            style={{ backgroundColor: colors.surfaceEnd }}
          >
            <Text className="text-[11px] font-semibold text-brand-mid">
              {copied ? "Copied" : "Copy"}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => void handleShare()}
            className="rounded-lg px-2 py-1"
            style={{ backgroundColor: colors.surfaceEnd }}
          >
            <Text className="text-[11px] font-semibold text-brand-mid">Share</Text>
          </Pressable>
        </View>
      </View>

      {emailSent ? (
        <Text className="mb-2 text-xs text-muted">We also emailed these matches to you.</Text>
      ) : null}
      {emailSent === false && emailError ? (
        <Text className="mb-2 text-xs text-error">{emailError}</Text>
      ) : null}

      <View className="gap-2">
        {programs.map((program, index) => (
          <View
            key={program.programRecordId ?? `${program.universityName}-${index}`}
            className="rounded-xl border px-3 py-2.5"
            style={{ backgroundColor: colors.surfaceEnd, borderColor: colors.border }}
          >
            <Text className="text-sm font-semibold text-text">{program.universityName}</Text>
            <Text className="mt-0.5 text-xs font-medium text-brand-mid">{program.programName}</Text>
            <Text className="mt-1 text-xs leading-4 text-muted">{program.reason}</Text>
          </View>
        ))}
      </View>

      <View className="mt-3 gap-2">
        {onBookCounselling ? (
          <Pressable
            onPress={onBookCounselling}
            className="rounded-xl border border-border px-3 py-2.5"
          >
            <Text className="text-center text-xs font-bold text-text">
              Talk to a counsellor
            </Text>
          </Pressable>
        ) : null}
        <GradientButton
          text={reportBusy ? "Opening checkout…" : "Buy detailed report (€29)"}
          loading={reportBusy}
          onPress={() => void handleBuyReport()}
        />
        {reportError ? <Text className="text-xs text-error">{reportError}</Text> : null}
      </View>
    </View>
  );
}
