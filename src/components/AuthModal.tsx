"use client";

import { useState } from "react";
import styles from "./AuthModal.module.css";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import ForgotPasswordForm from "./ForgotPasswordForm";

type View = "login" | "register" | "forgot";

interface AuthModalProps {
  onClose: () => void;
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const [view, setView] = useState<View>("login");

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
          />
        )}

        {view === "register" && (
          <RegisterForm onSwitchLogin={() => setView("login")} />
        )}

        {view === "forgot" && (
          <ForgotPasswordForm onSwitchLogin={() => setView("login")} />
        )}
      </div>
    </div>
  );
}
