"use client";

import { FormEvent, useState } from "react";
import type { Account } from "@/components/molecules/AccountCaard";
import { Label } from "@/components/atoms/Label";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";

type TransactionFormProps = {
  accounts: Account[];
  selectedAccountId?: number | null;
  onSelectAccount?: (accountId: number | null) => void;
  onCredit: (accountId: number, amount: number) => Promise<void> | void;
  onDebit: (accountId: number, amount: number) => Promise<void> | void;
  loadingCredit?: boolean;
  loadingDebit?: boolean;
};

export function TransactionForm({
  accounts,
  selectedAccountId,
  onSelectAccount,
  onCredit,
  onDebit,
  loadingCredit,
  loadingDebit,
}: TransactionFormProps) {
  const [amount, setAmount] = useState("");

  function parseAmount() {
    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) return null;
    return value;
  }

  async function handleCredit(e: FormEvent) {
    e.preventDefault();
    if (!selectedAccountId) return;
    const value = parseAmount();
    if (!value) return;
    await onCredit(selectedAccountId, value);
    setAmount("");
  }

  async function handleDebit(e: FormEvent) {
    e.preventDefault();
    if (!selectedAccountId) return;
    const value = parseAmount();
    if (!value) return;
    await onDebit(selectedAccountId, value);
    setAmount("");
  }

  return (
    <form className="space-y-3">
      <div>
        <Label>Account</Label>
        <select
          className="w-full border rounded-md px-3 py-2 text-sm bg-slate-50 border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={selectedAccountId ?? ""}
          onChange={(e) =>
            onSelectAccount
              ? onSelectAccount(
                  e.target.value ? Number(e.target.value) : null
                )
              : undefined
          }
        >
          <option value="">Select account</option>
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.user.name} — {acc.accountNo}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label>Amount</Label>
        <Input
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <div className="flex gap-2">
        <Button
          type="submit"
          loading={loadingCredit}
          className="flex-1 bg-green-600 hover:bg-green-700"
          onClick={handleCredit}
        >
          Credit
        </Button>
        <Button
          type="submit"
          loading={loadingDebit}
          className="flex-1 bg-yellow-500 hover:bg-yellow-600"
          onClick={handleDebit}
        >
          Debit
        </Button>
      </div>
    </form>
  );
}