import { Text, View } from "react-native";

import { cn } from "@/lib/utils";

type SignupStepIndicatorProps = {
  current: 1 | 2;
  total?: number;
};

export function SignupStepIndicator({ current, total = 2 }: SignupStepIndicatorProps) {
  return (
    <View className="mb-6 flex-row items-center">
      {Array.from({ length: total }, (_, index) => {
        const step = (index + 1) as 1 | 2;
        const complete = step < current;
        const active = step === current;
        return (
          <View key={step} className="flex-row items-center">
            <View
              className={cn(
                "h-8 w-8 items-center justify-center rounded-full",
                complete || active ? "bg-brand-mid" : "bg-surface-end",
              )}
            >
              <Text
                className={cn(
                  "text-sm font-bold",
                  complete || active ? "text-white" : "text-muted",
                )}
              >
                {complete ? "✓" : step}
              </Text>
            </View>
            {step < total ? (
              <View
                className={cn(
                  "mx-2 h-0.5 w-10",
                  complete ? "bg-brand-mid" : "bg-border",
                )}
              />
            ) : null}
          </View>
        );
      })}
    </View>
  );
}
