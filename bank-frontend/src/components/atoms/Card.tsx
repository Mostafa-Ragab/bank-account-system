"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "w-full max-w-md bg-white shadow-lg rounded-2xl p-8 border border-slate-200",
        "animate-fade-in",
        className
      )}
    >
      {children}
    </div>
  );
}