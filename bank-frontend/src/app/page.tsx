"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import api, { logUiEvent } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
  const router = useRouter();
  const { user, setAuth, hydrate, isHydrated } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!isHydrated) return;
    if (user) {
      if (user.role === "ADMIN") {
        router.replace("/admin");
      } else {
        router.replace("/dashboard");
      }
    }
  }, [user, isHydrated, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });
      const { token, user } = res.data;
      setAuth(user, token);
      await logUiEvent("User logged in", false);
      toast.success("Logged in successfully");
      if (user.role === "ADMIN") {
        router.replace("/admin");
      } else {
        router.replace("/dashboard");
      }
    } catch (err: any) {
      await logUiEvent("Login error", true);
      const message =
        err?.response?.data?.message || "Login failed, please check credentials.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  if (!isHydrated && typeof window !== "undefined") {
    return null;
  }

  return (
    <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 border border-slate-200">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-semibold text-slate-800">
          Bank Account System
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Sign in to manage accounts and transactions.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            type="email"
            className="w-full border rounded-md px-3 py-2 text-sm bg-slate-50 border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="you@example.com"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">
            Password
          </label>
          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              className="w-full border rounded-md px-3 py-2 text-sm bg-slate-50 border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
            >
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center bg-blue-600 text-white rounded-md py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              Signing in...
            </div>
          ) : (
            "Sign in"
          )}
        </button>
      </form>

      <div className="mt-5 text-center">
        <p className="text-xs text-slate-500 mb-1">
          Don&apos;t have an account?
        </p>
        <button
          type="button"
          onClick={() => router.push("/register")}
          className="text-sm text-blue-600 hover:underline"
        >
          Create a new account
        </button>
      </div>
    </div>
  );
}