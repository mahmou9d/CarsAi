"use client";

import { AuthProvider } from "@/context/auth-context";

export function CustomAuthProvider({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}
