"use client";

import type { Account } from "@/components/molecules/AccountCaard";
import { AccountCard } from "@/components/molecules/AccountCaard";
import { Button } from "@/components/atoms/Button";

type AccountListProps = {
  accounts: Account[];
  loading?: boolean;
  selectedAccountId?: number | null;
  onSelectAccount?: (account: Account) => void;
  onRefresh?: () => void;
};

export function AccountList({
  accounts,
  loading,
  selectedAccountId,
  onSelectAccount,
  onRefresh,
}: AccountListProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-semibold text-slate-800">
          Accounts
        </h2>
        {onRefresh ? (
          <Button
            type="button"
            loading={loading}
            className="h-7 px-2 text-xs"
            onClick={onRefresh}
          >
            Refresh
          </Button>
        ) : null}
      </div>

      {loading ? (
        <div className="text-sm text-slate-500">Loading accounts...</div>
      ) : accounts.length === 0 ? (
        <div className="text-sm text-slate-500 border rounded-lg p-3">
          No accounts found.
        </div>
      ) : (
        <div className="space-y-2 max-h-[420px] overflow-auto pr-1">
          {accounts.map((acc) => (
            <AccountCard
              key={acc.id}
              account={acc}
              isSelected={selectedAccountId === acc.id}
              onClick={
                onSelectAccount ? () => onSelectAccount(acc) : undefined
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}