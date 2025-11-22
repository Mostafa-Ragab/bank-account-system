"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import api, { logUiEvent } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { ProfileForm, ProfileData } from "@/components/organisms/ProfileForm";

type AccountMeResponse = {
  user: {
    name: string;
    email: string;
    mobile: string;
    address?: string | null;
    profilePic?: string | null;
  };
};

type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, token, isHydrated, hydrate } = useAuthStore();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const savingRef = useRef(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!isHydrated) return;

    if (!token || !user) {
      router.replace("/");
      return;
    }

    if (user.role === "ADMIN") {
      router.replace("/admin");
      return;
    }

    fetchProfile();
  }, [isHydrated, token, user, router]);

  async function fetchProfile() {
    setLoading(true);
    try {
      const res = await api.get<AccountMeResponse>("/accounts/me");
      const u = res.data.user;

      setProfile({
        name: u.name,
        email: u.email,
        mobile: u.mobile,
        address: u.address ?? "",
        profilePic: u.profilePic ?? "",
      });

      logUiEvent("Loaded profile page", false).catch(() => {});
    } catch {
      toast.error("Failed to load profile");
      logUiEvent("Load profile error", true).catch(() => {});
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(data: Partial<ProfileData>) {
    if (savingRef.current) return;
    savingRef.current = true;

    const payload = {
      name: data.name,
      address: data.address,
      profilePic: data.profilePic,
    };

    try {
      await api.put("/accounts/me", payload);
      toast.success("Profile updated successfully");
      logUiEvent("Profile updated", false).catch(() => {});
      fetchProfile();
    } catch (err: unknown) {
      const e = err as ApiError;
      const msg = e.response?.data?.message || "Failed to update profile";
      toast.error(msg);
      logUiEvent("Profile update error", true).catch(() => {});
    } finally {
      savingRef.current = false;
    }
  }

  if (!isHydrated || loading || !profile) {
    return (
      <div className="w-full flex items-center justify-center mt-32">
        <div className="text-sm text-slate-500">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto mt-16">
      <div className="bg-white shadow-lg rounded-2xl p-8 border border-slate-100">
        <div className="mb-6 border-b border-slate-100 pb-4">
          <h1 className="text-2xl font-semibold text-slate-800">My Profile</h1>
          <p className="text-sm text-slate-500 mt-1">
            Update your personal information. Email and mobile are read-only.
          </p>
        </div>
        <ProfileForm initial={profile} onSubmit={handleUpdate} />
      </div>
    </div>
  );
}