import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import your components
import Welcome from './Components/Welcome';
import Login from './Components/Login';
import Signup from './Components/Signup';
import Home from './Components/Home';
import Event from './Components/Event'; 
import AdminHome from './Components/Adminhome';
import Menu from './Components/Menu'; 
import ResetPassword from './Components/ResetPassword';

function App() {
  return (
    <Router>
      {/* Global CSS for a clean, professional dark theme */}
      <style>
        {`
          body {
            margin: 0;
            padding: 0;
            background-color: #000;
            color: #fff;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            overflow-x: hidden;
          }
          * {
            box-sizing: border-box;
          }
          /* Smooth scrollbar for the image grid */
          ::-webkit-scrollbar {
            width: 8px;
          }
          ::-webkit-scrollbar-track {
            background: #111;
          }
          ::-webkit-scrollbar-thumb {
            background: #00008B;
            border-radius: 10px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: #0000CD;
          }
        `}
      </style>

      <Routes>
        {/* 1. Entry Point */}
        <Route path="/" element={<Welcome />} />

        {/* 2. User Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* 3. Main Dashboard */}
        <Route path="/home" element={<Home />} />

        {/* 4. Event Registration (Handles dynamic event IDs) */}
        <Route path="/event/:id" element={<Event />} />

        {/* 5. Full Menu: UPDATED to handle dynamic IDs */}
        {/* This allows navigation back to /event/:id after selection */}
        <Route path="/menu/:id" element={<Menu />} />
        <Route path="/menu" element={<Menu />} />

        {/* 6. Password reset page */}
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* 7. Admin Panel */}
        <Route path="/admin-home" element={<AdminHome />} />

        {/* 7. Security: Redirect any broken links back to Welcome */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;