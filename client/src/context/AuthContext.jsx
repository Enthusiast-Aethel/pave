import { createContext, useContext, useEffect, useState } from "react";
import api from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!localStorage.getItem("pave_token"));

  // On app start, check the saved token
  useEffect(() => {
    if (!localStorage.getItem("pave_token")) return;
    api
      .get("/auth/me")
      .then((r) => setUser(r.data))
      .catch(() => localStorage.removeItem("pave_token"))
      .finally(() => setLoading(false));
  }, []);

  const authenticate = ({ token, user }) => {
    localStorage.setItem("pave_token", token);
    setUser(user);
  };

  const login = async (email, password) =>
    authenticate((await api.post("/auth/login", { email, password })).data);

  const register = async (name, email, password) =>
    authenticate((await api.post("/auth/register", { name, email, password })).data);

  const logout = () => {
    localStorage.removeItem("pave_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);