import type { ReactNode } from "react";
import { Text, View } from "react-native";

import { cn } from "@/lib/utils";

type SignupFieldProps = {
  label: string;
  error?: string | null;
  hint?: string;
  children: ReactNode;
  className?: string;
};

export function SignupField({ label, error, hint, children, className }: SignupFieldProps) {
  return (
    <View className={cn("mb-4", className)}>
      <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </Text>
      {children}
      {error ? (
        <Text className="mt-1.5 text-xs font-medium text-error">{error}</Text>
      ) : hint ? (
        <Text className="mt-1.5 text-xs text-muted">{hint}</Text>
      ) : null}
    </View>
  );
}

export function signupInputClass(hasError?: boolean) {
  return cn(
    "rounded-2xl border bg-surface px-4 py-4 text-base text-text",
    hasError ? "border-error" : "border-border",
  );
}
