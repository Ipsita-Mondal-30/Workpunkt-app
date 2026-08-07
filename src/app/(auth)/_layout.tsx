import { Redirect, Stack, usePathname } from "expo-router";

import { WorkpunktLoader } from "@/components/shared/workpunkt-loader";
import { useAuth } from "@/lib/auth/auth-context";

/** Routes that must stay reachable after OTP / activation (session may exist). */
function allowsSession(pathname: string | null) {
  if (!pathname) return false;
  const allowed = [
    "welcome",
    "onboarding",
    "confirm",
    "email-link",
    "activate",
    "academic",
    "upload",
    "submitted",
    "check-email",
  ];
  return allowed.some((segment) => pathname.includes(segment));
}

export default function AuthLayout() {
  const { loading, session, homePath } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return <WorkpunktLoader />;
  }

  if (session && !allowsSession(pathname)) {
    return <Redirect href={homePath as never} />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
