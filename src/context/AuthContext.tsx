import { createContext, useContext, useState, ReactNode } from "react";

interface User {
  name: string;
  email: string;
  role: "user" | "admin";
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  adminLogin: (email: string, password: string) => boolean;
  register: (name: string, email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, _password: string) => {
    setUser({ name: email.split("@")[0], email, role: "user" });
    return true;
  };

  const adminLogin = (email: string, password: string) => {
    if (email === "admin@event.com" && password === "admin123") {
      setUser({ name: "Admin", email, role: "admin" });
      return true;
    }
    return false;
  };

  const register = (name: string, email: string) => {
    setUser({ name, email, role: "user" });
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, adminLogin, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
