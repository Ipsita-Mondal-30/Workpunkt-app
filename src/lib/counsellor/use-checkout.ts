import { Alert } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { useMutation } from "@tanstack/react-query";

import { authFetch } from "@/lib/api/auth-fetch";
import type { CheckoutProductType } from "@/lib/counsellor/types";

export function useCheckout(productType: CheckoutProductType) {
  return useMutation({
    mutationFn: async () => {
      const response = await authFetch("/api/checkout/create-session", {
        method: "POST",
        body: JSON.stringify({ product_type: productType }),
      });
      const json = (await response.json()) as {
        data?: { url?: string };
        error?: string;
      };

      if (!response.ok) {
        throw new Error(json.error ?? "Checkout failed");
      }

      const url = json.data?.url;
      if (!url) {
        throw new Error("No checkout URL returned");
      }

      return url;
    },
    onSuccess: async (url) => {
      await WebBrowser.openBrowserAsync(url);
    },
    onError: (error) => {
      Alert.alert("Checkout error", error.message);
    },
  });
}
