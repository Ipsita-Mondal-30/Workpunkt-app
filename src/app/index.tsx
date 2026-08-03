import { Redirect } from "expo-router";
import { useEffect } from "react";

import { WorkpunktLoader } from "@/components/shared/workpunkt-loader";
import { useAuth } from "@/lib/auth/auth-context";
import { bootLog } from "@/lib/debug/boot-log";

export default function Index() {
  const { loading, session, role, homePath } = useAuth();

  useEffect(() => {
    bootLog("index:mounted", {
      loading,
      hasSession: Boolean(session),
      role,
      homePath,
    });
  }, [loading, session, role, homePath]);

  if (loading) {
    bootLog("index:still-loading");
    return <WorkpunktLoader />;
  }

  if (!session) {
    bootLog("index:redirect-login");
    return <Redirect href="/(auth)/login" />;
  }

  bootLog("index:redirect-home", { role, homePath });
  return <Redirect href={homePath as never} />;
}
