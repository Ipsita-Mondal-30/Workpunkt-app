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
        <Pressable className="flex-1" onPress={onClose} />
        <SafeAreaView edges={["bottom"]} className="max-h-[85%] rounded-t-3xl bg-bg">
          <View className="flex-row items-center justify-between border-b border-border px-4 py-4">
            <Text className="flex-1 text-lg font-semibold text-text">{title}</Text>
            <Pressable onPress={onClose} className="rounded-xl bg-surface-end px-3 py-2">
              <Text className="text-sm font-semibold text-text">Close</Text>
            </Pressable>
          </View>
          <ScrollView contentContainerClassName="px-4 py-4">{children}</ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
