// app/(protected)/layout.js
"use client";
import React, { useEffect } from "react";
import { useAuth } from "../../src/context/AuthContext";
import { useRouter } from "next/navigation";

export default function ProtectedLayout({ children }) {
  const { loading, profile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!profile) {
        router.push("/login");
      }
    }
  }, [loading, profile]);

  if (loading || !profile) return <div>Loading...</div>;

  return <>{children}</>;
}
