import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { api, filesBaseUrl } from "../../lib/api.js";

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}

export function DashboardPage() {
  const [data, setData] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load Dashboard Data AND Incoming Requests
  async function load() {
    try {
      // Parallel fetch for speed
      const [dashRes, reqRes] = await Promise.all([
        api.get("/dashboard"),
        api.get("/match/incoming"), // 👈 Uses the new endpoint
      ]);

      setData(dashRes?.data?.data || null);
      setRequests(reqRes?.data?.data?.requests || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // Handlers
  async function handleAccept(requestId) {
    try {
      await api.post("/match/accept", { requestId });
      toast.success("Request accepted!");
      load(); // Reload to update lists
    } catch (e) {
      toast.error("Failed to accept");
    }
  }

  async function handleReject(requestId) {
    try {
      await api.post("/match/reject", { requestId });
      toast.success("Request rejected");
      load();
    } catch (e) {
      toast.error("Failed to reject");
    }
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
            Quick stats, recommendations, and recent activity.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/app/trips"
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
          >
            Trips
          </Link>
          <Link
            to="/app/buddies"
            className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Find Buddies
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Stat
          label="Pending requests"
          value={loading ? "…" : requests.length}
        />
        <Stat
          label="Matches"
          value={loading ? "…" : (data?.stats?.matches ?? 0)}
        />
        <Stat
          label="Active trips"
          value={loading ? "…" : (data?.stats?.activeTrips ?? 0)}
        />
      </div>

      {/* 🔔 NEW: Notifications Section */}
      {requests.length > 0 && (
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 dark:border-blue-900/30 dark:bg-blue-900/10">
          <h3 className="mb-3 text-sm font-semibold text-blue-900 dark:text-blue-200">
            🔔 You have {requests.length} new buddy request
            {requests.length > 1 ? "s" : ""}
          </h3>
          <div className="grid gap-3 md:grid-cols-2">
            {requests.map((req) => (
              <div
                key={req._id}
                className="flex items-center justify-between rounded-xl bg-white p-3 shadow-sm dark:bg-zinc-900"
              >
                <Link
                  to={`/app/buddies/${req.fromUser._id}`}
                  className="flex items-center gap-3"
                >
                  {req.fromUser.avatarUrl ? (
                    <img
                      src={`${filesBaseUrl}${req.fromUser.avatarUrl}`}
                      className="h-10 w-10 rounded-full object-cover"
                      alt=""
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                  )}
                  <div>
                    <div className="text-sm font-medium">
                      {req.fromUser.fullName}
                    </div>
                    <div className="text-xs text-zinc-500">
                      Wants to connect
                    </div>
                  </div>
                </Link>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAccept(req._id)}
                    className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleReject(req._id)}
                    className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs hover:bg-zinc-50 dark:border-zinc-700"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="text-sm font-semibold">Recommended buddies</div>
          <div className="mt-3 grid gap-2">
            {loading ? (
              <div className="h-24 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
            ) : data?.recommendedBuddies?.length ? (
              data.recommendedBuddies.slice(0, 4).map((b) => (
                <Link
                  key={b.user._id}
                  to={`/app/buddies/${b.user._id}`}
                  className="flex items-center justify-between rounded-xl border border-zinc-200 px-4 py-3 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
                >
                  <div className="font-medium">
                    {b.user.fullName || b.user.username}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    {b.matchScore}%
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-sm text-zinc-600 dark:text-zinc-300">
                Complete your profile to get better suggestions.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="text-sm font-semibold">Recommended trips</div>
          <div className="mt-3 grid gap-2">
            {loading ? (
              <div className="h-24 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
            ) : data?.recommendedTrips?.length ? (
              data.recommendedTrips.slice(0, 4).map((t) => (
                <Link
                  key={t.trip._id}
                  to={`/app/trips/${t.trip._id}`}
                  className="flex items-center justify-between rounded-xl border border-zinc-200 px-4 py-3 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
                >
                  <div className="font-medium">{t.trip.destination}</div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    {t.score}%
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-sm text-zinc-600 dark:text-zinc-300">
                No recommendations yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
