import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { fetchCurrentUser } from "../api/auth";
import { useAuth } from "../auth/AuthProvider";

export function DashboardPage() {
  const { user, logout } = useAuth();
  const { data } = useQuery({
    queryKey: ["me"],
    queryFn: fetchCurrentUser,
    initialData: user ?? undefined
  });

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white shadow">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <nav className="flex items-center gap-4 text-sm font-medium text-slate-700">
            <Link className="transition hover:text-slate-900" to="/dashboard">
              Dashboard
            </Link>
            {user?.is_superuser ? (
              <Link className="transition hover:text-slate-900" to="/admin/users">
                User Management
              </Link>
            ) : null}
          </nav>
          <button
            onClick={logout}
            className="rounded bg-slate-200 px-3 py-1 text-sm text-slate-800 transition hover:bg-slate-300"
          >
            Logout
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-lg font-semibold text-slate-800">Welcome back!</h2>
          {data ? (
            <p className="mt-2 text-slate-600">
              You are signed in as <span className="font-medium">{data.full_name ?? data.email}</span>.
            </p>
          ) : (
            <p className="mt-2 text-slate-600">Loading your profile...</p>
          )}
        </div>
      </main>
    </div>
  );
}
