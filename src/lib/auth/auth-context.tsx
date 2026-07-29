import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";

import {
  resolveAppRole,
  roleHomePath,
  type AppRole,
  type ProfileFlags,
} from "@/lib/auth/resolve-role";
import { supabase } from "@/lib/supabase/client";

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: ProfileFlags | null;
  role: AppRole | null;
  loading: boolean;
  homePath: string;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: string | null; role: AppRole | null; homePath: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function loadProfile(userId: string): Promise<ProfileFlags | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("role, admin_role, name, email, is_agent_active")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("[auth] loadProfile failed", error.message);
    return null;
  }

  return (data as ProfileFlags | null) ?? null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileFlags | null>(null);
  const [loading, setLoading] = useState(true);

  const applySession = useCallback(async (next: Session | null) => {
    setSession(next);
    if (!next?.user) {
      setProfile(null);
      return;
    }
    const nextProfile = await loadProfile(next.user.id);
    setProfile(nextProfile);
    const role = resolveAppRole(nextProfile);
    console.log("[auth] profile loaded", {
      userId: next.user.id,
      email: next.user.email,
      role,
      profileRole: nextProfile?.role,
      adminRole: nextProfile?.admin_role,
    });
  }, []);

  useEffect(() => {
    let mounted = true;

    void (async () => {
      console.log("[auth] restoring session…");
      const {
        data: { session: existing },
      } = await supabase.auth.getSession();
      if (!mounted) return;
      await applySession(existing);
      setLoading(false);
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, next) => {
      void (async () => {
        await applySession(next);
        setLoading(false);
      })();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [applySession]);

  const signIn = useCallback(async (email: string, password: string) => {
    console.log("[auth] signIn start", { email });
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      console.error("[auth] signIn failed", error.message);
      return { error: error.message, role: null, homePath: "/(auth)/login" };
    }

    console.log("[auth] signIn success", { userId: data.user?.id });
    await applySession(data.session);

    const nextProfile = data.session?.user
      ? await loadProfile(data.session.user.id)
      : null;
    const nextRole = resolveAppRole(nextProfile);
    const nextHome = roleHomePath(nextRole);
    console.log("[auth] post-login route", { role: nextRole, dest: nextHome });
    return { error: null, role: nextRole, homePath: nextHome };
  }, [applySession]);

  const signOut = useCallback(async () => {
    console.log("[auth] signOut");
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!session?.user) return;
    const nextProfile = await loadProfile(session.user.id);
    setProfile(nextProfile);
  }, [session?.user]);

  const role = session ? resolveAppRole(profile) : null;
  const homePath = role ? roleHomePath(role) : "/(auth)/login";

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      role,
      loading,
      homePath,
      signIn,
      signOut,
      refreshProfile,
    }),
    [session, profile, role, loading, homePath, signIn, signOut, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
