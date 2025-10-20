import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';  // Import the CSS
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import FarmerCardGenerator from './components/FarmerCardGenerator';
import ProtectedRoute from './components/auth/ProtectedRoute';
import GenerateKamgarId from './components/KamgarID/GenerateKamgarId';
import KamgarForm from './components/KamgarID/KamgarForm';


function App() {


  return (
     <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        {/* <Route path="/signup" element={<SignupPage />} /> */}
        <Route
          path="/farmeridcard"
          element={
            <ProtectedRoute>
              <FarmerCardGenerator />
            </ProtectedRoute>
          }
        />
         <Route path='/kamgarId' element={<KamgarForm/>}></Route>
      </Routes>
    </BrowserRouter>

  );
}

export default App;