import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../auth/AuthProvider";

type RegisterForm = {
  email: string;
  password: string;
  full_name?: string;
};

export function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<RegisterForm>();

  const onSubmit = handleSubmit(async (data) => {
    try {
      setError(null);
      await registerUser(data);
      navigate("/dashboard");
    } catch (err) {
      setError("Unable to register. Please try again with a different email.");
    }
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow">
        <h1 className="mb-6 text-2xl font-semibold text-slate-800">Create account</h1>
        {error && <p className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700">{error}</p>}
        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="full_name">
              Full name
            </label>
            <input
              id="full_name"
              type="text"
              className="mt-1 w-full rounded border border-slate-300 p-2 focus:border-blue-500 focus:outline-none"
              {...register("full_name")}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="mt-1 w-full rounded border border-slate-300 p-2 focus:border-blue-500 focus:outline-none"
              {...register("email", { required: "Email is required" })}
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="mt-1 w-full rounded border border-slate-300 p-2 focus:border-blue-500 focus:outline-none"
              {...register("password", { required: "Password is required", minLength: { value: 6, message: "Use at least 6 characters" } })}
            />
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
          </div>
          <button
            type="submit"
            className="w-full rounded bg-blue-600 py-2 text-white transition hover:bg-blue-700 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating account..." : "Sign up"}
          </button>
        </form>
        <p className="mt-4 text-sm text-slate-600">
          Already have an account? <Link className="text-blue-600 hover:underline" to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
