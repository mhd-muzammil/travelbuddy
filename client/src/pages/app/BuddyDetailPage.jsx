import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { api, filesBaseUrl } from "../../lib/api.js";

export function BuddyDetailPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [relationship, setRelationship] = useState(null);

  async function load() {
    setLoading(true);
    const res = await api.get(`/users/${id}`);
    setProfile(res?.data?.data?.user || null);
    const rel = await api.get(`/match/requests?userId=${id}`);
    setRelationship(rel?.data?.data || null);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function sendRequest() {
    try {
      const res = await api.post("/match/request", { toUserId: id });
      if (res?.data?.success) {
        toast.success("Request sent");
        load();
      }
    } catch (e) {
      toast.error(e?.normalizedMessage || "Failed");
    }
  }

  async function cancel(requestId) {
    try {
      const res = await api.delete(`/match/cancel/${requestId}`);
      if (res?.data?.success) {
        toast.success("Request cancelled");
        load();
      }
    } catch (e) {
      toast.error(e?.normalizedMessage || "Failed");
    }
  }

  async function accept(requestId) {
    try {
      const res = await api.post("/match/accept", { requestId });
      if (res?.data?.success) {
        toast.success("Request accepted");
        load();
      }
    } catch (e) {
      toast.error(e?.normalizedMessage || "Failed");
    }
  }

  async function reject(requestId) {
    try {
      const res = await api.post("/match/reject", { requestId });
      if (res?.data?.success) {
        toast.success("Request rejected");
        load();
      }
    } catch (e) {
      toast.error(e?.normalizedMessage || "Failed");
    }
  }

  async function block() {
    try {
      const res = await api.post(`/users/block/${id}`);
      if (res?.data?.success) {
        toast.success("User blocked");
        load();
      }
    } catch (e) {
      toast.error(e?.normalizedMessage || "Failed");
    }
  }

  async function unblock() {
    try {
      const res = await api.post(`/users/unblock/${id}`);
      if (res?.data?.success) {
        toast.success("User unblocked");
        load();
      }
    } catch (e) {
      toast.error(e?.normalizedMessage || "Failed");
    }
  }

  if (loading) return <div className="h-40 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />;
  if (!profile) return <div className="text-sm text-zinc-600 dark:text-zinc-300">User not found.</div>;

  const req = relationship?.request || null;
  const isBlocked = !!relationship?.isBlocked;

  return (
    <div className="mx-auto max-w-3xl grid gap-4">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              {profile.fullName || profile.username}
            </h2>
            <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
              {profile.location?.city ? `${profile.location.city}, ` : ""}
              {profile.location?.country || "—"} • {profile.travelStyle || "—"}
            </div>
          </div>
          {profile.avatarUrl ? (
            <img
              src={`${filesBaseUrl}${profile.avatarUrl}`}
              alt="Avatar"
              className="h-12 w-12 rounded-full border border-zinc-200 object-cover dark:border-zinc-700"
            />
          ) : null}
          <div className="flex flex-wrap gap-2">
            {req?.status === "accepted" && (
              <Link
                to={`/app/chat/${profile._id}`}
                className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                💬 Message
              </Link>
            )}
            {!req && (
              <button
                onClick={sendRequest}
                className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Send request
              </button>
            )}
            {req?.status === "pending" && (
              <>
                {req.direction === "outgoing" ? (
                  <button
                    onClick={() => cancel(req._id)}
                    className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                  >
                    Cancel request
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => accept(req._id)}
                      className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => reject(req._id)}
                      className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                    >
                      Reject
                    </button>
                  </>
                )}
              </>
            )}
            {isBlocked ? (
              <button
                onClick={unblock}
                className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
              >
                Unblock
              </button>
            ) : (
              <button
                onClick={block}
                className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
              >
                Block
              </button>
            )}
          </div>
        </div>

        <p className="mt-4 text-sm text-zinc-700 dark:text-zinc-200">
          {profile.bio || "No bio provided yet."}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {(profile.interests || []).slice(0, 12).map((t) => (
            <span
              key={t}
              className="rounded-full border border-zinc-200 px-2 py-1 text-xs text-zinc-600 dark:border-zinc-800 dark:text-zinc-300"
            >
              {t}
            </span>
          ))}
        </div>

        <div className="mt-4 grid gap-2 text-sm text-zinc-600 dark:text-zinc-300 md:grid-cols-2">
          <div>Email: {profile.email || "Hidden"}</div>
          <div>Phone: {profile.phone || "Hidden"}</div>
        </div>
      </div>
    </div>
  );
}

