import { Slot, Redirect } from "expo-router";
import { useEffect } from "react";

import { RoleShell } from "@/components/layout/role-shell";
import { WorkpunktLoader } from "@/components/shared/workpunkt-loader";
import { useAuth } from "@/lib/auth/auth-context";
import { bootLog } from "@/lib/debug/boot-log";

export default function AdminLayout() {
  const { loading, session, role, homePath } = useAuth();

  useEffect(() => {
    bootLog("admin-layout:mounted", {
      loading,
      hasSession: Boolean(session),
      role,
    });
  }, [loading, session, role]);

  if (loading) return <WorkpunktLoader />;
  if (!session) return <Redirect href="/(auth)/login" />;
  if (role !== "admin") return <Redirect href={homePath as never} />;

  bootLog("admin-layout:rendering-shell");
  return (
    <RoleShell role="admin" title="Admin">
      <Slot />
    </RoleShell>
  );
}
