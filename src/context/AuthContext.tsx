import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { apiFetch } from "@/lib/api";

interface User {
  id?: number;
  name: string;
  email: string;
  role: "user" | "admin";
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  adminLogin: (email: string, password: string) => boolean;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("auth_token");
    const savedUser = localStorage.getItem("auth_user");
    if (savedToken) setToken(savedToken);
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser) as User);
      } catch {
        // ignore corrupt localStorage
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    const data = await apiFetch<{
      token: string;
      user: { id: number; username: string; email: string; role: "user" | "admin" };
    }>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });

    const tokenFromApi = data?.token;
    const apiUser = data?.user;

    if (!tokenFromApi || !apiUser?.email) throw new Error("Login failed: malformed server response");

    const nextUser: User = {
      id: apiUser.id,
      name: apiUser.username || apiUser.email.split("@")[0],
      email: apiUser.email,
      role: apiUser.role || "user",
    };

    setToken(tokenFromApi);
    setUser(nextUser);
    localStorage.setItem("auth_token", tokenFromApi);
    localStorage.setItem("auth_user", JSON.stringify(nextUser));
    return true;
  };

  const adminLogin = (_email: string, _password: string) => {
    // Deprecated: admin is now DB-backed via normal login() and user.role.
    return false;
  };

  const register = async (name: string, email: string, password: string) => {
    // Backend expects "username", so we map name -> username.
    const username = name.trim();
    await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    });

    // After successful registration, immediately log the user in.
    await login(email, password);
    return true;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
  };

  const value = useMemo<AuthContextType>(
    () => ({ user, token, login, adminLogin, register, logout }),
    [user, token]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
