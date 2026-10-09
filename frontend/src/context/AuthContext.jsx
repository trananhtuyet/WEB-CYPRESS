import { createContext, useEffect, useState } from "react";
import { loginUser, registerUser } from "../services/authService";
import { getUserById } from "../services/userService";

export const AuthContext = createContext();

const getStoredUser = () => {
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  useEffect(() => {
    if (!token || !user?.id) {
      return;
    }

    getUserById(user.id)
      .then((freshUser) => {
        setUser(freshUser);
      })
      .catch(() => {
        setUser(null);
        setToken(null);
      });
  }, [token, user?.id]);

  const login = async (payload) => {
    const data = await loginUser(payload);
    setUser(data.user);
    setToken(data.token);
    return data;
  };

  const register = async (payload) => {
    const data = await registerUser(payload);
    setUser(data.user);
    setToken(data.token);
    return data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  const updateCurrentUser = (nextUser) => {
    setUser(nextUser);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, updateCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
}
