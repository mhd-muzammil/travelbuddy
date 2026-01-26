import React from "react";
import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <div className="grid gap-8 md:grid-cols-2 md:items-center">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
          Smart matching • Collaborative trips • Real-time chat
        </div>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-5xl">
          Travel Buddy
          <span className="block text-zinc-500 dark:text-zinc-400">A smart companion for seamless trips.</span>
        </h1>
        <p className="mt-4 text-zinc-600 dark:text-zinc-300">
          Create your traveler profile, find like-minded buddies, plan trips together, chat in real time, share experiences,
          and split expenses—end to end.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/register"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Create account
          </Link>
          <Link
            to="/explore"
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
          >
            Explore as guest
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="grid gap-4 md:grid-cols-2">
          {[
            { title: "Buddy matching", desc: "Destination + interests + budget + language." },
            { title: "Trip workspace", desc: "Itinerary, notes, accommodation, activities." },
            { title: "Real-time chat", desc: "1-to-1 + group trip rooms with typing." },
            { title: "Expense split", desc: "Equal/custom split + PDF export." },
          ].map((c) => (
            <div key={c.title} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
              <div className="text-sm font-semibold">{c.title}</div>
              <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{c.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

