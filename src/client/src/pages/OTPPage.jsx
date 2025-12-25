import React, { useState } from "react";
import { requestOtp, verifyOtp } from "../api/auth";
import styles from "../styles/Login.module.css";
import { useLocation } from "react-router-dom";

export default function OTPPage() {
  const location = useLocation();
  const initialEmail = location?.state?.email || "";
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRequest = async () => {
    setLoading(true);
    try {
      const res = await requestOtp(email);
      setMsg(res.data.message || "OTP sent if email exists");
    } catch (err) {
      setMsg(err.response?.data?.error || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    try {
      const res = await verifyOtp(email, otp);
      setMsg(res.data.message || "OTP verified");
    } catch (err) {
      setMsg(err.response?.data?.error || "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40 }}>
      <div className={styles.loginCard} style={{ width: 420 }}>
        <h2 className={styles.title}>OTP Verification</h2>
        <p className={styles.subtitle}>Enter your email and the 6-digit code we sent you.</p>

        <div className={styles.form}>
          <label htmlFor="otp-email" className={styles['sr-only']}>Email</label>
          <div className={styles.inputGroup}>
            <input id="otp-email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" disabled={loading} />
          </div>

          <label htmlFor="otp-code" className={styles['sr-only']}>OTP code</label>
          <div className={styles.inputGroup}>
            <input id="otp-code" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6-digit OTP" maxLength={6} disabled={loading}
              onKeyDown={(e) => { if (e.key === 'Enter') handleVerify(); }}
            />
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button className={styles.loginBtn} onClick={handleVerify} disabled={loading} aria-disabled={loading}>
              {loading && <span className="spinner" aria-hidden="true" />}
              <span>{loading ? 'Verifying...' : 'Verify OTP'}</span>
            </button>
            <button className={`${styles.loginBtn} btn-secondary`} onClick={handleRequest} disabled={loading} aria-disabled={loading}>
              {loading ? 'Sending...' : 'Resend OTP'}
            </button>
          </div>

          {msg && <div style={{ marginTop: 12 }} role="status" aria-live="polite">{msg}</div>}
        </div>
      </div>
    </div>
  );
}
