"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./GoogleRegisterForm.module.css";
import { useLang } from "@/context/LangContext";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";

interface GoogleData {
  googleId: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface GoogleRegisterFormProps {
  googleData: GoogleData;
  onSuccess: () => void;
  onBack: () => void;
}

export default function GoogleRegisterForm({ googleData, onSuccess, onBack }: GoogleRegisterFormProps) {
  const { t } = useLang();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [touchedPw, setTouchedPw] = useState(false);
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const usernameTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (username.length < 3) { setUsernameAvailable(null); return; }
    setCheckingUsername(true);
    if (usernameTimer.current) clearTimeout(usernameTimer.current);
    usernameTimer.current = setTimeout(async () => {
      const res = await api.auth.checkUsername(username);
      if (res.data) setUsernameAvailable(res.data.available);
      setCheckingUsername(false);
    }, 500);
  }, [username]);

  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };
  const allChecks = Object.values(checks).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouchedPw(true);
    setServerError("");
    if (username.length < 3 || usernameAvailable === false || !allChecks) return;

    setLoading(true);
    const res = await api.auth.googleRegister({
      googleId: googleData.googleId,
      email: googleData.email,
      firstName: googleData.firstName,
      lastName: googleData.lastName,
      username,
      password,
      birthDate: birthDate || undefined,
    });
    setLoading(false);

    if (res.error) {
      if (res.error.includes("sername")) setServerError(t.googleRegister.usernameError);
      else setServerError(res.error);
      return;
    }

    if (res.data) {
      login(res.data.accessToken, res.data.user as Parameters<typeof login>[1]);
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h2 className={styles.title}>{t.googleRegister.title}</h2>
      <p className={styles.subtitle}>{t.googleRegister.subtitle}</p>

      <div className={styles.googleInfo}>
        <div className={styles.googleAvatar}>
          {googleData.firstName[0]}{googleData.lastName[0]}
        </div>
        <div>
          <p className={styles.googleName}>{googleData.firstName} {googleData.lastName}</p>
          <p className={styles.googleEmail}>{googleData.email}</p>
        </div>
      </div>

      {serverError && <p className={styles.serverError}>{serverError}</p>}

      <div className={styles.field}>
        <label className={styles.label}>{t.googleRegister.username}</label>
        <input type="text"
          className={`${styles.input} ${username.length >= 3 && usernameAvailable === false ? styles.inputError : ""} ${username.length >= 3 && usernameAvailable === true ? styles.inputOk : ""}`}
          placeholder={t.googleRegister.usernamePlaceholder} value={username}
          onChange={(e) => setUsername(e.target.value.replace(/\s/g, "").toLowerCase())}
          required minLength={3} maxLength={20} autoComplete="username" />
        {checkingUsername && <p className={styles.checkingText}>...</p>}
        {!checkingUsername && username.length >= 3 && usernameAvailable === false && <p className={styles.errorText}>{t.googleRegister.usernameError}</p>}
        {!checkingUsername && username.length >= 3 && usernameAvailable === true && <p className={styles.okText}>✓ Available</p>}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>{t.googleRegister.birthDate}</label>
        <input type="date" className={styles.input} value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)} required max={new Date().toISOString().split("T")[0]} />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>{t.googleRegister.password}</label>
        <div className={styles.passwordWrap}>
          <input type={showPassword ? "text" : "password"} className={styles.input}
            placeholder={t.googleRegister.passwordPlaceholder} value={password}
            onChange={(e) => { setPassword(e.target.value); setTouchedPw(true); }} required autoComplete="new-password" />
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

      <button type="submit" className={styles.submitBtn} disabled={loading}>
        {loading ? "..." : t.googleRegister.submit}
      </button>

      <button type="button" className={styles.backBtn} onClick={onBack}>
        {t.forgot.backToLogin}
      </button>
    </form>
  );
}
