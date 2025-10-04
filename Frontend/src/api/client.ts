import axios from "axios";

declare module "axios" {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface AxiosRequestConfig {
    _retry?: boolean;
  }
}

import { useAuthStore } from "../auth/store";
import type { AuthTokens } from "../types";

const apiBaseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: false
});

let refreshPromise: Promise<AuthTokens> | null = null;

async function refreshTokens(): Promise<AuthTokens> {
  if (!refreshPromise) {
    const { tokens, setTokens, clear } = useAuthStore.getState();
    if (!tokens?.refresh_token) {
      clear();
      return Promise.reject(new Error("No refresh token available"));
    }

    refreshPromise = axios
      .post<AuthTokens>(`${apiBaseUrl}/auth/refresh`, {
        refresh_token: tokens.refresh_token
      })
      .then((response) => {
        setTokens(response.data);
        return response.data;
      })
      .catch((error) => {
        clear();
        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

api.interceptors.request.use((config) => {
  const { tokens } = useAuthStore.getState();
  if (tokens?.access_token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${tokens.access_token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const { tokens } = useAuthStore.getState();

    if (
      error.response?.status === 401 &&
      tokens?.refresh_token &&
      !originalRequest?._retry
    ) {
      originalRequest._retry = true;
      try {
        const newTokens = await refreshTokens();
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${newTokens.access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
