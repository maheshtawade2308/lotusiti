// app/(protected)/user/page.js
"use client";
import React, { useState } from "react";
import { useAuth } from "../../../src/context/AuthContext";

export default function UserPage() {
  const { profile, uploadAvatar, logout } = useAuth();
  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    if (!file) return alert("Choose file");
    try {
      await uploadAvatar(file);
      alert("Uploaded");
    } catch (err) {
      alert(err.message || "Upload failed");
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>User Dashboard</h1>
      <p>Hello, {profile?.username}</p>
      <img src={profile?.avatar_url || "/mnt/data/watermark.png"} alt="avatar" width={120} />
      <div className="mt-2">
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button className="btn btn-primary" onClick={handleUpload}>Upload Avatar</button>
      </div>
      <button className="btn btn-danger mt-3" onClick={logout}>Logout</button>
    </div>
  );
}
