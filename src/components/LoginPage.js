import React, { useState } from 'react';
import { supabase } from './supabase/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../components/auth/AuthContext";
import { toast, ToastContainer } from 'react-toastify';
import '../components/css/LoginPage.css';


function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    console.log(data);
    // const { data, error } = await supabase
    // .from("Users")
    // .select("*", { count: "exact", head: false })  
    // .eq("email", email)
    // .eq("password", password)
    // .maybeSingle();
    
      if (error) {
        console.error("Supabase error:", error);
        toast.error("This email is not regestered with us!!! Please contact Admin");
        return;
      }

      if (!data) {
        toast.error("चुकीचा ईमेल किंवा पासवर्ड");
        return;
      }else{
        toast.success('यशस्वी लॉगिन!');
        login();

        const { data } = await supabase.auth.getUser();
        const user = data.user;

        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        navigate('/farmeridcard');
      }
  };


  return (
    <div className="login-bg d-flex justify-content-center align-items-center vh-100">
      <div className="login-card shadow-lg p-4">
        <h2 className="text-center mb-4 text-white">🌾 Farmer Portal Login</h2>

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label text-white">Email / ईमेल</label>
            <input
              type="email"
              className="form-control"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label text-white">Password / पासवर्ड</label>
            <input
              type="password"
              className="form-control"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-success w-100">
           Login / लॉगिन करा
          </button>
          <ToastContainer position="top-center" autoClose={3000} />

        </form>
      </div>
    </div>

  );
}



export default LoginPage;
