import React, { useEffect, useState } from "react";
import { api } from "../../lib/api.js";

function SkeletonCard() {
  return <div className="h-28 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />;
}

export function ExplorePage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setError("");
        const res = await api.get("/trips?public=true&limit=6");
        setItems(res?.data?.data?.trips || []);
      } catch (e) {
        setError(e?.normalizedMessage || "Failed to load");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight">Explore</h2>
      <p className="mt-2 text-zinc-600 dark:text-zinc-300">Guest-friendly preview of public trips and stories.</p>

      {error ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : items.length
            ? items.map((t) => (
                <div
                  key={t._id}
                  className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <div className="text-sm font-semibold">{t.destination}</div>
                  <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-300 line-clamp-2">{t.description}</div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                    <span className="rounded-full border border-zinc-200 px-2 py-1 dark:border-zinc-800">
                      {t.tripType}
                    </span>
                    <span className="rounded-full border border-zinc-200 px-2 py-1 dark:border-zinc-800">
                      Budget: {t.budget}
                    </span>
                  </div>
                </div>
              ))
            : (
                <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
                  No public trips yet. Seed data will create a few demo trips.
                </div>
              )}
      </div>
    </div>
  );
}

