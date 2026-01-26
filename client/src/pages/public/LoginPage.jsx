import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext.jsx";

export function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    try {
      setSubmitting(true);
      const ok = await login(email, password);
      if (ok) nav(loc.state?.from || "/app");
    } catch (err) {
      toast.error(err?.normalizedMessage || "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
      <h2 className="text-xl font-semibold">Login</h2>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">Access your trips, buddies, chat, and expenses.</p>

      <form onSubmit={onSubmit} className="mt-5 grid gap-3">
        <label className="grid gap-1 text-sm">
          <span className="text-zinc-600 dark:text-zinc-300">Email</span>
          <input
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
          />
        </label>

        <label className="grid gap-1 text-sm">
          <span className="text-zinc-600 dark:text-zinc-300">Password</span>
          <input
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
          />
        </label>

        <button
          disabled={submitting}
          className="mt-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {submitting ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <div className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">
        No account?{" "}
        <Link className="font-medium underline" to="/register">
          Register
        </Link>
      </div>
    </div>
  );
}

