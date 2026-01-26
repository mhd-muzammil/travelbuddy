import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";

export function ProtectedRoute({ children }) {
  const { isAuthed, loading } = useAuth();
  const loc = useLocation();

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div className="h-7 w-52 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="mt-4 h-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>
    );
  }

  if (!isAuthed) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  return children;
}

