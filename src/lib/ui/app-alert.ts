export type AppAlertButtonStyle = "default" | "cancel" | "destructive";

export type AppAlertButton = {
  text: string;
  style?: AppAlertButtonStyle;
  onPress?: () => void | Promise<void>;
};

export type AppAlertOptions = {
  title: string;
  message?: string;
  buttons?: AppAlertButton[];
};

type Presenter = (options: AppAlertOptions) => void;

let presentAlert: Presenter | null = null;

export function registerAppAlertPresenter(presenter: Presenter): () => void {
  presentAlert = presenter;
  return () => {
    if (presentAlert === presenter) presentAlert = null;
  };
}

/**
 * Drop-in replacement for React Native `Alert.alert` with Workpunkt styling.
 * Signature mirrors RN: appAlert(title, message?, buttons?)
 */
export function appAlert(
  title: string,
  message?: string,
  buttons?: AppAlertButton[],
): void {
  if (!presentAlert) {
    console.warn("[appAlert] Host not mounted — falling back to console", {
      title,
      message,
    });
    return;
  }
  presentAlert({ title, message, buttons });
}

/** Two-button confirm helper. */
export function appConfirm(
  title: string,
  message: string,
  onConfirm: () => void | Promise<void>,
  options?: {
    confirmText?: string;
    cancelText?: string;
    destructive?: boolean;
  },
): void {
  appAlert(title, message, [
    { text: options?.cancelText ?? "Cancel", style: "cancel" },
    {
      text: options?.confirmText ?? "Confirm",
      style: options?.destructive ? "destructive" : "default",
      onPress: onConfirm,
    },
  ]);
}
