import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useState } from "react";
import { Link } from "react-router-dom";

import {
  createUser,
  deleteUser,
  fetchUsers,
  updateUser,
  type CreateUserPayload,
  type UpdateUserPayload
} from "../api/users";
import { useAuth } from "../auth/AuthProvider";
import type { User } from "../types";

type EditFormState = {
  email: string;
  full_name: string;
  password: string;
  is_active: boolean;
  is_superuser: boolean;
};

type MutationError = string | null;

const initialCreateState = {
  email: "",
  full_name: "",
  password: "",
  is_active: true,
  is_superuser: false
};

const initialEditState: EditFormState = {
  email: "",
  full_name: "",
  password: "",
  is_active: true,
  is_superuser: false
};

function resolveErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    return (
      (error.response?.data as { detail?: string } | undefined)?.detail ??
      error.message ??
      fallback
    );
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}

export function UsersPage() {
  const { logout } = useAuth();
  const queryClient = useQueryClient();
  const { data: users, isLoading, isError, error } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers
  });

  const [createForm, setCreateForm] = useState(initialCreateState);
  const [createError, setCreateError] = useState<MutationError>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditFormState>(initialEditState);
  const [editError, setEditError] = useState<MutationError>(null);

  const createMutation = useMutation({
    mutationFn: (payload: CreateUserPayload) => createUser(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["users"] });
      setCreateForm(initialCreateState);
      setCreateError(null);
    },
    onError: (mutationError) => {
      setCreateError(resolveErrorMessage(mutationError, "Unable to create user."));
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: UpdateUserPayload }) =>
      updateUser(id, values),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["users"] });
      setEditingId(null);
      setEditForm(initialEditState);
      setEditError(null);
    },
    onError: (mutationError) => {
      setEditError(resolveErrorMessage(mutationError, "Unable to update user."));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["users"] });
    }
  });

  const handleCreateSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreateError(null);

    const email = createForm.email.trim();
    if (!email) {
      setCreateError("Email is required.");
      return;
    }

    if (!createForm.password) {
      setCreateError("Password is required.");
      return;
    }

    createMutation.mutate({
      email,
      password: createForm.password,
      full_name: createForm.full_name.trim() || undefined,
      is_active: createForm.is_active,
      is_superuser: createForm.is_superuser
    });
  };

  const beginEdit = (user: User) => {
    setEditError(null);
    setEditingId(user.id);
    setEditForm({
      email: user.email,
      full_name: user.full_name ?? "",
      password: "",
      is_active: user.is_active,
      is_superuser: user.is_superuser
    });
  };

  const handleEditSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingId) {
      return;
    }

    const email = editForm.email.trim();
    if (!email) {
      setEditError("Email is required.");
      return;
    }

    updateMutation.mutate({
      id: editingId,
      values: {
        email,
        full_name: editForm.full_name.trim(),
        is_active: editForm.is_active,
        is_superuser: editForm.is_superuser,
        ...(editForm.password ? { password: editForm.password } : {})
      }
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(initialEditState);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white shadow">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <nav className="flex items-center gap-4 text-sm font-medium text-slate-700">
            <Link className="transition hover:text-slate-900" to="/dashboard">
              Dashboard
            </Link>
            <Link className="transition hover:text-slate-900" to="/admin/users">
              User Management
            </Link>
          </nav>
          <button
            onClick={logout}
            className="rounded bg-slate-200 px-3 py-1 text-sm text-slate-800 transition hover:bg-slate-300"
          >
            Logout
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-5xl space-y-8 px-6 py-10">
        <section className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-lg font-semibold text-slate-800">Create new user</h2>
          <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={handleCreateSubmit}>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-slate-700">Email</span>
              <input
                type="email"
                required
                value={createForm.email}
                onChange={(event) =>
                  setCreateForm((prev) => ({ ...prev, email: event.target.value }))
                }
                className="rounded border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-slate-700">Full name</span>
              <input
                type="text"
                value={createForm.full_name}
                onChange={(event) =>
                  setCreateForm((prev) => ({ ...prev, full_name: event.target.value }))
                }
                className="rounded border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-slate-700">Password</span>
              <input
                type="password"
                required
                value={createForm.password}
                onChange={(event) =>
                  setCreateForm((prev) => ({ ...prev, password: event.target.value }))
                }
                className="rounded border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              />
            </label>
            <div className="flex flex-col gap-3 text-sm text-slate-700">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={createForm.is_active}
                  onChange={(event) =>
                    setCreateForm((prev) => ({ ...prev, is_active: event.target.checked }))
                  }
                />
                Active
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={createForm.is_superuser}
                  onChange={(event) =>
                    setCreateForm((prev) => ({ ...prev, is_superuser: event.target.checked }))
                  }
                />
                Superuser
              </label>
            </div>
            <div className="md:col-span-2">
              {createError ? (
                <p className="mb-2 text-sm text-red-600">{createError}</p>
              ) : null}
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="rounded bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {createMutation.isPending ? "Creating..." : "Create user"}
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-lg bg-white p-6 shadow">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">Existing users</h2>
            {isLoading ? <span className="text-sm text-slate-500">Loading...</span> : null}
          </div>
          {isError ? (
            <p className="text-sm text-red-600">
              {resolveErrorMessage(error, "Unable to load users.")}
            </p>
          ) : null}
          {editError ? <p className="mb-3 text-sm text-red-600">{editError}</p> : null}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Full name</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {users?.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {editingId === user.id ? (
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(event) =>
                            setEditForm((prev) => ({ ...prev, email: event.target.value }))
                          }
                          className="w-full rounded border border-slate-300 px-2 py-1 text-sm focus:border-slate-500 focus:outline-none"
                        />
                      ) : (
                        user.email
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {editingId === user.id ? (
                        <input
                          type="text"
                          value={editForm.full_name}
                          onChange={(event) =>
                            setEditForm((prev) => ({ ...prev, full_name: event.target.value }))
                          }
                          className="w-full rounded border border-slate-300 px-2 py-1 text-sm focus:border-slate-500 focus:outline-none"
                        />
                      ) : (
                        user.full_name ?? "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {editingId === user.id ? (
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={editForm.is_active}
                            onChange={(event) =>
                              setEditForm((prev) => ({ ...prev, is_active: event.target.checked }))
                            }
                          />
                          Active
                        </label>
                      ) : user.is_active ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
                          Active
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {editingId === user.id ? (
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={editForm.is_superuser}
                            onChange={(event) =>
                              setEditForm((prev) => ({
                                ...prev,
                                is_superuser: event.target.checked
                              }))
                            }
                          />
                          Superuser
                        </label>
                      ) : user.is_superuser ? (
                        <span className="rounded-full bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-700">
                          Superuser
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-200 px-2 py-1 text-xs font-medium text-slate-600">
                          Standard
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(user.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      {editingId === user.id ? (
                        <form className="flex items-center justify-end gap-2" onSubmit={handleEditSubmit}>
                          <input
                            type="password"
                            placeholder="New password"
                            value={editForm.password}
                            onChange={(event) =>
                              setEditForm((prev) => ({ ...prev, password: event.target.value }))
                            }
                            className="w-40 rounded border border-slate-300 px-2 py-1 text-sm focus:border-slate-500 focus:outline-none"
                          />
                          <button
                            type="submit"
                            disabled={updateMutation.isPending}
                            className="rounded bg-slate-800 px-3 py-1 text-xs font-medium text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {updateMutation.isPending ? "Saving..." : "Save"}
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="rounded border border-slate-300 px-3 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-200"
                          >
                            Cancel
                          </button>
                        </form>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => beginEdit(user)}
                            className="rounded border border-slate-300 px-3 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-200"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(user.id)}
                            disabled={deleteMutation.isPending}
                            className="rounded border border-red-200 px-3 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {users && users.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No users found.</p>
          ) : null}
        </section>
      </main>
    </div>
  );
}
