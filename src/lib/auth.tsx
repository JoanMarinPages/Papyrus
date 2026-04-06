import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

interface User {
  id: string;
  email: string;
  name: string;
  company: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    company?: string;
  }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const stored = localStorage.getItem("papyrus_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("papyrus_user");
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, _password: string) => {
    // TODO: replace with Supabase auth
    const mockUser: User = {
      id: "00000000-0000-0000-0000-000000000001",
      email,
      name: email.split("@")[0],
      company: "Mi Empresa",
    };
    localStorage.setItem("papyrus_user", JSON.stringify(mockUser));
    localStorage.setItem("papyrus_token", "mock-jwt-token");
    setUser(mockUser);
  }, []);

  const loginWithGoogle = useCallback(async () => {
    // TODO: replace with Supabase Google OAuth
    const mockUser: User = {
      id: "00000000-0000-0000-0000-000000000001",
      email: "user@google.com",
      name: "Google User",
      company: "Mi Empresa",
    };
    localStorage.setItem("papyrus_user", JSON.stringify(mockUser));
    localStorage.setItem("papyrus_token", "mock-jwt-token");
    setUser(mockUser);
  }, []);

  const register = useCallback(
    async (data: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      company?: string;
    }) => {
      // TODO: replace with Supabase auth
      const mockUser: User = {
        id: "00000000-0000-0000-0000-000000000001",
        email: data.email,
        name: `${data.firstName} ${data.lastName}`,
        company: data.company || "",
      };
      localStorage.setItem("papyrus_user", JSON.stringify(mockUser));
      localStorage.setItem("papyrus_token", "mock-jwt-token");
      setUser(mockUser);
    },
    [],
  );

  const logout = useCallback(() => {
    localStorage.removeItem("papyrus_user");
    localStorage.removeItem("papyrus_token");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, loginWithGoogle, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
