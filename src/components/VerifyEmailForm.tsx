"use client";

import { useState } from "react";
import styles from "./VerifyEmailForm.module.css";
import { useLang } from "@/context/LangContext";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";

interface VerifyEmailFormProps {
  email: string;
  onSuccess: () => void;
  onBack: () => void;
}

export default function VerifyEmailForm({ email, onSuccess, onBack }: VerifyEmailFormProps) {
  const { t } = useLang();
  const { login } = useAuth();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return;
    setError("");
    setLoading(true);

    const res = await api.auth.verifyEmail({ email, code });
    setLoading(false);

    if (res.error) {
      setError(t.verify.error);
      return;
    }

    if (res.data) {
      login(res.data.accessToken, res.data.user as Parameters<typeof login>[1]);
      setSuccess(true);
      setTimeout(onSuccess, 1500);
    }
  };

  const handleResend = async () => {
    await api.auth.login({ email, password: "" }).catch(() => {});
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h2 className={styles.title}>{t.verify.title}</h2>
      <p className={styles.subtitle}>
        {t.verify.subtitle} <strong>{email}</strong>
      </p>

      {success ? (
        <div className={styles.successBox}>
          <p className={styles.successText}>✓ {t.verify.success}</p>
        </div>
      ) : (
        <>
          {error && <p className={styles.errorBox}>{error}</p>}

          <div className={styles.field}>
            <input
              type="text"
              className={styles.codeInput}
              placeholder={t.verify.codePlaceholder}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              maxLength={6}
              inputMode="numeric"
              autoComplete="one-time-code"
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading || code.length !== 6}>
            {loading ? "..." : t.verify.submit}
          </button>

          <button type="button" className={styles.resendBtn} onClick={handleResend}>
            {t.verify.resend}
          </button>
        </>
      )}

      <button type="button" className={styles.backBtn} onClick={onBack}>
        {t.forgot.backToLogin}
      </button>
    </form>
  );
}
