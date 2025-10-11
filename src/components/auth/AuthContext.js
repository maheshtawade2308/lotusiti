import { createContext, useState, useContext, useEffect  } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") === "true" // restore session
  );

  // Set session duration (in ms)
  const SESSION_TIMEOUT = 10 * 60 * 1000; // ✅ 10 minutes

  let logoutTimer;

  const startSessionTimer = () => {
    clearTimeout(logoutTimer);
    logoutTimer = setTimeout(() => {
      logout();
      alert("Your session has expired. Please log in again!");
    }, SESSION_TIMEOUT);
  };

  const login = () => {
    setIsAuthenticated(true);
    localStorage.setItem("isLoggedIn", "true");
    setIsLoggedIn(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
    clearTimeout(logoutTimer);
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
  };

  // Reset session on page reload
  useEffect(() => {
    if (isAuthenticated) {
      startSessionTimer();
    }
    return () => clearTimeout(logoutTimer);
  }, [isAuthenticated]);

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
