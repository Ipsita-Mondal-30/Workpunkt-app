import { Slot, Redirect } from "expo-router";

import { RoleShell } from "@/components/layout/role-shell";
import { WorkpunktLoader } from "@/components/shared/workpunkt-loader";
import { useAuth } from "@/lib/auth/auth-context";

export default function AdminLayout() {
  const { loading, session, role, homePath } = useAuth();

  if (loading) return <WorkpunktLoader />;
  if (!session) return <Redirect href="/(auth)/login" />;
  if (role !== "admin") return <Redirect href={homePath as never} />;

  return (
    <RoleShell role="admin" title="Admin">
      <Slot />
    </RoleShell>
  );
}
