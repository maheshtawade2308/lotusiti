import { createContext, useState, useContext, useEffect, useRef } from "react";
import { supabase } from "../supabase/supabaseClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") === "true"
  );

  const logoutTimer = useRef(null);  // Use useRef so the timer persists across renders

  const SESSION_TIMEOUT = 20* 60 * 1000; //  20 minutes

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

   // ------------------------------
  // Load profile for the user
  // ------------------------------
  async function fetchProfile(userId) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (!error && data) setProfile(data);
  }

  useEffect(() => {
    if (user) fetchProfile(user.id);
  }, [user]);


  // ------------------------------------------------
    // Register User
    // ------------------------------------------------
    const signup = async (formdata) => {
      const { email, password, name, mobile, city, gender } = formdata;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined
        },
      });
  
       if (error) throw error;
  
      const userId = data.user.id;
  
      // Insert full profile
      await supabase.from("profiles").insert({
        id: userId,
        name,
        email,
        mobile,
        city,
        gender,
        role: "user",
        created_at: new Date(),
        
      });
  
      return data;
    };

  // ------------------------------
  // Load all users
  // --------------------
  
     async function fetchUsers() {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false });
    
      }
  // ------------------------------
  // LOGIN
  // ------------------------------
  const login = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
     if (error) throw error;
    localStorage.setItem("isLoggedIn", "true");
    setIsLoggedIn(true);
    resetTimer(); // Start session timer on login
    setUser(data.user);
    return data;
    
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
    <AuthContext.Provider value={{user, profile, isLoggedIn,signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
