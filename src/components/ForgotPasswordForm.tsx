"use client";

import { useState } from "react";
import styles from "./ForgotPasswordForm.module.css";

interface ForgotPasswordFormProps {
  onSwitchLogin: () => void;
}

export default function ForgotPasswordForm({ onSwitchLogin }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    // TODO: API call
    setSent(true);
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h2 className={styles.title}>Mot de passe oublié</h2>
      <p className={styles.subtitle}>
        Entrez votre adresse email et nous vous enverrons un lien pour
        réinitialiser votre mot de passe.
      </p>

      {sent ? (
        <div className={styles.successBox}>
          <p className={styles.successText}>
            ✓ Un email de réinitialisation a été envoyé à <strong>{email}</strong>.
            Vérifiez votre boîte de réception.
          </p>
        </div>
      ) : (
        <>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              className={styles.input}
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <button type="submit" className={styles.submitBtn}>
            Envoyer le lien
          </button>
        </>
      )}

      <p className={styles.bottomText}>
        <button type="button" className={styles.linkBtn} onClick={onSwitchLogin}>
          ← Retour à la connexion
        </button>
      </p>
    </form>
  );
}
