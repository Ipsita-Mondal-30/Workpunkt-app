import { Component, type ErrorInfo, type ReactNode } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { bootError, bootLog } from "@/lib/debug/boot-log";

type Props = {
  children: ReactNode;
  label?: string;
};

type State = {
  error: Error | null;
};

export class BootErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    bootError(`boundary:${this.props.label ?? "root"}`, {
      message: error.message,
      stack: error.stack,
      componentStack: info.componentStack,
    });
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <View className="flex-1 items-center justify-center bg-bg px-6 py-10">
        <Text className="mb-2 text-lg font-bold text-error">
          Something went wrong
        </Text>
        <Text className="mb-4 text-center text-sm text-muted">
          The app hit an error while starting. Details are in the Metro / logcat
          logs under [wp-boot].
        </Text>
        <ScrollView className="mb-6 max-h-48 w-full rounded-xl bg-surface-end p-3">
          <Text className="font-mono text-xs text-text">{error.message}</Text>
          {error.stack ? (
            <Text className="mt-2 font-mono text-[10px] text-muted">
              {error.stack}
            </Text>
          ) : null}
        </ScrollView>
        <Pressable
          className="rounded-xl bg-brand-mid px-5 py-3"
          onPress={() => {
            bootLog("boundary:retry");
            this.setState({ error: null });
          }}
        >
          <Text className="font-semibold text-white">Try again</Text>
        </Pressable>
      </View>
    );
  }
}
