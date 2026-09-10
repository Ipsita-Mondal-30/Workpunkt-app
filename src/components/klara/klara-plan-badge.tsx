import { Text, View } from "react-native";

import { cn } from "@/lib/utils";

type KlaraPlanBadgeProps = {
  plan: "free" | "ai_plus";
  className?: string;
  agentLabel?: string | null;
  agentCreditsRemaining?: number | null;
};

/** Website-parity plan chip shown above the Ask Klara composer. */
export function KlaraPlanBadge({
  plan,
  className,
  agentLabel = null,
  agentCreditsRemaining = null,
}: KlaraPlanBadgeProps) {
  const isAgentBadge = Boolean(agentLabel);
  const label = isAgentBadge
    ? agentCreditsRemaining != null
      ? `${agentLabel} · ${agentCreditsRemaining} credits left`
      : agentLabel!
    : plan === "ai_plus"
      ? "AI Plus"
      : "Free Plan";

  const isPlus = isAgentBadge
    ? agentLabel !== "Free Partner"
    : plan === "ai_plus";

  return (
    <View
      className={cn(
        "self-start rounded-full px-2.5 py-1",
        isPlus ? "bg-brand-mid/15" : "bg-surface-end",
        className,
      )}
    >
      <Text
        className={cn(
          "text-[11px] font-bold uppercase tracking-wide",
          isPlus ? "text-brand-mid" : "text-muted",
        )}
      >
        {label}
      </Text>
    </View>
  );
}
