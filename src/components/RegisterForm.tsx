"use client";

import { useState } from "react";
import styles from "./RegisterForm.module.css";
import { useLang } from "@/context/LangContext";
import { api } from "@/services/api";

interface RegisterFormProps {
  onSwitchLogin: () => void;
  onNeedsVerify: (email: string) => void;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'\-]+$/;

export default function RegisterForm({ onSwitchLogin, onNeedsVerify }: RegisterFormProps) {
  const { lang, t } = useLang();
  const [form, setForm] = useState({
    email: "", firstName: "", lastName: "", username: "", birthDate: "", password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [touchedPw, setTouchedPw] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));
  const touch = (field: string) => setTouchedFields((p) => ({ ...p, [field]: true }));

  const fnValid = nameRegex.test(form.firstName);
  const lnValid = nameRegex.test(form.lastName);
  const emailValid = emailRegex.test(form.email);
  const checks = {
    length: form.password.length >= 8,
    uppercase: /[A-Z]/.test(form.password),
    lowercase: /[a-z]/.test(form.password),
    number: /[0-9]/.test(form.password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(form.password),
  };
  const allChecks = Object.values(checks).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouchedPw(true);
    setTouchedFields({ firstName: true, lastName: true, email: true, username: true, birthDate: true });
    setServerError("");
    if (!fnValid || !lnValid || !emailValid || !allChecks || form.username.length < 3) return;

    setLoading(true);
    const res = await api.auth.register({
      email: form.email,
      password: form.password,
      first_name: form.firstName,
      last_name: form.lastName,
      username: form.username,
      birth_date: form.birthDate || undefined,
      lang,
    });
    setLoading(false);

    if (res.error) {
      if (res.error.includes("Email")) setServerError(t.register.emailTaken);
      else if (res.error.includes("Username") || res.error.includes("username")) setServerError(t.register.usernameError);
      else setServerError(res.error);
      return;
    }

    onNeedsVerify(form.email);
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h2 className={styles.title}>{t.register.title}</h2>
      <p className={styles.subtitle}>{t.register.subtitle}</p>

      <button type="button" className={styles.googleBtn}>
        <svg className={styles.googleIcon} viewBox="0 0 24 24" width="20" height="20">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        {t.register.googleBtn}
      </button>

      <div className={styles.divider}>
        <span className={styles.dividerLine}></span>
        <span className={styles.dividerText}>{t.register.or}</span>
        <span className={styles.dividerLine}></span>
      </div>

      {serverError && <p className={styles.serverError}>{serverError}</p>}

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>{t.register.firstName}</label>
          <input type="text" className={`${styles.input} ${touchedFields.firstName && form.firstName.length > 0 && !fnValid ? styles.inputError : ""}`}
            placeholder={t.register.firstNamePlaceholder} value={form.firstName}
            onChange={(e) => update("firstName", e.target.value)} onBlur={() => touch("firstName")} required autoComplete="given-name" />
          {touchedFields.firstName && form.firstName.length > 0 && !fnValid && <p className={styles.errorText}>{t.register.nameError}</p>}
        </div>
        <div className={styles.field}>
          <label className={styles.label}>{t.register.lastName}</label>
          <input type="text" className={`${styles.input} ${touchedFields.lastName && form.lastName.length > 0 && !lnValid ? styles.inputError : ""}`}
            placeholder={t.register.lastNamePlaceholder} value={form.lastName}
            onChange={(e) => update("lastName", e.target.value)} onBlur={() => touch("lastName")} required autoComplete="family-name" />
          {touchedFields.lastName && form.lastName.length > 0 && !lnValid && <p className={styles.errorText}>{t.register.nameError}</p>}
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>{t.register.username}</label>
        <input type="text" className={styles.input} placeholder={t.register.usernamePlaceholder} value={form.username}
          onChange={(e) => update("username", e.target.value.replace(/\s/g, "").toLowerCase())} required minLength={3} maxLength={20} autoComplete="username" />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>{t.register.email}</label>
        <input type="email" className={`${styles.input} ${touchedFields.email && form.email.length > 0 && !emailValid ? styles.inputError : ""}`}
          placeholder={t.register.emailPlaceholder} value={form.email}
          onChange={(e) => update("email", e.target.value)} onBlur={() => touch("email")} required autoComplete="email" />
        {touchedFields.email && form.email.length > 0 && !emailValid && <p className={styles.errorText}>{t.register.emailError}</p>}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>{t.register.birthDate}</label>
        <input type="date" className={styles.input} value={form.birthDate}
          onChange={(e) => update("birthDate", e.target.value)} required max={new Date().toISOString().split("T")[0]} />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>{t.register.password}</label>
        <div className={styles.passwordWrap}>
          <input type={showPassword ? "text" : "password"} className={styles.input}
            placeholder={t.register.passwordPlaceholder} value={form.password}
            onChange={(e) => { update("password", e.target.value); setTouchedPw(true); }} required autoComplete="new-password" />
          <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>
        {touchedPw && form.password.length > 0 && (
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
        {loading ? "..." : t.register.submit}
      </button>

      <p className={styles.bottomText}>
        {t.register.hasAccount}{" "}
        <button type="button" className={styles.linkBtn} onClick={onSwitchLogin}>{t.register.login}</button>
      </p>
    </form>
  );
}
