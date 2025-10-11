import React, { useState } from 'react';
import { supabase } from '../db/supabaseClient';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
const [loading, setLoading] = useState(false);

const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);
//   const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  const statemail = 'admin@lotusiti.com';
  const statpassword = 'admin@123';
  

 console.log(email);
    console.log(password);
  if (email === statemail && password === statpassword) {
    console.log(statemail);
    console.log(statpassword);
   
    setMessage('यशस्वी लॉगिन!');
    setLoading(false);
    navigate('/farmeridcard');
  } else {
    setMessage('चुकीचा ईमेल किंवा पासवर्ड');
    setLoading(false);
  }
};


  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card shadow p-4" style={{ maxWidth: '400px', width: '100%' }}>
        <h3 className="text-center mb-4">Login / लॉगिन</h3>

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email / ईमेल</label>
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
            <label htmlFor="password" className="form-label">Password / पासवर्ड</label>
            <input
              type="password"
              className="form-control"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-100">Login / लॉगिन करा</button>

          {message && (
            <div className="alert alert-info mt-3 text-center" role="alert">
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
