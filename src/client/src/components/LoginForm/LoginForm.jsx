import React, { useState } from "react";
import { loginUser } from "../../api/auth";
import { Link } from "react-router-dom";   // ← Add this
import styles from "../../styles/Login.module.css";

export default function LoginForm({ onOtpRequired, onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await loginUser(email, password);
      const data = res.data;

      if (data.needOtp) {
        if (onOtpRequired) onOtpRequired(email);
      } else if (data.success) {
        onLoginSuccess(data.token);
      } else {
        setError("Unexpected response. Please try again.");
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Server error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginCard} style={{ width: 420 }}>
      <h2 className={styles.title}>Welcome back</h2>
      <p className={styles.subtitle}>
        Sign in to continue to your secure area.
      </p>

      <form className={styles.form} onSubmit={handleSubmit} aria-busy={loading}>
        <label htmlFor="email" className={styles["sr-only"]}>
          Email address
        </label>
        <div className={styles.inputGroup}>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email"
            required
            disabled={loading}
          />
        </div>

        <label htmlFor="password" className={styles["sr-only"]}>
          Password
        </label>
        <div className={styles.inputGroup}>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            disabled={loading}
          />
        </div>

        {error && (
          <div className={styles.error} role="alert">
            {error}
          </div>
        )}

        <button
          type="submit"
          className={styles.loginBtn}
          disabled={loading}
          aria-disabled={loading}
        >
          {loading && <span className="spinner" aria-hidden="true" />}
          <span>{loading ? "Logging in..." : "Login"}</span>
        </button>

        {/* ------------------------- */}
        {/*   NEW USER LINK ADDED    */}
        {/* ------------------------- */}
        <div className={styles.registerHint}>
          <p>
            Don’t have an account?{" "}
            <Link to="/register" className={styles.registerLink}>
              Create new user
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
