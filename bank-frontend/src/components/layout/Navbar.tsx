"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/atoms/Button";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, clearAuth, isHydrated, hydrate } = useAuthStore();

  if (!isHydrated) hydrate();

  const hideOn = ["/", "/register"];
  if (hideOn.includes(pathname)) return null;

  function handleLogout() {
    clearAuth();
    router.replace("/");
  }

  return (
    <nav className="w-full bg-white shadow-sm border-b border-slate-200 px-6 py-3 flex justify-between items-center fixed top-0 left-0 z-50">
      <h1 className="text-lg font-semibold text-slate-800">Bank System</h1>

      {user && (
        <div className="flex items-center gap-4">
          <p className="text-sm text-slate-600">
            {user.name} ({user.role})
          </p>
          <Button
            onClick={handleLogout}
            className="h-8 px-3 bg-white text-slate-800 border border-slate-300 hover:bg-slate-100"
          >
            Logout
          </Button>
        </div>
      )}
    </nav>
  );
}