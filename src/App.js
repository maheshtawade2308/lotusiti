import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import FormSection from './components/FormSection';
import CardPreview from './components/CardPreview';
import { ToastContainer, toast } from 'react-toastify';  // Import ToastContainer and toast
import 'react-toastify/dist/ReactToastify.css';  // Import the CSS
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import FarmerCardGenerator from './components/FarmerCardGenerator';


function App() {


  return (
     <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/farmeridcard" element={<FarmerCardGenerator />} />
        {/* <Route path="/signup" element={<SignupPage />} /> */}
        {/* <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        /> */}
      </Routes>
    </BrowserRouter>

  );
}

export default App;