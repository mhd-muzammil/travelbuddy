import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { api } from "../lib/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("tb_token") || "");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function boot() {
      try {
        if (!token) {
          setUser(null);
          return;
        }
        const res = await api.get("/auth/me");
        if (res?.data?.success) setUser(res.data.data.user);
      } catch {
        localStorage.removeItem("tb_token");
        setToken("");
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    boot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function login(email, password) {
    const res = await api.post("/auth/login", { email, password });
    if (res?.data?.success) {
      localStorage.setItem("tb_token", res.data.data.token);
      setToken(res.data.data.token);
      setUser(res.data.data.user);
      toast.success("Welcome back!");
      return true;
    }
    return false;
  }

  async function register(payload) {
    const res = await api.post("/auth/register", payload);
    if (res?.data?.success) {
      localStorage.setItem("tb_token", res.data.data.token);
      setToken(res.data.data.token);
      setUser(res.data.data.user);
      toast.success("Account created!");
      return true;
    }
    return false;
  }

  function logout() {
    localStorage.removeItem("tb_token");
    setToken("");
    setUser(null);
    toast.success("Logged out");
  }

  const value = useMemo(
    () => ({ token, user, loading, isAuthed: !!token, setUser, login, register, logout }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

