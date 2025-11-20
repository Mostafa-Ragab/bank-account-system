"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import api, { logUiEvent } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/atoms/Button";
import { ProfileForm, ProfileData } from "@/components/organisms/ProfileForm";

export default function ProfilePage() {
  const router = useRouter();
  const { user, token, isHydrated, hydrate, clearAuth } = useAuthStore();

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
      const res = await api.get("/accounts/me");
      const u = res.data.user;

      setProfile({
        name: u.name,
        email: u.email,
        mobile: u.mobile,
        address: u.address,
        profilePic: u.profilePic,
      });

      logUiEvent("Loaded profile page", false).catch(() => {});
    } catch (err) {
      toast.error("Failed to load profile");
      logUiEvent("Load profile error", true).catch(() => {});
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(data: Partial<ProfileData>) {
    if (savingRef.current) return;
    savingRef.current = true;

    try {
      await api.put("/accounts/me", data);
      toast.success("Profile updated successfully");
      fetchProfile();
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to update profile";
      toast.error(msg);
    } finally {
      savingRef.current = false;
    }
  }

  function handleLogout() {
    clearAuth();
    router.replace("/");
  }

  if (!isHydrated || loading || !profile) {
    return (
      <div className="w-full text-center mt-20 text-slate-500">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl bg-white shadow-lg rounded-xl p-8 mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Your Profile</h1>
        <Button
          type="button"
          onClick={handleLogout}
          className="h-8 px-3 bg-white text-slate-800 border border-slate-300 hover:bg-slate-50"
        >
          Logout
        </Button>
      </div>

      <ProfileForm initial={profile} onSubmit={handleUpdate} />
    </div>
  );
}