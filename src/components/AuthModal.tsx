"use client";

import { useState } from "react";
import styles from "./AuthModal.module.css";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import ForgotPasswordForm from "./ForgotPasswordForm";
import VerifyEmailForm from "./VerifyEmailForm";

type View = "login" | "register" | "forgot" | "verify";

interface AuthModalProps {
  onClose: () => void;
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const [view, setView] = useState<View>("login");
  const [verifyEmail, setVerifyEmail] = useState("");

  const goToVerify = (email: string) => {
    setVerifyEmail(email);
    setView("verify");
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>
          ✕
        </button>

        {view === "login" && (
          <LoginForm
            onSwitchRegister={() => setView("register")}
            onSwitchForgot={() => setView("forgot")}
            onNeedsVerify={goToVerify}
            onSuccess={onClose}
          />
        )}

        {view === "register" && (
          <RegisterForm
            onSwitchLogin={() => setView("login")}
            onNeedsVerify={goToVerify}
          />
        )}

        {view === "forgot" && (
          <ForgotPasswordForm onSwitchLogin={() => setView("login")} />
        )}

        {view === "verify" && (
          <VerifyEmailForm
            email={verifyEmail}
            onSuccess={onClose}
            onBack={() => setView("login")}
          />
        )}
      </div>
    </div>
  );
}
