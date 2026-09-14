import type { ReactNode } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type DetailSheetProps = {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
};

export function DetailSheet({ visible, title, onClose, children }: DetailSheetProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/40">
        <Pressable accessibilityRole="button" accessibilityLabel="Close details" className="flex-1" onPress={onClose} />
        <SafeAreaView accessibilityViewIsModal edges={["bottom"]} style={{ width: "100%", maxWidth: 720, alignSelf: "center" }} className="max-h-[85%] rounded-t-3xl border border-border bg-bg">
          <View className="flex-row items-center justify-between border-b border-border px-4 py-4">
            <Text accessibilityRole="header" className="mr-3 flex-1 text-lg font-semibold text-text">{title}</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Close details" onPress={onClose} className="min-h-11 justify-center rounded-full bg-surface-end px-4 py-2">
              <Text className="text-sm font-semibold text-text">Close</Text>
            </Pressable>
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerClassName="px-5 py-5">{children}</ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
