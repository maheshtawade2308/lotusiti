import { createContext, useState, useContext, useEffect, useRef } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") === "true"
  );

  const logoutTimer = useRef(null);  // Use useRef so the timer persists across renders

  const SESSION_TIMEOUT = 20* 60 * 1000; //  10 minutes

  // Start or reset the session timer based on user activity
  const resetTimer = () => {
    if (logoutTimer.current) {
      clearTimeout(logoutTimer.current);
    }

    logoutTimer.current = setTimeout(() => {
      logout();
      alert("Your session expired due to inactivity.");
    }, SESSION_TIMEOUT);
  };

  const login = () => {
    localStorage.setItem("isLoggedIn", "true");
    setIsLoggedIn(true);
    resetTimer(); // Start session timer on login
  };

  const logout = () => {
    clearTimeout(logoutTimer.current);
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
  };

  // Detect user activity and reset timer
  useEffect(() => {
    if (isLoggedIn) {
      window.addEventListener("mousemove", resetTimer);
      window.addEventListener("keydown", resetTimer);
      window.addEventListener("click", resetTimer);
      window.addEventListener("scroll", resetTimer);

      resetTimer(); // Initial start on login
    }

    return () => {
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("click", resetTimer);
      window.removeEventListener("scroll", resetTimer);
      clearTimeout(logoutTimer.current);
    };
  }, [isLoggedIn]);

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
