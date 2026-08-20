"use client";

import { createContext, useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      const { data } = await apiFetch("/auth/me");
      setUser(data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetching the session on mount
    loadUser();
  }, [loadUser]);

  const login = useCallback(async (email, password) => {
    const { data } = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setUser(data);
    return data;
  }, []);

  const logout = useCallback(async () => {
    await apiFetch("/auth/logout", { method: "POST" });
    setUser(null);
  }, []);

  const hasPermission = useCallback(
    (...permissions) => {
      if (!user) return false;
      if (user.isSuperAdmin) return true;
      const userPermissions = user.role?.permissions || [];
      return permissions.every((permission) => userPermissions.includes(permission));
    },
    [user]
  );

  const hasAnyPermission = useCallback(
    (...permissions) => {
      if (!user) return false;
      if (user.isSuperAdmin) return true;
      const userPermissions = user.role?.permissions || [];
      return permissions.some((permission) => userPermissions.includes(permission));
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, hasPermission, hasAnyPermission, refetch: loadUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}
