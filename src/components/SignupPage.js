import React, { useState } from 'react';
import { supabase } from './supabaseClient';


function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setMessage(`त्रुटी: ${error.message}`);
    } else {
      setMessage('नोंदणी यशस्वी झाली! कृपया आपला ईमेल तपासा.');
    }
  };

  return (
    <div className="signup-container">
      <h2>Signup / नोंदणी</h2>
      <form onSubmit={handleSignup}>
        <label>Email / ईमेल</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label>Password / पासवर्ड</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

        <button type="submit">Signup / नोंदणी करा</button>
        {message && <p className="message">{message}</p>}
      </form>
    </div>
  );
}

export default SignupPage;