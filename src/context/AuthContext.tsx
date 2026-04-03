"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api } from "@/services/api";

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  role: string;
  lang: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  accessToken: null,
  isLoading: true,
  login: () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("nbk-access-token");
    if (savedToken) {
      api.auth.getMe(savedToken).then((res) => {
        if (res.data?.user) {
          setUser(res.data.user as User);
          setAccessToken(savedToken);
        } else {
          api.auth.refreshToken().then((refresh) => {
            if (refresh.data?.accessToken) {
              const newToken = refresh.data.accessToken;
              localStorage.setItem("nbk-access-token", newToken);
              setAccessToken(newToken);
              api.auth.getMe(newToken).then((meRes) => {
                if (meRes.data?.user) {
                  setUser(meRes.data.user as User);
                }
              });
            } else {
              localStorage.removeItem("nbk-access-token");
            }
          });
        }
        setIsLoading(false);
      });
    } else {
      api.auth.refreshToken().then((res) => {
        if (res.data?.accessToken) {
          const token = res.data.accessToken;
          localStorage.setItem("nbk-access-token", token);
          setAccessToken(token);
          api.auth.getMe(token).then((meRes) => {
            if (meRes.data?.user) {
              setUser(meRes.data.user as User);
            }
          });
        }
        setIsLoading(false);
      });
    }
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem("nbk-access-token", token);
    setAccessToken(token);
    setUser(userData);
  };

  const logout = async () => {
    if (accessToken) {
      await api.auth.logout(accessToken);
    }
    localStorage.removeItem("nbk-access-token");
    setAccessToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
