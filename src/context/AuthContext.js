import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("userToken") || "");

  useEffect(() => {
    if (token) {
      // Ideally fetch user profile from backend
      setUser({ username: "User Placeholder" });
    }
  }, [token]);

  const login = (newToken) => {
    setToken(newToken);
    localStorage.setItem("userToken", newToken);
    // Optionally fetch user info here
  };

  const logout = () => {
    setToken("");
    localStorage.removeItem("userToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);