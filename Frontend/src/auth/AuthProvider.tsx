import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";

import { fetchCurrentUser, login as loginRequest, register as registerRequest } from "../api/auth";
import type { User } from "../types";
import { useAuthStore } from "./store";

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  initializing: boolean;
  login: (payload: { email: string; password: string }) => Promise<void>;
  register: (payload: { email: string; password: string; full_name?: string }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const tokens = useAuthStore((state) => state.tokens);
  const setTokens = useAuthStore((state) => state.setTokens);
  const setUser = useAuthStore((state) => state.setUser);
  const clear = useAuthStore((state) => state.clear);
  const user = useAuthStore((state) => state.user);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function bootstrap() {
      if (isMounted) {
        setInitializing(true);
      }

      if (tokens?.access_token && !user) {
        try {
          const profile = await fetchCurrentUser();
          if (isMounted) {
            setUser(profile);
          }
        } catch (error) {
          if (isMounted) {
            clear();
          }
        }
      } else if (isMounted && !tokens?.access_token) {
        setUser(null);
      }

      if (isMounted) {
        setInitializing(false);
      }
    }

    void bootstrap();

    return () => {
      isMounted = false;
    };
  }, [tokens, user, setUser, clear]);

  const login = useCallback(
    async (payload: { email: string; password: string }) => {
      const authTokens = await loginRequest(payload);
      setTokens(authTokens);
      const profile = await fetchCurrentUser();
      setUser(profile);
    },
    [setTokens, setUser]
  );

  const register = useCallback(
    async (payload: { email: string; password: string; full_name?: string }) => {
      const authTokens = await registerRequest(payload);
      setTokens(authTokens);
      const profile = await fetchCurrentUser();
      setUser(profile);
    },
    [setTokens, setUser]
  );

  const logout = useCallback(() => {
    clear();
  }, [clear]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(tokens?.access_token && user),
      initializing,
      login,
      register,
      logout
    }),
    [user, tokens, initializing, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
