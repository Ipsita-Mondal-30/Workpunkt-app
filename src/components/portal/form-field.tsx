import { useState } from "react";
import { Text, TextInput, View, type TextInputProps } from "react-native";

import { useThemeColors } from "@/lib/theme/theme-context";
import { cn } from "@/lib/utils";

type FormFieldProps = TextInputProps & {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
};

export function FormField({
  label,
  hint,
  error,
  required,
  onFocus,
  onBlur,
  editable = true,
  placeholderTextColor,
  ...props
}: FormFieldProps) {
  const colors = useThemeColors();
  const [focused, setFocused] = useState(false);
  return (
    <View className="mb-5">
      <Text className="mb-2 text-sm font-semibold text-text">
        {label}
        {required ? " *" : ""}
      </Text>
      <TextInput
        {...props}
        editable={editable}
        accessibilityLabel={`${label}${required ? ", required" : ""}`}
        accessibilityHint={error ?? hint}
        placeholderTextColor={placeholderTextColor ?? colors.placeholder}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        className={cn(
          "min-h-12 rounded-2xl border bg-surface-end px-4 py-3 text-base text-text",
          error ? "border-error" : focused ? "border-brand-start" : "border-border",
          !editable && "opacity-50",
        )}
      />
      {error ? (
        <Text accessibilityRole="alert" className="mt-2 text-xs text-error">
          {error}
        </Text>
      ) : hint ? (
        <Text className="mt-2 text-xs leading-5 text-muted">{hint}</Text>
      ) : null}
    </View>
  );
}
