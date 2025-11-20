"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api, { logUiEvent } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

import type { Account } from "@/components/molecules/AccountCaard";
import { AccountList } from "@/components/organisms/AccountList";
import { TransactionForm } from "@/components/organisms/TransactionForm";
import { Label } from "@/components/atoms/Label";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";

export default function AdminPage() {
  const router = useRouter();
  const { user, token, hydrate, isHydrated, clearAuth } = useAuthStore();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  const [creating, setCreating] = useState(false);
  const [crediting, setCrediting] = useState(false);
  const [debiting, setDebiting] = useState(false);

  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newMobile, setNewMobile] = useState("");
  const [newProfilePic, setNewProfilePic] = useState("");

  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(
    null
  );

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

    if (user.role !== "ADMIN") {
      router.replace("/dashboard");
      return;
    }

    if (didInitRef.current) return;
    didInitRef.current = true;

    fetchAccounts();
  }, [isHydrated, token, user, router]);

  async function fetchAccounts() {
    setLoadingAccounts(true);
    try {
      const res = await api.get("/accounts");
      const list: Account[] = res.data;
      setAccounts(list);

      if (!selectedAccountId && list.length > 0) {
        setSelectedAccountId(list[0].id);
      }

      logUiEvent("Loaded admin accounts", false).catch(() => {});
    } catch (err) {
      logUiEvent("Load admin accounts error", true).catch(() => {});
      toast.error("Failed to load accounts");
    } finally {
      setLoadingAccounts(false);
    }
  }

  function handleLogout() {
    clearAuth();
    router.replace("/");
  }

  async function handleCreateAccount(e: FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post("/accounts", {
        name: newName,
        email: newEmail,
        mobile: newMobile,
        profilePic: newProfilePic || null,
      });

      setNewName("");
      setNewEmail("");
      setNewMobile("");
      setNewProfilePic("");

      logUiEvent("Admin created account", false).catch(() => {});
      toast.success("Account created");

      await fetchAccounts();
    } catch (err: any) {
      logUiEvent("Admin create account error", true).catch(() => {});
      const message =
        err?.response?.data?.message || "Failed to create account";
      toast.error(message);
    } finally {
      setCreating(false);
    }
  }

  async function handleCreditTx(accountId: number, amount: number) {
    setCrediting(true);
    try {
      await api.post("/transactions/credit", {
        accountId,
        amount,
      });
      logUiEvent("Admin credited account", false).catch(() => {});
      toast.success("Credit transaction successful");
      await fetchAccounts();
    } catch (err) {
      logUiEvent("Admin credit transaction error", true).catch(() => {});
      toast.error("Failed to credit account");
    } finally {
      setCrediting(false);
    }
  }

  async function handleDebitTx(accountId: number, amount: number) {
    setDebiting(true);
    try {
      await api.post("/transactions/debit", {
        accountId,
        amount,
      });
      logUiEvent("Admin debited account", false).catch(() => {});
      toast.success("Debit transaction successful");
      await fetchAccounts();
    } catch (err: any) {
      logUiEvent("Admin debit transaction error", true).catch(() => {});
      const message =
        err?.response?.data?.message || "Failed to debit account";
      toast.error(message);
    } finally {
      setDebiting(false);
    }
  }

  if (!isHydrated) {
    return null;
  }

  return (
    <div className="w-full max-w-6xl bg-white shadow-lg rounded-xl p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Admin Panel</h1>
          <p className="text-sm text-slate-500">Logged in as {user?.name}</p>
        </div>
        <Button
          type="button"
          onClick={handleLogout}
          className="h-8 px-3 bg-white text-slate-800 border border-slate-300 hover:bg-slate-50"
        >
          Logout
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <div>
            <h2 className="text-sm font-semibold mb-2">Create New Account</h2>
            <form onSubmit={handleCreateAccount} className="space-y-3">
              <div>
                <Label>Full name</Label>
                <Input
                  placeholder="Full name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  placeholder="Email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                  type="email"
                />
              </div>
              <div>
                <Label>Mobile</Label>
                <Input
                  placeholder="Mobile"
                  value={newMobile}
                  onChange={(e) => setNewMobile(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Profile picture URL (optional)</Label>
                <Input
                  placeholder="https://..."
                  value={newProfilePic}
                  onChange={(e) => setNewProfilePic(e.target.value)}
                />
              </div>

              <Button type="submit" loading={creating} className="w-full">
                Create account
              </Button>
            </form>
          </div>

          <div>
            <h2 className="text-sm font-semibold mb-2">Transactions</h2>
            <TransactionForm
              accounts={accounts}
              selectedAccountId={selectedAccountId ?? undefined}
              onSelectAccount={(id) => setSelectedAccountId(id)}
              onCredit={handleCreditTx}
              onDebit={handleDebitTx}
              loadingCredit={crediting}
              loadingDebit={debiting}
            />
          </div>
        </div>

        <div className="lg:col-span-2">
          <AccountList
            accounts={accounts}
            loading={loadingAccounts}
            selectedAccountId={selectedAccountId ?? undefined}
            onSelectAccount={(acc) => setSelectedAccountId(acc.id)}
            onRefresh={fetchAccounts}
          />
        </div>
      </div>
    </div>
  );
}