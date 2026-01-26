import React, { useEffect, useMemo, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { api, filesBaseUrl } from "../../lib/api.js";

function Section({ title, children, right }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold">{title}</div>
        {right}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

export function TripDetailPage() {
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [trip, setTrip] = useState(null);

  const [itinerary, setItinerary] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [expenseSummary, setExpenseSummary] = useState(null);
  const [note, setNote] = useState("");

  const [newItem, setNewItem] = useState({
    dayNumber: 1,
    time: "09:00",
    title: "",
    location: "",
    notes: "",
    estimatedCost: 0,
  });

  const [newExpense, setNewExpense] = useState({
    title: "",
    amount: 0,
    category: "other",
    splitType: "equal",
  });

  const [uploadingGallery, setUploadingGallery] = useState(false);

  // ✅ new states
  const [forbidden, setForbidden] = useState(false);
  const [joining, setJoining] = useState(false);
  const loadingRef = useRef(false);


  const members = useMemo(() => trip?.members || [], [trip]);
  console.log("TRIPDETAIL LOAD RUNNING", id);


  async function load() {
  if (loadingRef.current) return;       // ✅ prevent infinite calls
  loadingRef.current = true;

  try {
    console.log("TRIPDETAIL LOAD RUNNING", id);

    setLoading(true);
    setForbidden(false);

    const t = await api.get(`/trips/${id}`);
    const tripData = t?.data?.data?.trip || null;
    setTrip(tripData);

    try {
      const it = await api.get(`/trips/${id}/itinerary`);
      setItinerary(it?.data?.data?.items || []);

      const ex = await api.get(`/expenses/trip/${id}`);
      setExpenses(ex?.data?.data?.expenses || []);

      const sum = await api.get(`/expenses/trip/${id}/summary`);
      setExpenseSummary(sum?.data?.data || null);

      const notes = await api.get(`/trips/${id}/notes`);
      setNote(notes?.data?.data?.note || "");
    } catch (err) {
      const status = err?.response?.status;
      if (status === 403) {
        setForbidden(true);
        setItinerary([]);
        setExpenses([]);
        setExpenseSummary(null);
        setNote("");
      } else {
        toast.error(err?.normalizedMessage || "Failed to load trip details");
      }
    }
  } catch (err) {
    toast.error(err?.normalizedMessage || "Failed to load trip");
    setTrip(null);
  } finally {
    setLoading(false);
    loadingRef.current = false;         // ✅ release lock
  }
}

  console.log("TRIPDETAIL LOAD RUNNING", id);


  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ✅ Join Trip button action
  async function joinTrip() {
    try {
      setJoining(true);
      const res = await api.post(`/trips/${id}/join`);
      if (res?.data?.success) {
        toast.success("Joined trip successfully");
        await load();
      }
    } catch (e) {
      toast.error(e?.normalizedMessage || "Failed to join trip");
    } finally {
      setJoining(false);
    }
  }

  async function addItineraryItem() {
    try {
      const res = await api.post(`/trips/${id}/itinerary/items`, {
        ...newItem,
        dayNumber: Number(newItem.dayNumber),
        estimatedCost: Number(newItem.estimatedCost || 0),
      });
      if (res?.data?.success) {
        toast.success("Itinerary item added");
        setNewItem({
          dayNumber: 1,
          time: "09:00",
          title: "",
          location: "",
          notes: "",
          estimatedCost: 0,
        });
        load();
      }
    } catch (e) {
      toast.error(e?.normalizedMessage || "Failed");
    }
  }

  async function saveNotes() {
    try {
      const res = await api.put(`/trips/${id}/notes`, { note });
      if (res?.data?.success) toast.success("Notes saved");
    } catch (e) {
      toast.error(e?.normalizedMessage || "Failed");
    }
  }

  async function addExpense() {
    try {
      const res = await api.post(`/expenses/trip/${id}`, {
        ...newExpense,
        amount: Number(newExpense.amount || 0),
      });
      if (res?.data?.success) {
        toast.success("Expense added");
        setNewExpense({ title: "", amount: 0, category: "other", splitType: "equal" });
        load();
      }
    } catch (e) {
      toast.error(e?.normalizedMessage || "Failed");
    }
  }

  async function downloadItineraryPdf() {
    window.open(`/api/trips/${id}/itinerary/export/pdf`, "_blank");
  }

  async function downloadExpensePdf() {
    window.open(`/api/expenses/trip/${id}/export/pdf`, "_blank");
  }

  if (loading) return <div className="h-40 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />;
  if (!trip) return <div className="text-sm text-zinc-600 dark:text-zinc-300">Trip not found.</div>;

  // ✅ Show Join Trip UI if forbidden
  if (forbidden) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-2xl font-semibold tracking-tight">{trip.destination}</h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
          You are not a member of this trip. Join to access itinerary, expenses, notes and gallery upload.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            onClick={joinTrip}
            disabled={joining}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {joining ? "Joining..." : "Join Trip"}
          </button>

          <button
            onClick={() => window.history.back()}
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">{trip.destination}</h2>
            <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
              {trip.startDate?.slice(0, 10)} → {trip.endDate?.slice(0, 10)} • {trip.tripType} • Budget {trip.budget}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={downloadItineraryPdf}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
            >
              Export itinerary PDF
            </button>
            <button
              onClick={downloadExpensePdf}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
            >
              Export expenses PDF
            </button>
          </div>
        </div>

        <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-200">{trip.description}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {(trip.tags || []).map((t) => (
            <span key={t} className="rounded-full border border-zinc-200 px-2 py-1 text-xs dark:border-zinc-800">
              {t}
            </span>
          ))}
        </div>

        {Array.isArray(trip.gallery) && trip.gallery.length ? (
          <div className="mt-5 grid gap-3 md:grid-cols-4">
            {trip.gallery.map((url) => (
              <img
                key={url}
                src={`${filesBaseUrl}${url}`}
                alt="Trip"
                className="h-28 w-full rounded-xl border border-zinc-200 object-cover dark:border-zinc-800"
              />
            ))}
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Section title="Members">
          <div className="grid gap-2">
            {members.map((m) => (
              <div key={m._id} className="rounded-xl border border-zinc-200 px-4 py-3 text-sm dark:border-zinc-800">
                {m.fullName || m.username}
              </div>
            ))}
          </div>
        </Section>

        <Section
          title="Shared notes / checklist"
          right={
            <button
              onClick={saveNotes}
              className="rounded-lg bg-zinc-900 px-3 py-2 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Save
            </button>
          }
        >
          <textarea
            className="min-h-40 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="- Buy sim card\n- Book hostel\n- Pack rain jacket"
          />
        </Section>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Section title="Itinerary planner">
          <div className="grid gap-2">
            {itinerary.length ? (
              itinerary
                .slice()
                .sort((a, b) => a.dayNumber - b.dayNumber || String(a.time).localeCompare(String(b.time)))
                .map((i) => (
                  <div key={i._id} className="rounded-xl border border-zinc-200 p-4 text-sm dark:border-zinc-800">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-medium">
                        Day {i.dayNumber} • {i.time} — {i.title}
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">${i.estimatedCost || 0}</div>
                    </div>
                    <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{i.location}</div>
                    {i.notes ? <div className="mt-2 text-xs text-zinc-600 dark:text-zinc-300">{i.notes}</div> : null}
                  </div>
                ))
            ) : (
              <div className="text-sm text-zinc-600 dark:text-zinc-300">No itinerary items yet.</div>
            )}
          </div>

          <div className="mt-4 grid gap-2 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800 md:grid-cols-2">
            <input
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
              type="number"
              min={1}
              value={newItem.dayNumber}
              onChange={(e) => setNewItem((s) => ({ ...s, dayNumber: e.target.value }))}
              placeholder="Day"
            />
            <input
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
              value={newItem.time}
              onChange={(e) => setNewItem((s) => ({ ...s, time: e.target.value }))}
              placeholder="Time"
            />
            <input
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950 md:col-span-2"
              value={newItem.title}
              onChange={(e) => setNewItem((s) => ({ ...s, title: e.target.value }))}
              placeholder="Title"
            />
            <input
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
              value={newItem.location}
              onChange={(e) => setNewItem((s) => ({ ...s, location: e.target.value }))}
              placeholder="Location"
            />
            <input
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
              value={newItem.estimatedCost}
              onChange={(e) => setNewItem((s) => ({ ...s, estimatedCost: e.target.value }))}
              type="number"
              placeholder="Estimated cost"
            />
            <textarea
              className="min-h-16 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950 md:col-span-2"
              value={newItem.notes}
              onChange={(e) => setNewItem((s) => ({ ...s, notes: e.target.value }))}
              placeholder="Notes"
            />
            <button
              onClick={addItineraryItem}
              className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 md:col-span-2"
            >
              Add itinerary item
            </button>
          </div>
        </Section>

        <Section title="Expenses">
          <div className="grid gap-2">
            {expenses.length ? (
              expenses.map((e) => (
                <div key={e._id} className="rounded-xl border border-zinc-200 p-4 text-sm dark:border-zinc-800">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium">{e.title}</div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">${e.amount}</div>
                  </div>
                  <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {e.category} • split: {e.splitType}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-zinc-600 dark:text-zinc-300">No expenses yet.</div>
            )}
          </div>

          {expenseSummary ? (
            <div className="mt-4 rounded-xl border border-zinc-200 p-4 text-sm dark:border-zinc-800">
              <div className="font-medium">Summary</div>
              <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">Total spent: ${expenseSummary.totalSpent}</div>
              <div className="mt-3 grid gap-1">
                {expenseSummary.balances?.map((b) => (
                  <div key={b.userId} className="flex justify-between text-xs">
                    <span className="text-zinc-600 dark:text-zinc-300">{b.name}</span>
                    <span className="text-zinc-500 dark:text-zinc-400">
                      {b.balance >= 0 ? `gets back $${b.balance}` : `owes $${Math.abs(b.balance)}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-4 grid gap-2 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
            <input
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
              value={newExpense.title}
              onChange={(e) => setNewExpense((s) => ({ ...s, title: e.target.value }))}
              placeholder="Expense title"
            />
            <div className="grid gap-2 md:grid-cols-2">
              <input
                className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                value={newExpense.amount}
                onChange={(e) => setNewExpense((s) => ({ ...s, amount: e.target.value }))}
                type="number"
                placeholder="Amount"
              />
              <select
                className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                value={newExpense.category}
                onChange={(e) => setNewExpense((s) => ({ ...s, category: e.target.value }))}
              >
                <option value="hotel">Hotel</option>
                <option value="food">Food</option>
                <option value="transport">Transport</option>
                <option value="activity">Activity</option>
                <option value="other">Other</option>
              </select>
            </div>
            <select
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
              value={newExpense.splitType}
              onChange={(e) => setNewExpense((s) => ({ ...s, splitType: e.target.value }))}
            >
              <option value="equal">Split equally</option>
              <option value="custom">Custom split (server supports)</option>
            </select>
            <button
              onClick={addExpense}
              className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Add expense
            </button>
          </div>
        </Section>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Section title="Trip gallery upload">
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            Upload photos to the shared gallery. Images are stored on the server and shown above.
          </p>

          <form
            className="mt-4 flex flex-wrap items-center gap-3"
            onSubmit={async (e) => {
              e.preventDefault();
              const input = e.currentTarget.elements.namedItem("images");
              if (!input || !input.files || !input.files.length) {
                toast.error("Select one or more images");
                return;
              }
              const formData = new FormData();
              Array.from(input.files).forEach((file) => formData.append("images", file));

              try {
                setUploadingGallery(true);
                const res = await api.post(`/trips/${id}/gallery`, formData, {
                  headers: { "Content-Type": "multipart/form-data" },
                });

                if (res?.data?.success) {
                  toast.success("Gallery updated");
                  setTrip((tPrev) => (tPrev ? { ...tPrev, gallery: res.data.data.gallery } : tPrev));
                }
              } catch (err) {
                toast.error(err?.normalizedMessage || "Upload failed");
              } finally {
                setUploadingGallery(false);
              }
            }}
          >
            <input
              type="file"
              name="images"
              multiple
              accept="image/*"
              className="text-xs file:mr-3 file:rounded-lg file:border file:border-zinc-200 file:bg-white file:px-3 file:py-2 file:text-xs file:font-medium file:text-zinc-700 hover:file:bg-zinc-50 dark:file:border-zinc-800 dark:file:bg-zinc-950 dark:file:text-zinc-200"
            />
            <button
              type="submit"
              disabled={uploadingGallery}
              className="rounded-lg bg-zinc-900 px-3 py-2 text-xs font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {uploadingGallery ? "Uploading..." : "Upload images"}
            </button>
          </form>
        </Section>
      </div>
    </div>
  );
}
