import { createContext, useEffect, useMemo, useState } from "react";

export const AuthContext = createContext(null);

const ADMIN_EMAIL = "admin@nitttrc.com";
const ADMIN_PASSWORD = "1234";
const STORAGE_KEY = "nitttrc_auth_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const login = (email, password) => {
    const ok = email === ADMIN_EMAIL && password === ADMIN_PASSWORD;

    if (!ok) {
      setUser(null);
      localStorage.removeItem(STORAGE_KEY);
      return { ok: false, message: "Invalid email or password" };
    }

    const userData = { email, role: "admin" };
    setUser(userData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    return { ok: true, message: "Login success" };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const isAdmin = user?.role === "admin" && user?.email === ADMIN_EMAIL;

  const value = useMemo(() => ({ user, isAdmin, login, logout }), [user, isAdmin]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}