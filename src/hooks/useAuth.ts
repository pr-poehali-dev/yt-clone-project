import { useState, useEffect, useCallback } from "react";
import { api, User } from "@/lib/api";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMe().then(u => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await api.login(email, password);
    setUser(result.user);
    return result;
  }, []);

  const register = useCallback(async (email: string, password: string, username: string, displayName: string) => {
    const result = await api.register(email, password, username, displayName);
    setUser(result.user);
    return result;
  }, []);

  const logout = useCallback(async () => {
    await api.logout();
    setUser(null);
  }, []);

  const becomeAuthor = useCallback(async (channelName: string, description: string) => {
    await api.becomeAuthor(channelName, description);
    const updated = await api.getMe();
    setUser(updated);
  }, []);

  return { user, loading, login, register, logout, becomeAuthor };
}
