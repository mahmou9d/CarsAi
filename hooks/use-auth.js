"use client";

import { useAuthContext } from "@/context/auth-context";

/**
 * Drop-in replacement for Clerk's useAuth()
 */
export function useAuth() {
  const { user, isSignedIn, isLoading, signOut } = useAuthContext();

  return {
    isLoaded: !isLoading,
    isSignedIn,
    userId: user?.supabaseUserId || user?.id || null,
    signOut,
  };
}

/**
 * Drop-in replacement for Clerk's useUser()
 */
export function useUser() {
  const { user, isSignedIn, isLoading } = useAuthContext();

  return {
    isLoaded: !isLoading,
    isSignedIn,
    user,
  };
}
