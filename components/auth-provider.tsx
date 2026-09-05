"use client";

import type { User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";

type AuthContextValue = {
  user: User | null;
  isLoaded: boolean;
  isSignedIn: boolean;
  signOut: (options?: { redirectUrl?: string }) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const supabase = getBrowserSupabaseClient();
    let mounted = true;

    void supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setUser(data.user);
      setIsLoaded(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      setIsLoaded(true);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoaded,
      isSignedIn: Boolean(user),
      signOut: async ({ redirectUrl = "/sign-in" } = {}) => {
        await getBrowserSupabaseClient().auth.signOut();
        window.location.assign(redirectUrl);
      },
    }),
    [isLoaded, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return value;
}