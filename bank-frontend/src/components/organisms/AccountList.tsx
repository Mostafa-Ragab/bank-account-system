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
      {/* HEADER */}
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-semibold text-slate-800">Accounts</h2>

        {onRefresh && (
          <Button
            type="button"
            loading={loading}
            className="h-7 px-3 text-xs"
            onClick={onRefresh}
          >
            Refresh
          </Button>
        )}
      </div>

      {/* LIST CONTENT */}
      {loading ? (
        <div className="text-sm text-slate-500">Loading accounts...</div>
      ) : accounts.length === 0 ? (
        <div className="text-sm text-slate-500 border rounded-lg p-3">
          No accounts found.
        </div>
      ) : (
        <div className="space-y-2 max-h-[420px] overflow-auto pr-1">
          {accounts.map((acc) => {
            const isActive = acc.user.status === "ACTIVE";

            return (
              <AccountCard
                key={acc.id}
                account={acc}
                isSelected={selectedAccountId === acc.id}
                onClick={
                  onSelectAccount ? () => onSelectAccount(acc) : undefined
                }
                /* ACTION BUTTONS */
                actions={
                  <div className="flex gap-2">
                    {!isActive && onActivate && (
                      <Button
                        type="button"
                        className="h-7 px-2 text-xs bg-green-600 text-white hover:bg-green-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          onActivate(acc.user.id);
                        }}
                      >
                        Activate
                      </Button>
                    )}

                    {isActive && onDeactivate && (
                      <Button
                        type="button"
                        className="h-7 px-2 text-xs bg-slate-300 text-slate-900 hover:bg-slate-400"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeactivate(acc.user.id);
                        }}
                      >
                        Deactivate
                      </Button>
                    )}
                  </div>
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}