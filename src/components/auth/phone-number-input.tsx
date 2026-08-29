import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  DEFAULT_PHONE_COUNTRY_CODE,
  PHONE_COUNTRY_CODES,
  formatPhoneNumber,
  parsePhoneNumber,
} from "@/lib/phone/phone-number";
import { useTheme } from "@/lib/theme/theme-context";
import { cn } from "@/lib/utils";

type PhoneNumberInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hasError?: boolean;
  disabled?: boolean;
};

export function PhoneNumberInput({
  value,
  onChange,
  placeholder = "9876543210",
  hasError = false,
  disabled = false,
}: PhoneNumberInputProps) {
  const { isDark } = useTheme();
  const [pickerOpen, setPickerOpen] = useState(false);
  const placeholderColor = isDark ? "#a1a1aa" : "#71717a";
  const parsed = useMemo(
    () => parsePhoneNumber(value, DEFAULT_PHONE_COUNTRY_CODE),
    [value],
  );
  const selected = PHONE_COUNTRY_CODES.find((country) => country.code === parsed.dialCode);

  function emitChange(nextDialCode: string, nextNationalNumber: string) {
    onChange(formatPhoneNumber(nextDialCode, nextNationalNumber));
  }

  return (
    <>
      <View className="flex-row gap-2">
        <Pressable
          disabled={disabled}
          onPress={() => setPickerOpen(true)}
          className={cn(
            "w-[7.5rem] items-center justify-center rounded-2xl border bg-surface px-2 py-4",
            hasError ? "border-error" : "border-border",
          )}
        >
          <Text className="text-sm font-semibold text-text">
            {selected?.flag ?? "🌐"} {parsed.dialCode}
          </Text>
        </Pressable>
        <TextInput
          keyboardType="phone-pad"
          autoComplete="tel-national"
          editable={!disabled}
          placeholder={placeholder}
          placeholderTextColor={placeholderColor}
          value={parsed.nationalNumber}
          onChangeText={(raw: string) => {
            if (raw.includes("+")) {
              const pasted = parsePhoneNumber(raw, parsed.dialCode);
              emitChange(pasted.dialCode, pasted.nationalNumber);
              return;
            }
            emitChange(parsed.dialCode, raw.replace(/[^\d]/g, ""));
          }}
          className={cn(
            "min-w-0 flex-1 rounded-2xl border bg-surface px-4 py-4 text-base text-text",
            hasError ? "border-error" : "border-border",
          )}
        />
      </View>

      <Modal
        visible={pickerOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setPickerOpen(false)}
      >
        <SafeAreaView className="flex-1 bg-bg" edges={["top", "bottom"]}>
          <View className="flex-row items-center justify-between border-b border-border px-4 py-4">
            <Text className="text-lg font-semibold text-text">Country code</Text>
            <Pressable
              onPress={() => setPickerOpen(false)}
              className="rounded-xl bg-surface-end px-3 py-2"
            >
              <Text className="text-sm font-semibold text-text">Close</Text>
            </Pressable>
          </View>
          <ScrollView contentContainerClassName="px-4 py-2 pb-8">
            {PHONE_COUNTRY_CODES.map((country) => {
              const selectedCode = country.code === parsed.dialCode;
              return (
                <Pressable
                  key={country.code}
                  onPress={() => {
                    emitChange(country.code, parsed.nationalNumber);
                    setPickerOpen(false);
                  }}
                  className={cn(
                    "flex-row items-center justify-between rounded-xl px-3 py-3",
                    selectedCode && "bg-brand-mid/15",
                  )}
                >
                  <Text className="text-base text-text">
                    {country.flag}  {country.label}
                  </Text>
                  <Text className="text-sm font-semibold text-muted">{country.code}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
}
