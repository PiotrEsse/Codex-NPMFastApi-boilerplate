import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { AuthTokens, User } from "../types";

type AuthState = {
  tokens: AuthTokens | null;
  user: User | null;
  setTokens: (tokens: AuthTokens | null) => void;
  setUser: (user: User | null) => void;
  clear: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      tokens: null,
      user: null,
      setTokens: (tokens) => set({ tokens }),
      setUser: (user) => set({ user }),
      clear: () => set({ tokens: null, user: null })
    }),
    {
      name: "auth-storage"
    }
  )
);
