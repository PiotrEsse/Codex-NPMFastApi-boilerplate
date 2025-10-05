import api from "./client";
import type { User } from "../types";

export type CreateUserPayload = {
  email: string;
  password: string;
  full_name?: string;
  is_active?: boolean;
  is_superuser?: boolean;
};

export type UpdateUserPayload = {
  email?: string;
  password?: string;
  full_name?: string | null;
  is_active?: boolean;
  is_superuser?: boolean;
};

export async function fetchUsers(): Promise<User[]> {
  const response = await api.get<User[]>("/users/");
  return response.data;
}

export async function createUser(payload: CreateUserPayload): Promise<User> {
  const response = await api.post<User>("/users/", payload);
  return response.data;
}

export async function updateUser(id: string, payload: UpdateUserPayload): Promise<User> {
  const response = await api.patch<User>(`/users/${id}`, payload);
  return response.data;
}

export async function deleteUser(id: string): Promise<void> {
  await api.delete(`/users/${id}`);
}
