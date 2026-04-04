"use client";

import { useState, useEffect } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import styles from "./LoginForm.module.css";
import { useLang } from "@/context/LangContext";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";

interface GoogleData {
  googleId: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface LoginFormProps {
  onSwitchRegister: () => void;
  onSwitchForgot: () => void;
  onNeedsVerify: (email: string) => void;
  onGoogleRegister: (data: GoogleData) => void;
  onSuccess: () => void;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginForm({ onSwitchRegister, onSwitchForgot, onNeedsVerify, onGoogleRegister, onSuccess }: LoginFormProps) {
  const { t } = useLang();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [touchedPw, setTouchedPw] = useState(false);
  const [touchedEmail, setTouchedEmail] = useState(false);
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("nbk-remember-email");
    if (saved) { setEmail(saved); setRememberMe(true); }
  }, []);

  const emailValid = emailRegex.test(email);

  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setServerError("");
      setLoading(true);
      const res = await api.auth.google({ credential: tokenResponse.access_token });
      setLoading(false);

      if (res.error) {
        setServerError(res.error);
        return;
      }

      if (res.data?.isExistingUser && res.data.accessToken && res.data.user) {
        login(res.data.accessToken, res.data.user as Parameters<typeof login>[1]);
        onSuccess();
      } else if (res.data?.googleData) {
        onGoogleRegister(res.data.googleData);
      }
    },
    onError: () => {
      setServerError("Google authentication failed");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouchedPw(true);
    setTouchedEmail(true);
    setServerError("");
    if (!emailValid) return;

    setLoading(true);
    const res = await api.auth.login({ email, password });
    setLoading(false);

    if (res.error) {
      if (res.data && (res.data as Record<string, unknown>).needsVerification) {
        onNeedsVerify(email);
        return;
      }
      setServerError(t.login.error);
      return;
    }

    if (res.data) {
      if (rememberMe) {
        localStorage.setItem("nbk-remember-email", email);
      } else {
        localStorage.removeItem("nbk-remember-email");
      }
      login(res.data.accessToken, res.data.user as Parameters<typeof login>[1]);
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h2 className={styles.title}>{t.login.title}</h2>
      <p className={styles.subtitle}>{t.login.subtitle}</p>

      <button type="button" className={styles.googleBtn} onClick={() => googleLogin()}>
        <svg className={styles.googleIcon} viewBox="0 0 24 24" width="20" height="20">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        {t.login.googleBtn}
      </button>

      <div className={styles.divider}>
        <span className={styles.dividerLine}></span>
        <span className={styles.dividerText}>{t.login.or}</span>
        <span className={styles.dividerLine}></span>
      </div>

      {serverError && <p className={styles.serverError}>{serverError}</p>}

      <div className={styles.field}>
        <label className={styles.label}>{t.login.email}</label>
        <input type="email" className={`${styles.input} ${touchedEmail && !emailValid && email.length > 0 ? styles.inputError : ""}`}
          placeholder={t.login.emailPlaceholder} value={email}
          onChange={(e) => setEmail(e.target.value)} onBlur={() => setTouchedEmail(true)} required />
        {touchedEmail && !emailValid && email.length > 0 && <p className={styles.errorText}>{t.login.emailError}</p>}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>{t.login.password}</label>
        <div className={styles.passwordWrap}>
          <input type={showPassword ? "text" : "password"} className={styles.input}
            placeholder={t.login.passwordPlaceholder} value={password}
            onChange={(e) => { setPassword(e.target.value); setTouchedPw(true); }} required />
          <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>
        {touchedPw && password.length > 0 && (
          <div className={styles.checks}>
            {Object.entries(checks).map(([key, valid]) => (
              <span key={key} className={valid ? styles.checkOk : styles.checkFail}>
                {valid ? "✓" : "✗"} {t.login.checks[key as keyof typeof t.login.checks]}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className={styles.optionsRow}>
        <label className={styles.rememberLabel}>
          <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className={styles.checkbox} />
          {t.login.rememberMe}
        </label>
        <button type="button" className={styles.linkBtn} onClick={onSwitchForgot}>{t.login.forgotPassword}</button>
      </div>

      <button type="submit" className={styles.submitBtn} disabled={loading}>
        {loading ? "..." : t.login.submit}
      </button>

      <p className={styles.bottomText}>
        {t.login.noAccount}{" "}
        <button type="button" className={styles.linkBtn} onClick={onSwitchRegister}>{t.login.register}</button>
      </p>
    </form>
  );
}
