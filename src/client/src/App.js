import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import OTPPage from "./pages/OTPPage";
import RegisterPage from "./pages/RegisterPage"; // <- new: page that contains RegisterForm

export default function App() {
  return (
    <Router>
      <Routes>
        {/* canonical home/login */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<Navigate replace to="/" />} />

        {/* Register for new users (SMFA-17 enforced on backend + client-side validator) */}
        <Route path="/register" element={<RegisterPage />} />

        {/* OTP flow */}
        <Route path="/otp" element={<OTPPage />} />

        {/* catch-all -> redirect to login */}
        <Route path="*" element={<Navigate replace to="/" />} />
      </Routes>
    </Router>
  );
}
