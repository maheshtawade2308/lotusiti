import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/global.css';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './components/auth/LoginPage';
import FarmerCardGenerator from './components/FarmerID/FarmerCardGenerator';
import ProtectedRoute from './components/auth/ProtectedRoute';
import KamgarForm from './components/KamgarID/KamgarForm';
import Navbar from './components/layout/Navbar';
import Dashboard from './components/pages/Dashboard';
import RegisterUser from './components/admin/RegisterUser';
import UserList from './components/admin/UserList';
import Footer from './components/layout/Footer';
import AdjustMahaID from './components/MahaID/AdjustMahaID';
import Transactions from './components/admin/Transactions';
import { AuthProvider } from './components/auth/AuthContext';



function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LoginPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Navbar />
                <Dashboard />
              </ProtectedRoute>
            }
          />

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

          <Route
            path="/mahaId"
            element={
              <ProtectedRoute>
                <Navbar />
                <AdjustMahaID />
              </ProtectedRoute>
            }
          />

          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <Navbar />
                <Transactions />
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