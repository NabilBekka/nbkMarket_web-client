"use client";

import { useState } from "react";
import styles from "./Header.module.css";
import AuthModal from "./AuthModal";
import { useLang } from "@/context/LangContext";

export default function Header() {
  const [showAuth, setShowAuth] = useState(false);
  const { lang, setLang, t } = useLang();

  return (
    <>
      <header>
        <div className={styles.topBar}>
          <div className={styles.left}>
            <span className={styles.logo}>
              NBK<span className={styles.logoAccent}>Market</span>
            </span>
            <nav className={styles.nav}>
              <a href="#">{t.header.explore}</a>
              <a href="#">{t.header.categories}</a>
              <a href="#">{t.header.wilayas}</a>
            </nav>
          </div>
          <div className={styles.right}>
            <input
              className={styles.search}
              type="text"
              placeholder={t.header.searchPlaceholder}
            />
            <div className={styles.langSwitch}>
              <button
                className={`${styles.langBtn} ${lang === "en" ? styles.langActive : ""}`}
                onClick={() => setLang("en")}
              >
                EN
              </button>
              <button
                className={`${styles.langBtn} ${lang === "fr" ? styles.langActive : ""}`}
                onClick={() => setLang("fr")}
              >
                FR
              </button>
            </div>
            <button className={styles.loginBtn} onClick={() => setShowAuth(true)}>
              {t.header.login}
            </button>
          </div>
        </div>

        <div className={styles.categories}>
          {t.categories.map((cat, i) => (
            <button
              key={cat}
              className={`${styles.pill} ${i === 0 ? styles.pillActive : ""}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}
