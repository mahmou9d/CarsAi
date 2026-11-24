"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, Loader2, KeyRound, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { signInAction } from "@/actions/auth";
import { createClient } from "@/lib/supabase/client";

const DEMO_CREDENTIALS = {
  email: "mah90moud9@gmail.com",
  password: "QWEqwe123!@#",
};

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email.trim() || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await signInAction({ email, password });
      if (res.success) {
        toast.success("Welcome back!");
        router.push(redirectUrl);
        router.refresh();
      } else {
        setErrorMsg(res.error || "Invalid email or password.");
      }
    } catch (err) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setOauthLoading(true);
    setErrorMsg("");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(
            redirectUrl
          )}`,
        },
      });
      if (error) {
        setErrorMsg(error.message);
        setOauthLoading(false);
      }
    } catch (err) {
      setErrorMsg(err.message || "Google sign in failed.");
      setOauthLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail(DEMO_CREDENTIALS.email);
    setPassword(DEMO_CREDENTIALS.password);
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[#1a1a1a] tracking-tight">
          Welcome back
        </h1>
        <p className="text-sm text-[#6b6b6b] mt-1.5">
          Sign in to your CarsAi account to continue
        </p>
      </div>

      {errorMsg && (
        <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-700 animate-in fade-in">
          {errorMsg}
        </div>
      )}

      {/* Demo Credentials Quick-Fill Card */}
      <div className="mb-5 p-3.5 rounded-xl border border-red-200 bg-red-50/70 text-xs shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 font-bold text-slate-900">
            <KeyRound className="h-3.5 w-3.5 text-[#E4141B]" />
            <span>Demo Admin Account</span>
          </div>
          <button
            type="button"
            onClick={handleFillDemo}
            className="text-[11px] font-semibold text-white bg-[#E4141B] hover:bg-[#c81017] px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 shadow-sm"
          >
            <Sparkles className="h-3 w-3" />
            Auto-fill
          </button>
        </div>
        <div className="space-y-0.5 text-slate-600 font-mono text-[11px]">
          <p><span className="text-slate-500 font-sans">Email:</span> {DEMO_CREDENTIALS.email}</p>
          <p><span className="text-slate-500 font-sans">Password:</span> {DEMO_CREDENTIALS.password}</p>
        </div>
      </div>

      {/* Social OAuth Sign In */}
      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleSignIn}
        disabled={oauthLoading || loading}
        className="w-full h-11 rounded-xl border-[#e7e5e1] hover:bg-[#faf9f7] text-sm font-medium gap-2.5 mb-5 transition-colors"
      >
        {oauthLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
        ) : (
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
        )}
        <span>Continue with Google</span>
      </Button>

      <div className="relative mb-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#e7e5e1]" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-[#faf9f7] sm:bg-transparent px-3 text-[#9a9a9a]">
            or sign in with email
          </span>
        </div>
      </div>

      {/* Main Email/Password Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-semibold text-[#1a1a1a]">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-11 rounded-xl border-[#e7e5e1] focus-visible:ring-[#E4141B] text-sm"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-xs font-semibold text-[#1a1a1a]">
              Password
            </Label>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10 h-11 rounded-xl border-[#e7e5e1] focus-visible:ring-[#E4141B] text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-xl bg-[#E4141B] hover:bg-[#c81017] text-white font-semibold text-sm shadow-none transition-colors mt-2"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <span>Sign In</span>
          )}
        </Button>
      </form>

      {/* Footer Navigation */}
      <p className="text-center text-xs text-[#6b6b6b] mt-6">
        Don&apos;t have an account?{" "}
        <Link
          href={`/sign-up${redirectUrl !== "/" ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`}
          className="text-[#E4141B] hover:text-[#c81017] font-semibold hover:underline"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
