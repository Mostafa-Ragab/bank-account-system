"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api, { logUiEvent } from "@/lib/api";
import { Card } from "@/components/atoms/Card";
import { Label } from "@/components/atoms/Label";
import { Input } from "@/components/atoms/Input";
import { PasswordInput } from "@/components/atoms/PasswordInput";
import { Button } from "@/components/atoms/Button";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/auth/register", {
        name,
        email,
        mobile,
        password,
        profilePic: null,
      });

      await logUiEvent("User registered", false);
      toast.success("Registration successful — awaiting admin activation.");
      router.replace("/");
    } catch (err: any) {
      await logUiEvent("Register error", true);
      const message =
        err?.response?.data?.message || "Registration failed. Try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <h1 className="text-2xl font-semibold mb-6 text-center text-slate-800">
        Create Your Account
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Full Name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            required
          />
        </div>

        <div>
          <Label>Mobile Number</Label>
          <Input
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            placeholder="05xxxxxxxx"
            required
          />
        </div>

        <div>
          <Label>Email Address</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="example@email.com"
            required
          />
        </div>

        <div>
          <Label>Password</Label>
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            placeholder="Min. 6 characters"
            required
          />
        </div>

        <Button type="submit" loading={loading} className="w-full">
          Create Account
        </Button>
      </form>

      <div className="mt-5 text-center">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="text-sm text-blue-600 hover:underline"
        >
          Back to Login
        </button>
      </div>
    </Card>
  );
}