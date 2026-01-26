import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext.jsx";

export function RegisterPage() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    try {
      setSubmitting(true);
      const ok = await register({ fullName, username, email, password });
      if (ok) nav("/app/profile");
    } catch (err) {
      toast.error(err?.normalizedMessage || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
      <h2 className="text-xl font-semibold">Create account</h2>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">Join Travel Buddy and start matching.</p>

      <form onSubmit={onSubmit} className="mt-5 grid gap-3">
        <label className="grid gap-1 text-sm">
          <span className="text-zinc-600 dark:text-zinc-300">Full name</span>
          <input
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="text-zinc-600 dark:text-zinc-300">Username</span>
          <input
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>
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
            minLength={6}
            required
          />
        </label>

        <button
          disabled={submitting}
          className="mt-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {submitting ? "Creating..." : "Create account"}
        </button>
      </form>

      <div className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">
        Already have an account?{" "}
        <Link className="font-medium underline" to="/login">
          Login
        </Link>
      </div>
    </div>
  );
}

