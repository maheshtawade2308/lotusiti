import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // ------------------------------
  // Load user session on refresh
  // ------------------------------
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) setUser(data.session.user);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

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
  const signup = async ({ formdata}) => {
    const { email, password, name, mobile, address, gender } = formdata;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, mobile }, // metadata if needed
        emailRedirectTo: undefined
      },
    });

     if (error) throw error;

    const userId = data.user.id;

    // Insert full profile
    await supabase.from("profiles").insert({
      id: userId,
      name,
      mobile,
      address,
      gender,
      role: "user",
      created_at: new Date(),
    });

    return data;
  };

  // ------------------------------
  // LOGIN
  // ------------------------------
  const login = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  };

  // ------------------------------
  // LOGOUT
  // ------------------------------
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  // ------------------------------
  // AVATAR UPLOAD
  // ------------------------------
  const uploadAvatar = async (file) => {
    const fileName = `${user.id}-${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("avatars")
      .upload(fileName, file);

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(fileName);

    const publicUrl = urlData.publicUrl;

    await supabase
      .from("profiles")
      .update({ photo: publicUrl })
      .eq("id", user.id);

    setProfile((p) => ({ ...p, photo: publicUrl }));
    return publicUrl;
  };

  // ------------------------------
  // PROVIDER
  // ------------------------------
  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signup,
        login,
        logout,
        uploadAvatar,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);