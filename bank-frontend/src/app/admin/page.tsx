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

type CreateAccountPayload = {
  name: string;
  email: string;
  mobile: string;
  profilePic?: string | null;
};

type ApiListResponse = Account[];

type CreateAccountResponse = {
  user: Account["user"];
  account: Account;
  tempPassword: string;
};

export default function AdminPage() {
  const router = useRouter();
  const { user, token, hydrate, isHydrated } = useAuthStore();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState<boolean>(true);

  const [creating, setCreating] = useState<boolean>(false);
  const [crediting, setCrediting] = useState<boolean>(false);
  const [debiting, setDebiting] = useState<boolean>(false);

  const [newName, setNewName] = useState<string>("");
  const [newEmail, setNewEmail] = useState<string>("");
  const [newMobile, setNewMobile] = useState<string>("");
  const [newProfilePic, setNewProfilePic] = useState<string>("");

  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(
    null
  );

  const didInitRef = useRef<boolean>(false);

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

  async function fetchAccounts(): Promise<void> {
    setLoadingAccounts(true);

    try {
      const res = await api.get<ApiListResponse>("/accounts");
      const list = res.data;

      setAccounts(list);

      if (!selectedAccountId && list.length > 0) {
        setSelectedAccountId(list[0].id);
      }

      logUiEvent("Loaded admin accounts", false);
    } catch {
      toast.error("Failed to load accounts");
      logUiEvent("Load admin accounts error", true);
    } finally {
      setLoadingAccounts(false);
    }
  }

  async function handleCreateAccount(
    e: FormEvent<HTMLFormElement>
  ): Promise<void> {
    e.preventDefault();
    setCreating(true);

    const payload: CreateAccountPayload = {
      name: newName,
      email: newEmail,
      mobile: newMobile,
      profilePic: newProfilePic || null,
    };

    try {
      const res = await api.post<CreateAccountResponse>("/accounts", payload);
      const { tempPassword } = res.data;

      setNewName("");
      setNewEmail("");
      setNewMobile("");
      setNewProfilePic("");

      toast(
        (t) => (
          <div className="flex flex-col gap-3">
            <p className="font-semibold text-slate-900">
              ✅ Account created successfully
            </p>

            <p className="text-sm">
              Temp Password:{" "}
              <span className="font-mono bg-slate-100 px-1 rounded">
                {tempPassword}
              </span>
            </p>

            <button
              onClick={() => {
                navigator.clipboard.writeText(tempPassword);
                toast.dismiss(t.id);
                toast.success("Password copied to clipboard");
              }}
              className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
            >
              Copy Password
            </button>
          </div>
        ),
        {
          duration: 7000,
          style: {
            background: "#ffffff",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            padding: "14px 16px",
          },
        }
      );

      logUiEvent("Admin created account", false);

      fetchAccounts();
    } catch (err: unknown) {
      const message =
        (err as any)?.response?.data?.message || "Failed to create account";
      toast.error(message);
      logUiEvent("Admin create account error", true);
    } finally {
      setCreating(false);
    }
  }

  async function handleCreditTx(
    accountId: number,
    amount: number
  ): Promise<void> {
    setCrediting(true);
    try {
      await api.post("/transactions/credit", { accountId, amount });
      toast.success("Credit successful");
      fetchAccounts();
    } catch {
      toast.error("Failed to credit");
    } finally {
      setCrediting(false);
    }
  }

  async function handleDebitTx(
    accountId: number,
    amount: number
  ): Promise<void> {
    setDebiting(true);
    try {
      await api.post("/transactions/debit", { accountId, amount });
      toast.success("Debit successful");
      fetchAccounts();
    } catch (err: unknown) {
      const message =
        (err as any)?.response?.data?.message || "Failed to debit";
      toast.error(message);
    } finally {
      setDebiting(false);
    }
  }

  async function handleActivate(userId: number): Promise<void> {
    try {
      await api.patch(`/accounts/activate/${userId}`);
      toast.success("User activated");
      fetchAccounts();
    } catch {
      toast.error("Activation failed");
    }
  }

  async function handleDeactivate(userId: number): Promise<void> {
    try {
      await api.patch(`/accounts/deactivate/${userId}`);
      toast.success("User deactivated");
      fetchAccounts();
    } catch {
      toast.error("Deactivation failed");
    }
  }

  if (!isHydrated) return null;

  return (
    <div className="w-full max-w-7xl mx-auto mt-20 p-6">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage users, accounts, and transactions
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <aside className="space-y-8">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-slate-700 mb-4 text-base">
              Create New Account
            </h2>

            <form className="space-y-4" onSubmit={handleCreateAccount}>
              <div>
                <Label>Full name</Label>
                <Input
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>

              <div>
                <Label>Email</Label>
                <Input
                  required
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
              </div>

              <div>
                <Label>Mobile</Label>
                <Input
                  required
                  value={newMobile}
                  onChange={(e) => setNewMobile(e.target.value)}
                />
              </div>

              <div>
                <Label>Profile Picture</Label>
                <Input
                  value={newProfilePic}
                  onChange={(e) => setNewProfilePic(e.target.value)}
                />
              </div>

              <Button loading={creating} className="w-full">
                Create Account
              </Button>
            </form>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-slate-700 mb-4 text-base">
              Transactions
            </h2>

            <TransactionForm
              accounts={accounts}
              selectedAccountId={selectedAccountId ?? undefined}
              onSelectAccount={(id) => setSelectedAccountId(id)}
              onCredit={handleCreditTx}
              onDebit={handleDebitTx}
              loadingCredit={crediting}
              loadingDebit={debiting}
            />
          </section>
        </aside>

        <main className="lg:col-span-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <AccountList
              accounts={accounts}
              loading={loadingAccounts}
              selectedAccountId={selectedAccountId ?? undefined}
              onSelectAccount={(acc) => setSelectedAccountId(acc.id)}
              onRefresh={fetchAccounts}
              onActivate={handleActivate}
              onDeactivate={handleDeactivate}
            />
          </section>
        </main>
      </div>
    </div>
  );
}