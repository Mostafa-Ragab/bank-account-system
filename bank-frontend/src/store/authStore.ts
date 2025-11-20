import { create } from "zustand";

export type User = {
  id: number;
  name: string;
  email: string;
  mobile: string;
  role: "ADMIN" | "USER";
  status: string;
  address?: string | null;
  profilePic?: string | null;
};

type AuthState = {
  user: User | null;
  token: string | null;
  isHydrated: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  hydrate: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isHydrated: false,

  setAuth: (user, token) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
    }
    set({ user, token, isHydrated: true });
  },

  clearAuth: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    set({ user: null, token: null, isHydrated: true });
  },

  hydrate: () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      const userString = localStorage.getItem("user");

      if (token && userString) {
        try {
          const user = JSON.parse(userString) as User;
          set({ user, token, isHydrated: true });
        } catch {
          set({ user: null, token: null, isHydrated: true });
        }
      } else {
        set({ user: null, token: null, isHydrated: true });
      }
    } else {
      set({ isHydrated: true });
    }
  },
}));