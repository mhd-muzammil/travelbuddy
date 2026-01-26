import React, { useEffect, useState } from "react";
import { api } from "../../lib/api.js";

export function RecommendationsPage() {
  const [loading, setLoading] = useState(true);
  const [buddies, setBuddies] = useState([]);
  const [trips, setTrips] = useState([]);
  const [text, setText] = useState("I love mountains, waterfalls and budget trekking trips");
  const [keywords, setKeywords] = useState([]);

  useEffect(() => {
    async function load() {
      const b = await api.get("/nlp/recommend/buddies");
      const t = await api.get("/nlp/recommend/trips");
      setBuddies(b?.data?.data?.results || []);
      setTrips(t?.data?.data?.results || []);
      setLoading(false);
    }
    load();
  }, []);

  async function extract() {
    const res = await api.post("/nlp/extract-interests", { text });
    setKeywords(res?.data?.data?.extractedKeywords || []);
  }

  return (
    <div className="grid gap-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Recommendations</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">Lightweight NLP + rule-based ranking.</p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="text-sm font-semibold">Interest extraction (NLP)</div>
        <div className="mt-3 grid gap-2">
          <textarea
            className="min-h-24 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button
            onClick={extract}
            className="w-fit rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Extract keywords
          </button>
          <div className="flex flex-wrap gap-2">
            {keywords.map((k) => (
              <span key={k} className="rounded-full border border-zinc-200 px-2 py-1 text-xs dark:border-zinc-800">
                {k}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="text-sm font-semibold">Recommended buddies</div>
          <div className="mt-3 grid gap-2">
            {loading ? (
              <div className="h-24 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
            ) : buddies.length ? (
              buddies.slice(0, 8).map((r) => (
                <div key={r.user._id} className="rounded-xl border border-zinc-200 px-4 py-3 text-sm dark:border-zinc-800">
                  <div className="flex justify-between gap-3">
                    <div className="font-medium">{r.user.fullName || r.user.username}</div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">{r.score}%</div>
                  </div>
                  <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{(r.reasons || []).join(" • ")}</div>
                </div>
              ))
            ) : (
              <div className="text-sm text-zinc-600 dark:text-zinc-300">No results yet.</div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="text-sm font-semibold">Recommended trips</div>
          <div className="mt-3 grid gap-2">
            {loading ? (
              <div className="h-24 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
            ) : trips.length ? (
              trips.slice(0, 8).map((r) => (
                <div key={r.trip._id} className="rounded-xl border border-zinc-200 px-4 py-3 text-sm dark:border-zinc-800">
                  <div className="flex justify-between gap-3">
                    <div className="font-medium">{r.trip.destination}</div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">{r.score}%</div>
                  </div>
                  <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{(r.reasons || []).join(" • ")}</div>
                </div>
              ))
            ) : (
              <div className="text-sm text-zinc-600 dark:text-zinc-300">No results yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

