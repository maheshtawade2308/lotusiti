import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient";

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
  // Balance Points Handlers
  // ------------------------------------------------
  const deductPoints = async (pointsToDeduct) => {
    if (!profile || profile.role === 'admin') return true;
    
    if (profile.balance_points < pointsToDeduct) {
      return false; // Not enough points
    }

    const newBalance = profile.balance_points - pointsToDeduct;
    const { error } = await supabase
      .from("profiles")
      .update({ balance_points: newBalance })
      .eq("id", profile.id);

    if (error) {
      console.error("Error deducting points:", error);
      return false;
    }

    setProfile({ ...profile, balance_points: newBalance });
    return true;
  };

  const updateBalancePoints = async (userId, pointsToAdd) => {
    // Only fetch current points and add, for admin use
    const { data: userProfile, error: fetchError } = await supabase
      .from("profiles")
      .select("balance_points")
      .eq("id", userId)
      .single();

    if (fetchError) {
      console.error("Error fetching user profile:", fetchError);
      return false;
    }

    const newBalance = (userProfile.balance_points || 0) + pointsToAdd;
    const { error } = await supabase
      .from("profiles")
      .update({ balance_points: newBalance })
      .eq("id", userId);

    if (error) {
      console.error("Error updating points:", error);
      return false;
    }
    return true;
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
