import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { api } from "../../lib/api.js";

function TripSkeleton() {
  return <div className="h-28 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />;
}

export function TripsPage() {
  const [tab, setTab] = useState("mine");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState([]);

  const [createOpen, setCreateOpen] = useState(false);
  const [create, setCreate] = useState({
    destination: "",
    startDate: "",
    endDate: "",
    budget: 0,
    tripType: "group",
    maxMembers: 4,
    tags: "",
    description: "",
  });

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("scope", tab);
    if (query) params.set("q", query);
    const res = await api.get(`/trips?${params.toString()}`);
    setTrips(res?.data?.data?.trips || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, query]);

  async function createTrip() {
    try {
      const payload = {
        ...create,
        budget: Number(create.budget || 0),
        maxMembers: Number(create.maxMembers || 0),
        tags: create.tags
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };
      const res = await api.post("/trips", payload);
      if (res?.data?.success) {
        toast.success("Trip created");
        setCreateOpen(false);
        setCreate({
          destination: "",
          startDate: "",
          endDate: "",
          budget: 0,
          tripType: "group",
          maxMembers: 4,
          tags: "",
          description: "",
        });
        load();
      }
    } catch (e) {
      toast.error(e?.normalizedMessage || "Create failed");
    }
  }

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Trips</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">Manage your trips and suggestions.</p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Create trip
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: "mine", label: "My trips" },
          { id: "joined", label: "Joined" },
          { id: "suggested", label: "Suggested" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={[
              "rounded-lg px-3 py-2 text-sm font-medium",
              tab === t.id
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                : "border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950",
            ].join(" ")}
          >
            {t.label}
          </button>
        ))}

        <input
          className="ml-auto w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950 md:w-72"
          placeholder="Search trips..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <TripSkeleton key={i} />)
          : trips.length
            ? trips.map((t) => (
                <Link
                  to={`/app/trips/${t._id}`}
                  key={t._id}
                  className="rounded-2xl border border-zinc-200 bg-white p-5 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
                >
                  <div className="text-sm font-semibold">{t.destination}</div>
                  <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {t.startDate?.slice(0, 10)} → {t.endDate?.slice(0, 10)} • {t.tripType} • Members {t.members?.length}/
                    {t.maxMembers}
                  </div>
                  <div className="mt-3 text-sm text-zinc-600 dark:text-zinc-300 line-clamp-2">{t.description}</div>
                </Link>
              ))
            : (
                <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
                  No trips here yet.
                </div>
              )}
      </div>

      {createOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div className="w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-semibold">Create trip</div>
                <div className="text-sm text-zinc-600 dark:text-zinc-300">Basic fields—editable later.</div>
              </div>
              <button
                className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                onClick={() => setCreateOpen(false)}
              >
                Close
              </button>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <input
                className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950 md:col-span-2"
                placeholder="Destination"
                value={create.destination}
                onChange={(e) => setCreate((c) => ({ ...c, destination: e.target.value }))}
              />
              <input
                className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                type="date"
                value={create.startDate}
                onChange={(e) => setCreate((c) => ({ ...c, startDate: e.target.value }))}
              />
              <input
                className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                type="date"
                value={create.endDate}
                onChange={(e) => setCreate((c) => ({ ...c, endDate: e.target.value }))}
              />
              <input
                className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                type="number"
                placeholder="Budget"
                value={create.budget}
                onChange={(e) => setCreate((c) => ({ ...c, budget: e.target.value }))}
              />
              <input
                className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                type="number"
                placeholder="Max members"
                value={create.maxMembers}
                onChange={(e) => setCreate((c) => ({ ...c, maxMembers: e.target.value }))}
              />
              <select
                className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                value={create.tripType}
                onChange={(e) => setCreate((c) => ({ ...c, tripType: e.target.value }))}
              >
                <option value="solo">Solo</option>
                <option value="group">Group</option>
                <option value="friends">Friends</option>
                <option value="backpack">Backpack</option>
              </select>
              <input
                className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                placeholder="Tags (comma separated)"
                value={create.tags}
                onChange={(e) => setCreate((c) => ({ ...c, tags: e.target.value }))}
              />
              <textarea
                className="min-h-24 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950 md:col-span-2"
                placeholder="Description"
                value={create.description}
                onChange={(e) => setCreate((c) => ({ ...c, description: e.target.value }))}
              />
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={createTrip}
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

