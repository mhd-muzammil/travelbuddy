import React from "react";

export function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="text-2xl font-semibold tracking-tight">About Travel Buddy</h2>
      <p className="mt-3 text-zinc-600 dark:text-zinc-300">
        Travel Buddy helps solo travelers and explorers connect with compatible companions and plan trips together. It combines
        profile-based matching with light NLP to improve recommendations and smart search.
      </p>

      <div className="mt-6 grid gap-3">
        {[
          "Create a rich traveler profile (style, budget, languages, interests).",
          "Find buddies with a match score and transparent reasons.",
          "Collaborate on trips (itinerary, accommodations, activities, notes).",
          "Chat in real time and get notifications.",
          "Split expenses and export reports as PDFs.",
        ].map((t) => (
          <div key={t} className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="text-sm">{t}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

