import { Redirect, Stack } from "expo-router";

import { WorkpunktLoader } from "@/components/shared/workpunkt-loader";
import { useAuth } from "@/lib/auth/auth-context";

export default function AuthLayout() {
  const { loading, session, homePath } = useAuth();

  if (loading) {
    return <WorkpunktLoader />;
  }

  if (session) {
    return <Redirect href={homePath as never} />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
