import api from "./client";
import type { AuthTokens, User } from "../types";

type LoginPayload = {
  email: string;
  password: string;
};

type RegisterPayload = LoginPayload & {
  full_name?: string;
};

export async function login(payload: LoginPayload): Promise<AuthTokens> {
  const response = await api.post<AuthTokens>("/auth/login", payload);
  return response.data;
}

export async function register(payload: RegisterPayload): Promise<AuthTokens> {
  const response = await api.post<AuthTokens>("/auth/register", payload);
  return response.data;
}

export async function fetchCurrentUser(): Promise<User> {
  const response = await api.get<User>("/users/me");
  return response.data;
}
