import React, { useState } from "react";
import toast from "react-hot-toast";
import { api } from "../../lib/api.js";
import { useAuth } from "../../contexts/AuthContext.jsx";

export function SettingsPage() {
  const { logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function changePassword(e) {
    e.preventDefault();
    try {
      setBusy(true);
      const res = await api.put("/users/me/password", { currentPassword, newPassword });
      if (res?.data?.success) {
        toast.success("Password updated");
        setCurrentPassword("");
        setNewPassword("");
      }
    } catch (e2) {
      toast.error(e2?.normalizedMessage || "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function deleteAccount() {
    if (!confirm("Delete account? This cannot be undone.")) return;
    try {
      setBusy(true);
      const res = await api.delete("/users/me");
      if (res?.data?.success) {
        toast.success("Account deleted");
        logout();
      }
    } catch (e) {
      toast.error(e?.normalizedMessage || "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl grid gap-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">Security and preferences.</p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="text-sm font-semibold">Change password</div>
        <form onSubmit={changePassword} className="mt-4 grid gap-3">
          <input
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
            type="password"
            placeholder="Current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <input
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
            type="password"
            placeholder="New password (min 6)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={6}
            required
          />
          <button
            disabled={busy}
            className="w-fit rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Update password
          </button>
        </form>
      </div>

      <div className="rounded-2xl border border-red-200 bg-white p-6 dark:border-red-900/50 dark:bg-zinc-950">
        <div className="text-sm font-semibold text-red-700 dark:text-red-200">Danger zone</div>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">Delete your account and all associated data.</p>
        <button
          disabled={busy}
          onClick={deleteAccount}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
        >
          Delete account
        </button>
      </div>
    </div>
  );
}

