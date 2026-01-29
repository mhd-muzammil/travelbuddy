import React, { useEffect, useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

function ThemeToggle() {
  // 1. Initialize state strictly once (No useEffect needed for initial value)
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem("tb_theme");
    if (stored !== null) {
      return stored === "dark";
    }
    // Fallback: check if the 'dark' class is already on <html>
    return document.documentElement.classList.contains("dark");
  });

  // 2. Sync changes to DOM whenever 'dark' changes
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("tb_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("tb_theme", "light");
    }
  }, [dark]);

  function toggle() {
    setDark((prev) => !prev);
  }

  return (
    <button
      onClick={toggle}
      className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
    >
      {dark ? "🌙 Dark" : "☀️ Light"}
    </button>
  );
}

function NavItem({ to, children, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        [
          "rounded-lg px-3 py-2 text-sm font-medium",
          isActive
            ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
            : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900",
        ].join(" ")
      }
    >
      {children}
    </NavLink>
  );
}

export function AppLayout() {
  const { isAuthed, user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/70">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              className="inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950 md:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Menu"
            >
              ☰
            </button>
            <Link to="/" className="text-base font-semibold tracking-tight">
              TB
            </Link>
          </div>

          <nav className="hidden items-center gap-1 md:flex">
            <NavItem to="/" end>
              Home
            </NavItem>
            <NavItem to="/about">About</NavItem>
            <NavItem to="/explore">Explore</NavItem>
            {isAuthed && (
              <>
                <NavItem to="/app">Dashboard</NavItem>
                <NavItem to="/app/trips">Trips</NavItem>
                <NavItem to="/app/buddies">Find Buddies</NavItem>
              </>
            )}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {isAuthed ? (
              <>
                <Link
                  to="/app/notifications"
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                >
                  Notifications
                </Link>
                <button
                  onClick={logout}
                  className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  Logout{user?.username ? ` (${user.username})` : ""}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 md:hidden">
            <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
              <NavItem to="/" end>
                Home
              </NavItem>
              <NavItem to="/about">About</NavItem>
              <NavItem to="/explore">Explore</NavItem>
              {isAuthed && (
                <>
                  <NavItem to="/app">Dashboard</NavItem>
                  <NavItem to="/app/trips">Trips</NavItem>
                  <NavItem to="/app/buddies">Find Buddies</NavItem>
                  <NavItem to="/app/profile">Profile</NavItem>
                  <NavItem to="/app/settings">Settings</NavItem>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-zinc-500 dark:text-zinc-400">
          © {new Date().getFullYear()} Travel Buddy — Smart companion for seamless trips.
        </div>
      </footer>
    </div>
  );
}

