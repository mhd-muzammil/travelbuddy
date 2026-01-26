import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "../../lib/api.js";

export function NotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  async function load() {
    setLoading(true);
    const res = await api.get("/notifications");
    setItems(res?.data?.data?.notifications || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function markAll() {
    const res = await api.put("/notifications/read-all");
    if (res?.data?.success) {
      toast.success("All marked read");
      load();
    }
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Notifications</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">Buddy requests, invites, messages, likes, comments.</p>
        </div>
        <button
          onClick={markAll}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
        >
          Mark all read
        </button>
      </div>

      <div className="grid gap-2">
        {loading ? (
          <div className="h-40 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
        ) : items.length ? (
          items.map((n) => (
            <div
              key={n._id}
              className={[
                "rounded-2xl border border-zinc-200 bg-white p-4 text-sm dark:border-zinc-800 dark:bg-zinc-950",
                n.isRead ? "opacity-70" : "",
              ].join(" ")}
            >
              <div className="flex justify-between gap-3">
                <div className="font-medium">{n.type}</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">{String(n.createdAt).slice(0, 10)}</div>
              </div>
              <div className="mt-1 text-zinc-700 dark:text-zinc-200">{n.message}</div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
            No notifications.
          </div>
        )}
      </div>
    </div>
  );
}

