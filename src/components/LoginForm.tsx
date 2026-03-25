"use client";

import { useState } from "react";
import styles from "./LoginForm.module.css";

interface LoginFormProps {
  onSwitchRegister: () => void;
  onSwitchForgot: () => void;
}

export default function LoginForm({ onSwitchRegister, onSwitchForgot }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState(false);

  const checks = {
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    length: password.length >= 8,
  };

  const allValid = Object.values(checks).every(Boolean);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!allValid) return;
    // TODO: API call
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h2 className={styles.title}>Se connecter</h2>
      <p className={styles.subtitle}>Accédez à votre compte NBK Market</p>

      <button type="button" className={styles.googleBtn}>
        <svg className={styles.googleIcon} viewBox="0 0 24 24" width="20" height="20">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Se connecter avec Google
      </button>

      <div className={styles.divider}>
        <span className={styles.dividerLine}></span>
        <span className={styles.dividerText}>ou</span>
        <span className={styles.dividerLine}></span>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Email</label>
        <input
          type="email"
          className={styles.input}
          placeholder="votre@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Mot de passe</label>
        <div className={styles.passwordWrap}>
          <input
            type={showPassword ? "text" : "password"}
            className={styles.input}
            placeholder="Votre mot de passe"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setTouched(true);
            }}
            required
          />
          <button
            type="button"
            className={styles.eyeBtn}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>

        {touched && password.length > 0 && (
          <div className={styles.checks}>
            <span className={checks.length ? styles.checkOk : styles.checkFail}>
              {checks.length ? "✓" : "✗"} 8 caractères minimum
            </span>
            <span className={checks.uppercase ? styles.checkOk : styles.checkFail}>
              {checks.uppercase ? "✓" : "✗"} Une majuscule
            </span>
            <span className={checks.lowercase ? styles.checkOk : styles.checkFail}>
              {checks.lowercase ? "✓" : "✗"} Une minuscule
            </span>
            <span className={checks.number ? styles.checkOk : styles.checkFail}>
              {checks.number ? "✓" : "✗"} Un chiffre
            </span>
            <span className={checks.special ? styles.checkOk : styles.checkFail}>
              {checks.special ? "✓" : "✗"} Un caractère spécial
            </span>
          </div>
        )}
      </div>

      <div className={styles.forgotRow}>
        <button type="button" className={styles.linkBtn} onClick={onSwitchForgot}>
          Mot de passe oublié ?
        </button>
      </div>

      <button type="submit" className={styles.submitBtn}>
        Se connecter
      </button>

      <p className={styles.bottomText}>
        Pas encore de compte ?{" "}
        <button type="button" className={styles.linkBtn} onClick={onSwitchRegister}>
          S&apos;inscrire
        </button>
      </p>
    </form>
  );
}
