"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/atoms/Button";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, clearAuth, isHydrated, hydrate } = useAuthStore();

  if (!isHydrated) hydrate();

  // hide navbar on login + register
  const hideOn = ["/", "/register"];
  if (hideOn.includes(pathname)) return null;

  function handleLogout() {
    clearAuth();
    router.replace("/");
  }

  return (
    <nav
      className="
        w-full bg-white shadow-sm border-b border-slate-200 
        px-6 py-3 flex justify-between items-center 
        fixed top-0 left-0 right-0 z-50
      "
    >
      {/* LEFT PART — TITLE */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-blue-600"></div>
        <h1 className="text-lg font-semibold text-slate-900">
          Bank Account System
        </h1>
      </div>

      {/* RIGHT PART — USER + LOGOUT */}
      {user && (
        <div className="flex items-center gap-4">
          {/* Avatar */}
          {user.profilePic ? (
            <img
              src={user.profilePic}
              className="w-8 h-8 rounded-full object-cover border border-slate-300"
              alt="profile"
            />
          ) : (
            <div
              className="
                w-8 h-8 rounded-full bg-slate-200 
                flex items-center justify-center 
                text-sm font-medium text-slate-700
              "
            >
              {user.name?.charAt(0).toUpperCase()}
            </div>
          )}

          {/* USER TEXT */}
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-medium text-slate-800">
              {user.name}
            </span>
            <span className="text-xs text-slate-500">
              {user.role === "ADMIN" ? "Administrator" : "User"}
            </span>
          </div>

          {/* LOGOUT BUTTON */}
          <Button
            onClick={handleLogout}
            className="
              h-8 px-4 bg-white text-slate-800 
              border border-slate-300 rounded-md
              hover:bg-slate-100 transition
            "
          >
            Logout
          </Button>
        </div>
      )}
    </nav>
  );
}