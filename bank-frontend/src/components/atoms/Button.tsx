"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  variant?: Variant;
  size?: Size;
};

export function Button({
  loading,
  leftIcon,
  rightIcon,
  className,
  children,
  disabled,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  const variantClasses: Record<Variant, string> = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400 disabled:text-white",
    outline:
      "bg-white text-slate-900 border border-slate-300 hover:bg-slate-100 disabled:text-slate-400",
    ghost:
      "bg-transparent text-slate-900 hover:bg-slate-100 disabled:text-slate-400",
    danger:
      "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400 disabled:text-white",
  };

  const sizeClasses: Record<Size, string> = {
    sm: "h-8 px-3 text-xs",
    md: "h-9 px-4 text-sm",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition whitespace-nowrap",
        "disabled:opacity-70 disabled:cursor-not-allowed",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {leftIcon && !loading ? <span className="mr-2">{leftIcon}</span> : null}
      <span>{children}</span>
      {rightIcon && !loading ? <span className="ml-2">{rightIcon}</span> : null}
    </button>
  );
}