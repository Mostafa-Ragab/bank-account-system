"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type AccountUser = {
  id: number;
  name: string;
  email: string;
  mobile: string;
  status: string;
};

export type Account = {
  id: number;
  userId: number;
  balance: number;
  accountNo: string;
  user: AccountUser;
};

type AccountCardProps = {
  account: Account;
  isSelected?: boolean;
  onClick?: () => void;
  actions?: ReactNode;
};

export function AccountCard({
  account,
  isSelected,
  onClick,
  actions
}: AccountCardProps) {
  const disabled = !!actions; // disables click while buttons exist

  return (
    <div
      onClick={!disabled ? onClick : undefined}
      className={cn(
        "border rounded-lg p-3 flex items-start justify-between gap-3 text-sm",
        disabled ? "cursor-default" : "cursor-pointer",
        "hover:bg-slate-50 transition",
        isSelected ? "border-blue-500 bg-blue-50/40" : "border-slate-200 bg-white"
      )}
    >
      <div className="space-y-1">
        <div className="font-semibold text-slate-800">{account.user.name}</div>

        <div className="text-xs text-slate-500">{account.user.email}</div>
        <div className="text-xs text-slate-500">{account.user.mobile}</div>

        <div className="text-xs mt-1">
          <span className="font-medium text-slate-700">Account:</span>{" "}
          <span className="text-slate-800">{account.accountNo}</span>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1 text-right">
        <div className="text-xs uppercase tracking-wide text-slate-500">
          Balance
        </div>

        <div className="text-base font-semibold text-slate-900">
          AED {account.balance.toFixed(2)}
        </div>

        <span
          className={cn(
            "mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
            account.user.status === "ACTIVE"
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          )}
        >
          {account.user.status}
        </span>

        {actions ? <div className="mt-2 flex">{actions}</div> : null}
      </div>
    </div>
  );
}