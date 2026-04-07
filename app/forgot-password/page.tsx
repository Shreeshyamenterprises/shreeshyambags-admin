"use client";

import Link from "next/link";
import { useState } from "react";
import { Mail, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";

const inputBase =
  "w-full rounded-xl border bg-white pl-10 pr-4 py-3.5 text-sm text-zinc-900 outline-none transition-all duration-200 placeholder:text-zinc-400";
const inputNormal =
  "border-zinc-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100";
const inputError =
  "border-red-300 bg-red-50/60 focus:border-red-400 focus:ring-2 focus:ring-red-100";

export default function AdminForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [apiError, setApiError] = useState("");

  function validate(value: string) {
    if (!value.trim()) return "Please enter your email address.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()))
      return "Please enter a valid email address.";
    return "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validate(email);
    if (err) { setEmailError(err); return; }

    try {
      setLoading(true);
      setApiError("");
      await api.post("/auth/forgot-password", { email: email.trim().toLowerCase() });
      setSent(true);
    } catch {
      setApiError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-100">
      <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-pink-200/30 blur-3xl" />
      <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-fuchsia-200/30 blur-3xl" />

      <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="overflow-hidden rounded-[2.5rem] bg-white shadow-[0_20px_80px_rgba(0,0,0,0.08)] ring-1 ring-white/60">
            <div className="p-8 sm:p-12">

              {sent ? (
                <div className="flex flex-col items-center gap-5 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-100">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-pink-500">
                      Email Sent
                    </p>
                    <h1 className="mt-2 text-2xl font-bold text-zinc-900">
                      Check your inbox
                    </h1>
                    <p className="mt-2 text-sm leading-6 text-zinc-500">
                      We sent a reset link to{" "}
                      <span className="font-semibold text-zinc-800">{email}</span>.
                      It expires in 1 hour.
                    </p>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Didn't receive it? Check spam or{" "}
                    <button
                      onClick={() => setSent(false)}
                      className="font-semibold text-pink-600 transition hover:text-pink-700"
                    >
                      try again
                    </button>
                    .
                  </p>
                  <Link
                    href="/login"
                    className="flex items-center gap-1.5 text-sm font-semibold text-zinc-600 transition hover:text-zinc-900"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to login
                  </Link>
                </div>
              ) : (
                <>
                  <div className="mb-8">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-pink-500">
                      Admin Panel
                    </p>
                    <h1 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900">
                      Forgot password?
                    </h1>
                    <p className="mt-2 text-sm text-zinc-500">
                      Enter your admin email and we'll send you a reset link.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-zinc-700">
                        Email Address
                      </label>
                      <div className="relative">
                        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400">
                          <Mail className="h-4 w-4" />
                        </span>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => { setEmail(e.target.value); setEmailError(""); setApiError(""); }}
                          placeholder="admin@example.com"
                          className={`${inputBase} ${emailError ? inputError : inputNormal}`}
                        />
                      </div>
                      {emailError && (
                        <p className="text-xs font-medium text-red-500">{emailError}</p>
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
                          Sending reset link…
                        </>
                      ) : (
                        <>
                          Send Reset Link
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </>
                      )}
                    </button>
                  </form>

                  <p className="mt-4 text-center text-xs text-zinc-400">
                    Reset links expire after 1 hour.
                  </p>

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
          </div>
        </div>
      </div>
    </main>
  );
}
