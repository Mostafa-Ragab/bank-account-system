"use client";

import type { ReactNode } from "react";
import { Label } from "@/components/atoms/Label";
import { Input } from "@/components/atoms/Input";
import { PasswordInput } from "@/components/atoms/PasswordInput";

type AuthFieldProps = {
  label: string;
  type?: "text" | "email" | "password";
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  error?: string | null; // optional error message
};

export function AuthField({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  required,
  error,
}: AuthFieldProps) {
  const FieldComponent =
    type === "password" ? PasswordInput : Input;

  return (
    <div className="space-y-1">
      <Label>{label}</Label>

      <FieldComponent
        type={type === "password" ? "text" : type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
      />

      {error ? (
        <p className="text-xs text-red-600">{error}</p>
      ) : null}
    </div>
  );
}