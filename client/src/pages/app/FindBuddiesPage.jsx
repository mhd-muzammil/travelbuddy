import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api.js";

function BuddySkeleton() {
  return <div className="h-28 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />;
}

export function FindBuddiesPage() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({ travelStyle: "", language: "", destination: "" });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (filters.destination) params.set("destination", filters.destination);
      if (filters.language) params.set("language", filters.language);
      if (filters.travelStyle) params.set("travelStyle", filters.travelStyle);
      params.set("page", String(page));
      params.set("limit", "9");

      const res = await api.get(`/match/suggestions?${params.toString()}`);
      setItems(res?.data?.data?.results || []);
      setTotalPages(res?.data?.data?.pagination?.totalPages || 1);
      setLoading(false);
    }
    load();
  }, [query, filters, page]);

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Find Buddies</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">Suggestions with match score + reasons.</p>
        </div>
      </div>

      <div className="grid gap-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 md:grid-cols-4">
        <input
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950 md:col-span-2"
          placeholder="Search: mountains, Bali, budget..."
          value={query}
          onChange={(e) => {
            setPage(1);
            setQuery(e.target.value);
          }}
        />
        <input
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
          placeholder="Destination"
          value={filters.destination}
          onChange={(e) => {
            setPage(1);
            setFilters((f) => ({ ...f, destination: e.target.value }));
          }}
        />
        <select
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
          value={filters.travelStyle}
          onChange={(e) => {
            setPage(1);
            setFilters((f) => ({ ...f, travelStyle: e.target.value }));
          }}
        >
          <option value="">All styles</option>
          <option value="budget">Budget</option>
          <option value="backpacking">Backpacking</option>
          <option value="standard">Standard</option>
          <option value="luxury">Luxury</option>
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 9 }).map((_, i) => <BuddySkeleton key={i} />)
          : items.map((r) => (
              <Link
                key={r.user._id}
                to={`/app/buddies/${r.user._id}`}
                className="rounded-2xl border border-zinc-200 bg-white p-5 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">{r.user.fullName || r.user.username}</div>
                    <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      {r.user.location?.city ? `${r.user.location.city}, ` : ""}
                      {r.user.location?.country || "—"}
                    </div>
                  </div>
                  <div className="rounded-full bg-zinc-900 px-2 py-1 text-xs font-semibold text-white dark:bg-white dark:text-zinc-900">
                    {r.matchScore}%
                  </div>
                </div>
                <div className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
                  Style: <span className="text-zinc-700 dark:text-zinc-200">{r.user.travelStyle || "—"}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(r.commonInterests || []).slice(0, 4).map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-zinc-200 px-2 py-1 text-xs text-zinc-600 dark:border-zinc-800 dark:text-zinc-300"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <div className="mt-3 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                  {(r.reasons || []).join(" • ")}
                </div>
              </Link>
            ))}
      </div>

      <div className="flex items-center justify-center gap-2">
        <button
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950"
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Prev
        </button>
        <div className="text-sm text-zinc-600 dark:text-zinc-300">
          Page {page} / {totalPages}
        </div>
        <button
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950"
          disabled={page >= totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        >
          Next
        </button>
      </div>
    </div>
  );
}

