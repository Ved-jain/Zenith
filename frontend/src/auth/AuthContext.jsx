import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import apiClient from "../api/client";

const AuthContext = createContext(null);

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || fallback;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshSession = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get("/auth/me");
      setUser(response.data.user);
      setError(null);
    } catch (requestError) {
      setUser(null);
      if (requestError?.response?.status !== 401) {
        setError(getErrorMessage(requestError, "Unable to refresh session."));
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const register = useCallback(async ({ name, email, password }) => {
    setError(null);
    try {
      const response = await apiClient.post("/auth/register", {
        name,
        email,
        password,
      });
      setUser(response.data.user);
      return response.data.user;
    } catch (requestError) {
      const message = getErrorMessage(requestError, "Registration failed.");
      setError(message);
      throw new Error(message);
    }
  }, []);

  const login = useCallback(async ({ email, password }) => {
    setError(null);
    try {
      const response = await apiClient.post("/auth/login", {
        email,
        password,
      });
      setUser(response.data.user);
      return response.data.user;
    } catch (requestError) {
      const message = getErrorMessage(requestError, "Login failed.");
      setError(message);
      throw new Error(message);
    }
  }, []);

  const logout = useCallback(async () => {
    setError(null);
    try {
      await apiClient.post("/auth/logout");
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      error,
      register,
      login,
      logout,
      refreshSession,
    }),
    [error, isLoading, login, logout, refreshSession, register, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
}
