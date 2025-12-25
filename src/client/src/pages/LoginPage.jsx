import React from "react";
import LoginForm from "../components/LoginForm/LoginForm";
import "../styles/Login.module.css";
import "../App.css";
import { useNavigate } from "react-router-dom";
import { requestOtp } from "../api/auth";

export default function LoginPage() {
  const navigate = useNavigate();

  // when LoginForm signals OTP required, request OTP and navigate to OTP page
  const handleOtpRequired = async (email) => {
    try {
      await requestOtp(email);
    } catch (err) {
      // ignore error here; OTP page allows resending
    }
    navigate('/otp', { state: { email } });
  };

  return (
    <div className="App">
      <div className="app-shell">
        <div className="brand-panel">
          <h1>Lock-Key Auth</h1>
          <p>Secure multi-factor authentication made simple. Enter your credentials to sign in. We'll email you a one-time code if OTP is required.</p>
          <p style={{ marginTop: 16, opacity: 0.85 }}>Fast · Secure · Tiny</p>
        </div>

        <div className="card-area">
          <LoginForm onOtpRequired={handleOtpRequired} />
        </div>
      </div>
    </div>
  );
}
