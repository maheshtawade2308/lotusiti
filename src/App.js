import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';  // Import the CSS
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import FarmerCardGenerator from './components/FarmerCardGenerator';
import ProtectedRoute from './components/auth/ProtectedRoute';
import GenerateKamgarId from './components/KamgarID/GenerateKamgarId';
import KamgarForm from './components/KamgarID/KamgarForm';
import Navbar from './components/pages/Navbar';
import RegisterUser from './components/supabase/RegisterUser';
import UserList from './components/supabase/UserList';
import Footer from './components/pages/Footer';
import { AuthProvider } from './components/auth/AuthContext';



function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LoginPage />} />

          <Route
            path="/farmeridcard"
            element={
              <ProtectedRoute>
                <Navbar />
                <FarmerCardGenerator />
              </ProtectedRoute>
            }
          />

          <Route
            path="/kamgarId"
            element={
              <ProtectedRoute>
                <Navbar />
                <KamgarForm />
              </ProtectedRoute>
            }
          />

          <Route
            path="/register"
            element={
              <ProtectedRoute>
                <Navbar />
                <RegisterUser />
              </ProtectedRoute>
            }
          />

          <Route
            path="/user-list"
            element={
              <ProtectedRoute>
                <Navbar />
                <UserList />
              </ProtectedRoute>
            }
          />
        </Routes>
        <Footer />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;