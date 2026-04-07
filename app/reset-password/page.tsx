"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Lock, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";

const inputBase =
  "w-full rounded-xl border bg-white pl-10 pr-12 py-3.5 text-sm text-zinc-900 outline-none transition-all duration-200 placeholder:text-zinc-400";
const inputNormal =
  "border-zinc-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100";
const inputError =
  "border-red-300 bg-red-50/60 focus:border-red-400 focus:ring-2 focus:ring-red-100";

function getPasswordStrength(password: string) {
  if (!password) return { label: "", width: "0%", color: "bg-zinc-200", textColor: "text-zinc-400" };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 2) return { label: "Weak", width: "33%", color: "bg-red-400", textColor: "text-red-500" };
  if (score <= 4) return { label: "Medium", width: "66%", color: "bg-amber-400", textColor: "text-amber-600" };
  return { label: "Strong", width: "100%", color: "bg-emerald-500", textColor: "text-emerald-600" };
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const strength = getPasswordStrength(password);

  function validate() {
    const errs: { password?: string; confirm?: string } = {};
    if (!password) errs.password = "Please enter a new password.";
    else if (password.length < 8) errs.password = "Password must be at least 8 characters.";
    else if (!/(?=.*[A-Za-z])(?=.*\d)/.test(password))
      errs.password = "Password must include letters and numbers.";
    if (!confirm) errs.confirm = "Please confirm your password.";
    else if (password !== confirm) errs.confirm = "Passwords do not match.";
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    if (!token) {
      setApiError("Invalid reset link. Please request a new one.");
      return;
    }

    try {
      setLoading(true);
      setApiError("");
      await api.post("/auth/reset-password", { token, password });
      setDone(true);
      setTimeout(() => router.replace("/login"), 2500);
    } catch (error: any) {
      const message = error?.response?.data?.message;
      setApiError(
        Array.isArray(message) ? message.join(", ") : message || "Reset failed. The link may have expired.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 sm:p-12">
      {!token ? (
        <div className="flex flex-col items-center gap-5 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 ring-1 ring-red-100">
            <Lock className="h-8 w-8 text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Invalid Reset Link</h1>
            <p className="mt-2 text-sm text-zinc-500">
              This link is missing a reset token. Please request a new password reset.
            </p>
          </div>
          <Link
            href="/forgot-password"
            className="flex items-center gap-2 rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            Request New Link
          </Link>
        </div>
      ) : done ? (
        <div className="flex flex-col items-center gap-5 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-100">
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-pink-500">Success</p>
            <h1 className="mt-2 text-2xl font-bold text-zinc-900">Password Reset!</h1>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Your password has been updated. Redirecting to login…
            </p>
          </div>
          <Link
            href="/login"
            className="flex items-center gap-2 text-sm font-semibold text-pink-600 transition hover:text-pink-700"
          >
            Go to Login <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-pink-500">
              Admin Panel
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900">
              Create new password
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              Choose a strong password for your admin account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-zinc-700">New Password</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: "" })); }}
                  placeholder="Min 8 chars with letters & numbers"
                  className={`${inputBase} ${errors.password ? inputError : inputNormal}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs font-medium text-red-500">{errors.password}</p>
              )}
              {password && (
                <div className="space-y-1">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${strength.color}`}
                      style={{ width: strength.width }}
                    />
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Password strength</span>
                    <span className={`font-semibold ${strength.textColor}`}>{strength.label}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-zinc-700">Confirm Password</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => { setConfirm(e.target.value); setErrors((p) => ({ ...p, confirm: "" })); }}
                  placeholder="Re-enter your new password"
                  className={`${inputBase} ${errors.confirm ? inputError : inputNormal}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-600"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirm && (
                <p className="text-xs font-medium text-red-500">{errors.confirm}</p>
              )}
            </div>

            {apiError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {apiError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-center gap-2 rounded-full bg-zinc-900 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Resetting password…
                </>
              ) : (
                <>
                  Reset Password
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          <Link
            href="/login"
            className="mt-5 flex items-center justify-center gap-1.5 text-sm font-semibold text-zinc-600 transition hover:text-zinc-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </>
      )}
    </div>
  );
}

export default function AdminResetPasswordPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-100">
      <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-pink-200/30 blur-3xl" />
      <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-fuchsia-200/30 blur-3xl" />

      <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="overflow-hidden rounded-[2.5rem] bg-white shadow-[0_20px_80px_rgba(0,0,0,0.08)] ring-1 ring-white/60">
            <Suspense fallback={
              <div className="flex items-center justify-center p-12 text-sm text-zinc-400">
                Loading…
              </div>
            }>
              <ResetPasswordForm />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  );
}
