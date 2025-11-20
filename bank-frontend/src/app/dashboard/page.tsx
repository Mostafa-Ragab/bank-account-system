"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api, { logUiEvent } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

import { DashboardSummary } from "@/components/organisms/DashboardSummary";
import { Button } from "@/components/atoms/Button";

type Transaction = {
  id: number;
  type: string;
  amount: number;
  createdAt: string;
};

type DashboardData = {
  balance: number;
  debitHistory: Transaction[];
  creditHistory: Transaction[];
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, token, hydrate, isHydrated, clearAuth } = useAuthStore();

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const didInitRef = useRef(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!isHydrated) return;

    if (!token || !user) {
      router.replace("/");
      return;
    }

    if (user.role === "ADMIN") {
      router.replace("/admin");
      return;
    }

    if (didInitRef.current) return;
    didInitRef.current = true;

    fetchData();
  }, [isHydrated, token, user, router]);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await api.get("/transactions/me");
      setData(res.data);
      logUiEvent("Loaded user dashboard", false).catch(() => {});
    } catch (err) {
      logUiEvent("Load user dashboard error", true).catch(() => {});
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    clearAuth();
    router.replace("/");
  }

  if (!isHydrated) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl bg-white shadow-lg rounded-xl p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">User Dashboard</h1>
          <p className="text-sm text-slate-500">Welcome, {user?.name}</p>
        </div>
        <Button
          type="button"
          onClick={handleLogout}
          className="h-8 px-3 bg-white text-slate-800 border border-slate-300 hover:bg-slate-50"
        >
          Logout
        </Button>
      </div>

      {loading || !data ? (
        <div className="text-center text-sm text-slate-500">Loading...</div>
      ) : (
        <DashboardSummary
          balance={data.balance}
          debitHistory={data.debitHistory}
          creditHistory={data.creditHistory}
        />
      )}
    </div>
  );
}