"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { setAdminToken } from "@/lib/auth";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("kartik@test.com");
  const [password, setPassword] = useState("Password123");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await api.post("/auth/login", { email, password });

      if (res.data.user.role !== "ADMIN") {
        alert("You are not an admin");
        return;
      }

      setAdminToken(res.data.token);
      router.push("/dashboard");
      router.refresh();
    } catch (error: any) {
      console.error("ADMIN LOGIN ERROR:", error);
      console.error("ADMIN LOGIN RESPONSE:", error?.response?.data);
      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Admin login failed",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-zinc-100"
    >
      <h1 className="mb-6 text-2xl font-bold">Admin Login</h1>

      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium">Email</label>
          <input
            type="email"
            className="w-full rounded-2xl border border-zinc-300 px-4 py-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Password</label>
          <input
            type="password"
            className="w-full rounded-2xl border border-zinc-300 px-4 py-3"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-zinc-900 px-6 py-3 text-white disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
    </form>
  );
}
