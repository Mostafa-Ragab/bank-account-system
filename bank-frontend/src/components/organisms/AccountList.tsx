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
  onActivate?: (userId: number) => void;
  onDeactivate?: (userId: number) => void;
};

export function AccountList({
  accounts,
  loading,
  selectedAccountId,
  onSelectAccount,
  onRefresh,
  onActivate,
  onDeactivate,
}: AccountListProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-semibold text-slate-800">Accounts</h2>
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
              actions={
                acc.user.status !== "ACTIVE" && onActivate ? (
                  <Button
                    type="button"
                    className="h-7 px-2 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      onActivate(acc.user.id);
                    }}
                  >
                    Activate
                  </Button>
                ) : acc.user.status === "ACTIVE" && onDeactivate ? (
                  <Button
                    type="button"
                    className="h-7 px-2 text-xs bg-slate-200 text-slate-800 hover:bg-slate-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeactivate(acc.user.id);
                    }}
                  >
                    Deactivate
                  </Button>
                ) : null
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}