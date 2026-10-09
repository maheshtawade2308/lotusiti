import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen to auth changes
  useEffect(() => {
    // Initial session
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    // Auth Listener
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // ------------------------------------------------
  // 20 Minutes Inactivity Session Timeout
  // Uses localStorage timestamp to ensure accuracy across tabs,
  // tab switching, computer sleep, and background states.
  // ------------------------------------------------
  useEffect(() => {
    if (!user) return;

    const INACTIVITY_LIMIT_MS = 20 * 60 * 1000; // 20 minutes
    const STORAGE_KEY = "lotusiti_last_activity";

    // Mark activity now
    const recordActivity = () => {
      localStorage.setItem(STORAGE_KEY, Date.now().toString());
    };

    recordActivity();

    // Check if session has timed out
    const checkInactivity = async () => {
      const lastActivity = parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10);
      const elapsed = Date.now() - lastActivity;

      if (elapsed >= INACTIVITY_LIMIT_MS) {
        clearInterval(intervalId);
        removeActivityListeners();
        localStorage.removeItem(STORAGE_KEY);

        alert("तुमचे सत्र (Session) २० मिनिटांच्या निष्क्रियतेमुळे संपले आहे. कृपया पुन्हा लॉगिन करा.");
        await logout();
        window.location.href = "/";
      }
    };

    // Throttle activity recorder so mousemove doesn't spam localStorage
    let lastRecorded = 0;
    const handleUserActivity = () => {
      const now = Date.now();
      if (now - lastRecorded > 3000) { // update at most every 3 seconds
        lastRecorded = now;
        recordActivity();
      }
    };

    // Activity events
    const activityEvents = ["mousemove", "mousedown", "keydown", "touchstart", "scroll", "click"];
    const addActivityListeners = () => {
      activityEvents.forEach((event) => {
        window.addEventListener(event, handleUserActivity, { passive: true });
      });
      // Also listen to visibility change (when tab becomes active again after being idle)
      document.addEventListener("visibilitychange", handleVisibilityChange);
    };

    const removeActivityListeners = () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkInactivity();
      }
    };

    addActivityListeners();

    // Periodic check every 10 seconds
    const intervalId = setInterval(checkInactivity, 10000);

    return () => {
      clearInterval(intervalId);
      removeActivityListeners();
    };
  }, [user]);
  
  // Load profile
  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }

    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()
      .then(({ data }) => setProfile(data));
  }, [user]);

   // LOGIN
  const login = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Check if user is blocked (Soft delete)
    if (data?.user) {
      const { data: userProf } = await supabase
        .from("profiles")
        .select("is_blocked")
        .eq("id", data.user.id)
        .single();

      if (userProf?.is_blocked) {
        await supabase.auth.signOut();
        throw new Error("ACCOUNT_BLOCKED: तुमचे खाते ब्लॉक केले आहे. कृपया प्रशासकाशी संपर्क साधा.");
      }
    }

    return data;
  };

  const logout = async() => {
    await supabase.auth.signOut();
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
  const adminSession = (await supabase.auth.getSession()).data.session;

  const { email, password, name, mobile, address, gender, balance_points, center_name } = formdata;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: undefined,
    },
  });

  if (error) throw error;

  const userId = data.user.id;

  await supabase.from("profiles").insert({
    id: userId,
    name,
    email,
    mobile,
    address,
    gender,
    role: "user",
    balance_points: parseInt(balance_points) || 0,
    center_name: center_name || "Lotus Computer Institute",
    created_at: new Date(),
  });

  // 🔥 Restore admin session
  if (adminSession) {
    await supabase.auth.setSession(adminSession);
  }

  return data;
};



  // ------------------------------------------------
  // Balance Points Handlers (ACID Compliant via Postgres RPC)
  // ------------------------------------------------
  const deductPoints = async (pointsToDeduct, description = '') => {
    if (!profile || profile.role === 'admin') return true;

    if (profile.balance_points < pointsToDeduct) {
      return false; // Not enough points
    }

    try {
      // Execute atomic transaction in PostgreSQL (Atomicity + Consistency + Row Lock)
      const { data, error } = await supabase.rpc('deduct_user_points', {
        p_user_id: profile.id,
        p_points: pointsToDeduct,
        p_description: description || 'Points deducted',
      });

      if (error) {
        console.error("RPC deduct_user_points error:", error);
        return false;
      }

      if (!data?.success) {
        console.warn("Deduction failed:", data?.error);
        return false;
      }

      setProfile((prev) => ({ ...prev, balance_points: data.new_balance }));
      return true;
    } catch (err) {
      console.error("Error in deductPoints:", err);
      return false;
    }
  };

  const updateBalancePoints = async (userId, pointsToAdd, description = '') => {
    try {
      // Execute atomic adjustment in PostgreSQL
      const { data, error } = await supabase.rpc('adjust_user_balance', {
        p_user_id: userId,
        p_points_diff: pointsToAdd,
        p_description: description || undefined,
      });

      if (error) {
        console.error("RPC adjust_user_balance error:", error);
        return false;
      }

      return data?.success ?? false;
    } catch (err) {
      console.error("Error updating points:", err);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, login, logout, signup, deductPoints, updateBalancePoints, setProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
