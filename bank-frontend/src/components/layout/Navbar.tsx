"use client";

import Image from "next/image";
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
    <nav
      className="
        w-full bg-white/95 backdrop-blur 
        border-b border-slate-200 shadow-sm
        px-6 py-3 
        fixed top-0 left-0 right-0 z-50
        flex items-center justify-between
      "
    >
      {/* LEFT — Title */}
      <div className="flex items-center gap-2 select-none">
        <div className="w-2 h-2 rounded-full bg-blue-600"></div>
        <h1 className="text-xl font-bold text-slate-900">
          Bank Account System
        </h1>
      </div>

      {/* RIGHT — User Block */}
      {user && (
        <div className="flex items-center gap-5">

          {/* Avatar */}
          <div className="w-10 h-10 relative">
            {user.profilePic ? (
              <Image
                src={user.profilePic}
                alt="profile"
                fill
                className="rounded-full object-cover border border-slate-300 shadow-sm"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-slate-200 flex items-center justify-center text-lg font-semibold text-slate-700">
                {user.name?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Name + Role */}
          <div className="flex flex-col justify-center text-right min-w-[120px]">
            <span className="text-sm font-semibold text-slate-900 leading-tight">
              {user.name}
            </span>
            <span className="text-xs text-slate-500 leading-tight">
              {user.role === "ADMIN" ? "Administrator" : "User"}
            </span>
          </div>

          {/* Logout Button */}
         <Button
  onClick={handleLogout}
  variant="outline"
  size="md"
>
  Logout
</Button>
        </div>
      )}
    </nav>
  );
}