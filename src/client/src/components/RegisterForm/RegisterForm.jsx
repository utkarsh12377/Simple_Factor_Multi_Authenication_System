// src/client/src/components/RegisterForm/RegisterForm.jsx
import React, { useState } from "react";
import axios from "axios";
// validator import — relative path from components/RegisterForm -> utils
import { validatePasswordClient } from "../../utils/passwordValidatorClient";
// reuse the same CSS module used by LoginForm for consistent look
import styles from "../../styles/Login.module.css";

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [clientErrors, setClientErrors] = useState([]);
  const [serverErrors, setServerErrors] = useState([]);
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // base API url — adjust env var if you use custom dev ports
  const API = process.env.REACT_APP_API_URL || "https://localhost:5000/api/auth";

  function onPasswordChange(e) {
    setPassword(e.target.value);
    const { errors } = validatePasswordClient(e.target.value);
    setClientErrors(errors);
    setServerErrors([]);
    setSuccessMsg("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerErrors([]);
    setSuccessMsg("");

    const { valid, errors } = validatePasswordClient(password);
    if (!valid) {
      setClientErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API}/create-user`, { email, password });
      // server should return { user_id, email } on 201
      if (res.status === 201) {
        setSuccessMsg("Account created. Please check your email for OTP (if enabled).");
        setEmail("");
        setPassword("");
        setClientErrors([]);
      } else {
        setServerErrors([res.data?.error || "Unexpected server response"]);
      }
    } catch (err) {
      const data = err.response?.data;
      if (data?.details && Array.isArray(data.details)) {
        setServerErrors(data.details);
      } else if (data?.error) {
        setServerErrors([data.error]);
      } else {
        setServerErrors(["Server error. Please try again later."]);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
      <form className={styles.loginCard} onSubmit={handleSubmit} style={{ width: 420 }}>
        <h2 className={styles.title}>Create new account</h2>
        <p className={styles.subtitle}>Register an account to use Lock-Key Auth.</p>

        <label htmlFor="reg-email" className={styles["sr-only"]}>Email</label>
        <div className={styles.inputGroup}>
          <input
            id="reg-email"
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            autoComplete="email"
          />
        </div>

        <label htmlFor="reg-password" className={styles["sr-only"]}>Password</label>
        <div className={styles.inputGroup}>
          <input
            id="reg-password"
            type="password"
            placeholder="Choose a strong password"
            value={password}
            onChange={onPasswordChange}
            required
            disabled={loading}
            autoComplete="new-password"
          />
        </div>

        {/* client-side live hints */}
        {clientErrors.length > 0 && (
          <div className={styles.error} role="status" style={{ textAlign: "left" }}>
            <strong>Fix these:</strong>
            <ul style={{ margin: "8px 0 0 18px" }}>
              {clientErrors.map((it, i) => <li key={i}>{it}</li>)}
            </ul>
          </div>
        )}

        {/* server-side errors */}
        {serverErrors.length > 0 && (
          <div className={styles.error} role="alert" style={{ textAlign: "left" }}>
            <strong>Server:</strong>
            <ul style={{ margin: "8px 0 0 18px" }}>
              {serverErrors.map((it, i) => <li key={i}>{it}</li>)}
            </ul>
          </div>
        )}

        {successMsg && (
          <div style={{ background: "#e6ffef", color: "#0b6b2f", padding: 10, borderRadius: 8, marginTop: 12 }}>
            {successMsg}
          </div>
        )}

        <button type="submit" className={styles.loginBtn} disabled={loading} aria-disabled={loading} style={{ marginTop: 14 }}>
          {loading ? "Creating…" : "Create account"}
        </button>

        <div className={styles.registerHint} style={{ marginTop: 12, textAlign: "center", color: "#ddd" }}>
          Already have an account? <a href="/login" className={styles.registerLink}>Sign in</a>
        </div>
      </form>
    </div>
  );
}
