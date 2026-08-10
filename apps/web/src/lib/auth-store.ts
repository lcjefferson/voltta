"use client";

import { create } from "zustand";

type User = {
  id?: string;
  name: string;
  email: string;
  role?: string;
  companyId?: string;
  companyName?: string;
  companySlug?: string;
};

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  hydrated: boolean;
  hydrate: () => void;
  setAuth: (accessToken: string, refreshToken: string, user: User) => void;
  clearAuth: () => void;
};

function readUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("voltta_user");
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  hydrated: false,
  hydrate: () => {
    if (typeof window === "undefined") return;
    set({
      accessToken: localStorage.getItem("voltta_access_token"),
      refreshToken: localStorage.getItem("voltta_refresh_token"),
      user: readUser(),
      hydrated: true,
    });
  },
  setAuth: (accessToken, refreshToken, user) => {
    localStorage.setItem("voltta_access_token", accessToken);
    localStorage.setItem("voltta_refresh_token", refreshToken);
    localStorage.setItem("voltta_user", JSON.stringify(user));
    set({ accessToken, refreshToken, user, hydrated: true });
  },
  clearAuth: () => {
    localStorage.removeItem("voltta_access_token");
    localStorage.removeItem("voltta_refresh_token");
    localStorage.removeItem("voltta_user");
    set({ accessToken: null, refreshToken: null, user: null, hydrated: true });
  },
}));
