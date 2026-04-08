"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, Phone } from "lucide-react";
import { api } from "@/lib/api";
import { setAdminToken } from "@/lib/auth";

type FormData = {
  identifier: string;
  password: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

function validateForm(data: FormData): FormErrors {
  const errors: FormErrors = {};
  const identifier = data.identifier.trim();

  if (!identifier) {
    errors.identifier = "Please enter your email or phone number.";
  } else {
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    const isPhone = /^[0-9]{10}$/.test(identifier);

    if (!isEmail && !isPhone) {
      errors.identifier =
        "Enter a valid email address or 10 digit phone number.";
    }
  }

  if (!data.password) {
    errors.password = "Please enter your password.";
  } else if (data.password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }

  return errors;
}

export default function AdminLoginPage() {
  const router = useRouter();

  const [form, setForm] = useState<FormData>({
    identifier: "",
    password: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const googleLoginUrl = useMemo(() => {
    const base =
      process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
      "http://localhost:3000";
    return `${base}/auth/google`;
  }, []);

  function updateField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
    setApiError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const validationErrors = validateForm(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      setLoading(true);
      setApiError("");

      const identifier = form.identifier.trim();
      const isPhone = /^[0-9]{10}$/.test(identifier);

      const payload = {
        email: isPhone ? undefined : String(identifier).toLowerCase(),
        phone: isPhone ? String(identifier) : undefined,
        password: String(form.password),
      };

      const res = await api.post("/auth/login", payload);

      if (res.data?.user?.role !== "ADMIN") {
        setApiError("You are not authorized to access the admin panel.");
        return;
      }

      if (res.data?.token) {
        setAdminToken(res.data.token);

        setTimeout(() => {
          router.replace("/dashboard");
        }, 100);

        return;
      }

      setApiError("Login succeeded but token was not returned.");
    } catch (error: any) {
      console.error(error);
      const message = error?.response?.data?.message;

      setApiError(
        Array.isArray(message)
          ? message.join(", ")
          : message || "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f7fb]">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-100" />
        <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-pink-200/30 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-fuchsia-200/30 blur-3xl" />

        <div className="relative mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid w-full max-w-6xl overflow-hidden rounded-[2.5rem] bg-white shadow-[0_20px_80px_rgba(0,0,0,0.08)] ring-1 ring-white/60 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="relative hidden min-h-[760px] overflow-hidden bg-zinc-900 lg:block">
              <Image
                src="/signup-bag-sample.jpg"
                alt="Shreeshyam Packaging Admin"
                fill
                className="object-cover opacity-45"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/90 via-zinc-900/75 to-pink-900/60" />

              <div className="relative z-10 flex h-full flex-col justify-between p-10">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-pink-300">
                    Admin Panel
                  </p>
                  <h1 className="mt-5 max-w-lg text-4xl font-bold leading-tight text-white">
                    Manage products, quotes, orders and premium packaging flow.
                  </h1>
                  <p className="mt-5 max-w-md text-sm leading-7 text-zinc-300">
                    Login to access the Shreeshyam Packaging admin workspace for
                    catalog management, pricing tiers, bulk quote handling and
                    order updates.
                  </p>
                </div>

                <div className="grid gap-4">
                  <div className="rounded-[1.75rem] bg-white/8 p-5 backdrop-blur ring-1 ring-white/10">
                    <p className="text-sm font-semibold text-white">
                      Product operations
                    </p>
                    <p className="mt-2 text-sm leading-6 text-zinc-300">
                      Update bag variants, GSM, pricing tiers and product
                      images.
                    </p>
                  </div>

                  <div className="rounded-[1.75rem] bg-white/8 p-5 backdrop-blur ring-1 ring-white/10">
                    <p className="text-sm font-semibold text-white">
                      Quotes and orders
                    </p>
                    <p className="mt-2 text-sm leading-6 text-zinc-300">
                      Review bulk enquiries and manage business orders from one
                      premium dashboard.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center p-5 sm:p-8 lg:p-12">
              <div className="w-full max-w-md">
                <div className="text-center lg:text-left">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-pink-500">
                    Admin Login
                  </p>
                  <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900">
                    Welcome back
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-zinc-600">
                    Sign in with your admin email or phone number.
                  </p>
                </div>

                <a
                  href={googleLoginUrl}
                  className="mt-6 flex w-full items-center justify-center gap-3 rounded-full border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path
                      fill="#FFC107"
                      d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5Z"
                    />
                    <path
                      fill="#FF3D00"
                      d="M6.3 14.7l6.6 4.8C14.7 15 19 12 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.1 6.1 29.3 4 24 4c-7.7 0-14.3 4.3-17.7 10.7Z"
                    />
                    <path
                      fill="#4CAF50"
                      d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.1 35.2 26.7 36 24 36c-5.3 0-9.7-3.3-11.4-8l-6.5 5C9.4 39.5 16.1 44 24 44Z"
                    />
                    <path
                      fill="#1976D2"
                      d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.1 5.6l.1-.1 6.2 5.2C37 38.3 44 33 44 24c0-1.2-.1-2.3-.4-3.5Z"
                    />
                  </svg>
                  Continue with Google
                </a>

                <div className="my-6 flex items-center gap-4">
                  <div className="h-px flex-1 bg-zinc-200" />
                  <span className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-400">
                    or
                  </span>
                  <div className="h-px flex-1 bg-zinc-200" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-700">
                      Email or Phone Number
                    </label>

                    <div
                      className={`flex items-center gap-3 rounded-2xl border bg-white px-4 py-3 transition ${
                        errors.identifier
                          ? "border-red-400 bg-red-50"
                          : "border-zinc-300 focus-within:border-pink-400"
                      }`}
                    >
                      {/^[0-9]+$/.test(form.identifier) &&
                      form.identifier.length <= 10 ? (
                        <Phone className="h-4 w-4 text-zinc-400" />
                      ) : (
                        <Mail className="h-4 w-4 text-zinc-400" />
                      )}

                      <input
                        type="text"
                        value={form.identifier}
                        onChange={(e) => {
                          const value = e.target.value;
                          const onlyDigits = value.replace(/\D/g, "");
                          const shouldTreatAsPhone =
                            /^[0-9]+$/.test(value) && value.length <= 10;

                          updateField(
                            "identifier",
                            shouldTreatAsPhone ? onlyDigits : value,
                          );
                        }}
                        placeholder="Enter admin email or 10 digit phone number"
                        className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-400"
                      />
                    </div>

                    {errors.identifier ? (
                      <p className="mt-2 text-xs text-red-500">
                        {errors.identifier}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <label className="block text-sm font-medium text-zinc-700">
                        Password
                      </label>

                      <Link
                        href="/forgot-password"
                        className="text-xs font-semibold text-pink-600 transition hover:text-pink-700"
                      >
                        Forgot password?
                      </Link>
                    </div>

                    <div
                      className={`flex items-center gap-3 rounded-2xl border bg-white px-4 py-3 transition ${
                        errors.password
                          ? "border-red-400 bg-red-50"
                          : "border-zinc-300 focus-within:border-pink-400"
                      }`}
                    >
                      <Lock className="h-4 w-4 text-zinc-400" />

                      <input
                        type={showPassword ? "text" : "password"}
                        value={form.password}
                        onChange={(e) =>
                          updateField("password", e.target.value)
                        }
                        placeholder="Enter your password"
                        className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-400"
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="text-zinc-400 transition hover:text-zinc-700"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    {errors.password ? (
                      <p className="mt-2 text-xs text-red-500">
                        {errors.password}
                      </p>
                    ) : null}
                  </div>

                  {apiError ? (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                      {apiError}
                    </div>
                  ) : null}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Logging in..." : "Login to Admin"}
                  </button>
                </form>

                <p className="mt-6 text-center text-sm text-zinc-600 lg:text-left">
                  Need customer access?{" "}
                  <Link
                    href={process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3001"}
                    className="font-semibold text-pink-600 transition hover:text-pink-700"
                  >
                    Go to website login
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
