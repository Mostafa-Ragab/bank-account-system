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

type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

export default function AdminPage() {
  const router = useRouter();
  const { user, token, hydrate, isHydrated } = useAuthStore();

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

  const [editName, setEditName] = useState("");
  const [editMobile, setEditMobile] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editStatus, setEditStatus] = useState("ACTIVE");

  const [updatingUser, setUpdatingUser] = useState(false);
  const [deletingUser, setDeletingUser] = useState(false);

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

  useEffect(() => {
    if (!selectedAccountId) return;
    const acc = accounts.find((a) => a.id === selectedAccountId);
    if (!acc) return;
    setEditName(acc.user.name ?? "");
    setEditMobile(acc.user.mobile ?? "");
    setEditAddress(acc.user.address ?? "");
    setEditStatus(acc.user.status ?? "ACTIVE");
  }, [selectedAccountId, accounts]);

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
              Account created successfully
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
      const e = err as ApiError;
      const message = e.response?.data?.message || "Failed to create account";
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
      toast(
        () => (
          <div className="text-sm">
            <p className="font-semibold">Debit successful</p>
          </div>
        ),
        {
          style: {
            background: "#fef3c7",
            color: "#92400e",
            border: "1px solid #facc15",
          },
          icon: "💸",
          duration: 4000,
        }
      );
      fetchAccounts();
    } catch (err: unknown) {
      const e = err as ApiError;
      const message = e.response?.data?.message || "Failed to debit";
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

  async function handleUpdateUser(): Promise<void> {
    if (!selectedAccountId) return;
    const acc = accounts.find((a) => a.id === selectedAccountId);
    if (!acc) return;
    const userId = acc.user.id;
    setUpdatingUser(true);
    try {
      await api.put(`/accounts/${userId}`, {
        name: editName,
        mobile: editMobile,
        address: editAddress,
        status: editStatus,
      });
      toast.success("User updated");
      fetchAccounts();
    } catch {
      toast.error("Failed to update user");
    } finally {
      setUpdatingUser(false);
    }
  }

  async function handleDeleteUser(): Promise<void> {
    if (!selectedAccountId) return;
    const acc = accounts.find((a) => a.id === selectedAccountId);
    if (!acc) return;
    const userId = acc.user.id;
    const confirmed = window.confirm(
      "Are you sure you want to delete this user and account?"
    );
    if (!confirmed) return;
    setDeletingUser(true);
    try {
      await api.delete(`/accounts/${userId}`);
      toast.success("User and account deleted");
      setSelectedAccountId(null);
      fetchAccounts();
    } catch {
      toast.error("Failed to delete user");
    } finally {
      setDeletingUser(false);
    }
  }

  if (!isHydrated) return null;

  const selectedAccount =
    selectedAccountId != null
      ? accounts.find((a) => a.id === selectedAccountId) ?? null
      : null;

  return (
    <div className="w-full max-w-7xl mx-auto mt-20 p-6">
      <header className="mb-10 flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
        <p className="text-sm text-slate-500">
          Manage users, accounts, transactions, and account status.
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

        <main className="lg:col-span-2 space-y-8">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-slate-700 mb-4 text-base">
              Accounts
            </h2>
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

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-slate-700 mb-1 text-base">
              Edit Selected User
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Update user information and status. Email and account number
              cannot be modified.
            </p>

            {!selectedAccount ? (
              <p className="text-sm text-slate-500">
                Select an account from the list above to edit user info.
              </p>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Mobile</Label>
                    <Input
                      value={editMobile}
                      onChange={(e) => setEditMobile(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label>Address</Label>
                  <Input
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Status</Label>
                    <select
                      className="border rounded-md px-3 py-2 w-full text-sm"
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </div>

                  <div>
                    <Label>Email</Label>
                    <Input
                      value={selectedAccount.user.email}
                      disabled
                      className="bg-slate-100"
                    />
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-3 pt-2">
                  <Button
                    type="button"
                    loading={updatingUser}
                    className="flex-1"
                    onClick={handleUpdateUser}
                    disabled={!selectedAccount}
                  >
                    Save Changes
                  </Button>
                  <Button
                    type="button"
                    loading={deletingUser}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                    onClick={handleDeleteUser}
                    disabled={!selectedAccount}
                  >
                    Delete User
                  </Button>
                </div>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}