"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const AuthContext = createContext({
  user: null,
  isSignedIn: false,
  isLoading: true,
  signOut: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children, initialUser = null }) {
  const [user, setUser] = useState(initialUser);
  const [isLoading, setIsLoading] = useState(!initialUser);
  const router = useRouter();
  const supabase = createClient();

  const fetchUserProfile = useCallback(async (sessionUser) => {
    if (!sessionUser) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      // Fetch user from internal API to get database role & ID
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser({
            id: data.user.id,
            supabaseUserId: sessionUser.id,
            email: sessionUser.email,
            name: data.user.name || sessionUser.user_metadata?.full_name || sessionUser.email?.split("@")[0],
            fullName: data.user.name || sessionUser.user_metadata?.full_name || sessionUser.email?.split("@")[0],
            imageUrl: data.user.imageUrl || sessionUser.user_metadata?.avatar_url || null,
            role: data.user.role || "USER",
            isAdmin: data.user.role === "ADMIN",
            primaryEmailAddress: { emailAddress: sessionUser.email },
          });
          setIsLoading(false);
          return;
        }
      }
    } catch (e) {
      console.error("Failed to load user profile:", e);
    }

    // Fallback to auth session metadata
    setUser({
      id: sessionUser.id,
      supabaseUserId: sessionUser.id,
      email: sessionUser.email,
      name: sessionUser.user_metadata?.full_name || sessionUser.email?.split("@")[0],
      fullName: sessionUser.user_metadata?.full_name || sessionUser.email?.split("@")[0],
      imageUrl: sessionUser.user_metadata?.avatar_url || null,
      role: "USER",
      isAdmin: false,
      primaryEmailAddress: { emailAddress: sessionUser.email },
    });
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    // Listen to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        fetchUserProfile(session.user);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, fetchUserProfile]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.refresh();
    router.push("/");
  };

  const refreshUser = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.user) {
      await fetchUserProfile(session.user);
    } else {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isSignedIn: !!user,
        isLoading,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
