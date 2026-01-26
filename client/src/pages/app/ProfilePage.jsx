import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api, filesBaseUrl } from "../../lib/api.js";
import { useAuth } from "../../contexts/AuthContext.jsx";

export function ProfilePage() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    age: "",
    gender: "",
    phone: "",
    bio: "",
    languages: "",
    city: "",
    country: "",
    travelStyle: "budget",
    interests: "",
    preferredDestinations: "",
    preferredTripDuration: "",
    budgetMin: "",
    budgetMax: "",
    showEmail: false,
    showPhone: false,
  });
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/users/me");
        const u = res?.data?.data?.user;
        if (!u) return;
        setUser(u);
        setForm((f) => ({
          ...f,
          fullName: u.fullName || "",
          username: u.username || "",
          age: u.age || "",
          gender: u.gender || "",
          phone: u.phone || "",
          bio: u.bio || "",
          languages: (u.languages || []).join(", "),
          city: u.location?.city || "",
          country: u.location?.country || "",
          travelStyle: u.travelStyle || "budget",
          interests: (u.interests || []).join(", "),
          preferredDestinations: (u.preferredDestinations || []).join(", "),
          preferredTripDuration: u.preferredTripDuration || "",
          budgetMin: u.budgetRange?.min ?? "",
          budgetMax: u.budgetRange?.max ?? "",
          showEmail: !!u.privacy?.showEmail,
          showPhone: !!u.privacy?.showPhone,
        }));
      } catch {}
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSave(e) {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        fullName: form.fullName,
        username: form.username,
        age: form.age ? Number(form.age) : undefined,
        gender: form.gender || undefined,
        phone: form.phone || undefined,
        bio: form.bio || undefined,
        languages: form.languages
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        location: { city: form.city || "", country: form.country || "" },
        travelStyle: form.travelStyle,
        interests: form.interests
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        preferredDestinations: form.preferredDestinations
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        preferredTripDuration: form.preferredTripDuration || undefined,
        budgetRange: {
          min: form.budgetMin ? Number(form.budgetMin) : undefined,
          max: form.budgetMax ? Number(form.budgetMax) : undefined,
        },
        privacy: { showEmail: form.showEmail, showPhone: form.showPhone },
      };
      const res = await api.put("/users/me", payload);
      if (res?.data?.success) {
        setUser(res.data.data.user);
        toast.success("Profile updated");
      }
    } catch (err) {
      toast.error(err?.normalizedMessage || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Profile</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">Keep this updated for better matching.</p>
        </div>
        <div className="flex items-center gap-3">
          {user?.avatarUrl ? (
            <img
              src={`${filesBaseUrl}${user.avatarUrl}`}
              alt="Avatar"
              className="h-10 w-10 rounded-full border border-zinc-200 object-cover dark:border-zinc-700"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-dashed border-zinc-300 text-xs text-zinc-400 dark:border-zinc-700 dark:text-zinc-500">
              No avatar
            </div>
          )}
          <div className="text-xs text-zinc-500 dark:text-zinc-400">{user?.email}</div>
        </div>
      </div>

      <form onSubmit={onSave} className="mt-6 grid gap-4">
        <div className="grid gap-4 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 md:grid-cols-2">
          <label className="grid gap-1 text-sm">
            <span className="text-zinc-600 dark:text-zinc-300">Full name</span>
            <input
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950"
              value={form.fullName}
              onChange={(e) => update("fullName", e.target.value)}
              required
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-zinc-600 dark:text-zinc-300">Username</span>
            <input
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950"
              value={form.username}
              onChange={(e) => update("username", e.target.value)}
              required
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-zinc-600 dark:text-zinc-300">Age</span>
            <input
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950"
              value={form.age}
              onChange={(e) => update("age", e.target.value)}
              type="number"
              min={16}
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-zinc-600 dark:text-zinc-300">Gender</span>
            <input
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950"
              value={form.gender}
              onChange={(e) => update("gender", e.target.value)}
              placeholder="optional"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-zinc-600 dark:text-zinc-300">Phone (optional)</span>
            <input
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="optional"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-zinc-600 dark:text-zinc-300">Languages (comma separated)</span>
            <input
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950"
              value={form.languages}
              onChange={(e) => update("languages", e.target.value)}
              placeholder="English, Spanish"
            />
          </label>
          <label className="grid gap-1 text-sm md:col-span-2">
            <span className="text-zinc-600 dark:text-zinc-300">Bio</span>
            <textarea
              className="min-h-24 rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950"
              value={form.bio}
              onChange={(e) => update("bio", e.target.value)}
              placeholder="Tell others about your travel vibe"
            />
          </label>
        </div>

        <div className="grid gap-4 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 md:grid-cols-2">
          <label className="grid gap-1 text-sm">
            <span className="text-zinc-600 dark:text-zinc-300">City</span>
            <input
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950"
              value={form.city}
              onChange={(e) => update("city", e.target.value)}
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-zinc-600 dark:text-zinc-300">Country</span>
            <input
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950"
              value={form.country}
              onChange={(e) => update("country", e.target.value)}
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-zinc-600 dark:text-zinc-300">Travel style</span>
            <select
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950"
              value={form.travelStyle}
              onChange={(e) => update("travelStyle", e.target.value)}
            >
              <option value="budget">Budget</option>
              <option value="backpacking">Backpacking</option>
              <option value="standard">Standard</option>
              <option value="luxury">Luxury</option>
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-zinc-600 dark:text-zinc-300">Preferred duration</span>
            <input
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950"
              value={form.preferredTripDuration}
              onChange={(e) => update("preferredTripDuration", e.target.value)}
              placeholder="e.g. 5-7 days"
            />
          </label>
          <label className="grid gap-1 text-sm md:col-span-2">
            <span className="text-zinc-600 dark:text-zinc-300">Interests (comma separated)</span>
            <input
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950"
              value={form.interests}
              onChange={(e) => update("interests", e.target.value)}
              placeholder="mountains, waterfalls, trekking"
            />
          </label>
          <label className="grid gap-1 text-sm md:col-span-2">
            <span className="text-zinc-600 dark:text-zinc-300">Preferred destinations (comma separated)</span>
            <input
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950"
              value={form.preferredDestinations}
              onChange={(e) => update("preferredDestinations", e.target.value)}
              placeholder="Nepal, Bali, Iceland"
            />
          </label>
          <div className="grid gap-2 text-sm md:col-span-2 md:grid-cols-2">
            <label className="grid gap-1">
              <span className="text-zinc-600 dark:text-zinc-300">Budget min</span>
              <input
                className="rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950"
                value={form.budgetMin}
                onChange={(e) => update("budgetMin", e.target.value)}
                type="number"
                min={0}
              />
            </label>
            <label className="grid gap-1">
              <span className="text-zinc-600 dark:text-zinc-300">Budget max</span>
              <input
                className="rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950"
                value={form.budgetMax}
                onChange={(e) => update("budgetMax", e.target.value)}
                type="number"
                min={0}
              />
            </label>
          </div>
          <div className="mt-2 flex flex-wrap gap-4 text-sm md:col-span-2">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={form.showEmail} onChange={(e) => update("showEmail", e.target.checked)} />
              <span className="text-zinc-700 dark:text-zinc-200">Show email publicly</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={form.showPhone} onChange={(e) => update("showPhone", e.target.checked)} />
              <span className="text-zinc-700 dark:text-zinc-200">Show phone publicly</span>
            </label>
          </div>
        </div>

        <button
          disabled={saving}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {saving ? "Saving..." : "Save profile"}
        </button>
      </form>

      <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 text-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="font-semibold">Avatar</div>
        <p className="mt-1 text-zinc-600 dark:text-zinc-300">Upload an image to personalize your profile.</p>
        <form
          className="mt-4 flex flex-wrap items-center gap-3"
          onSubmit={async (e) => {
            e.preventDefault();
            const input = e.currentTarget.elements.namedItem("avatar");
            if (!input || !input.files || !input.files[0]) {
              toast.error("Please choose an image");
              return;
            }
            const file = input.files[0];
            const formData = new FormData();
            formData.append("avatar", file);
            try {
              setAvatarUploading(true);
              const res = await api.put("/users/me/avatar", formData, {
                headers: { "Content-Type": "multipart/form-data" },
              });
              if (res?.data?.success) {
                const updated = { ...(user || {}), avatarUrl: res.data.data.avatarUrl };
                setUser(updated);
                toast.success("Avatar updated");
              }
            } catch (err) {
              toast.error(err?.normalizedMessage || "Upload failed");
            } finally {
              setAvatarUploading(false);
            }
          }}
        >
          <input
            type="file"
            name="avatar"
            accept="image/*"
            className="text-xs file:mr-3 file:rounded-lg file:border file:border-zinc-200 file:bg-white file:px-3 file:py-2 file:text-xs file:font-medium file:text-zinc-700 hover:file:bg-zinc-50 dark:file:border-zinc-800 dark:file:bg-zinc-950 dark:file:text-zinc-200"
          />
          <button
            type="submit"
            disabled={avatarUploading}
            className="rounded-lg bg-zinc-900 px-3 py-2 text-xs font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {avatarUploading ? "Uploading..." : "Upload avatar"}
          </button>
        </form>
      </div>
    </div>
  );
}

