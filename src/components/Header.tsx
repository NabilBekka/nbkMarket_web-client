"use client";

import { useState } from "react";
import styles from "./Header.module.css";
import AuthModal from "./AuthModal";

const categories = [
  "Tout",
  "Mode",
  "Électronique",
  "Maison",
  "Beauté",
  "Alimentation",
  "Artisanat",
  "Sport",
];

export default function Header() {
  const [showAuth, setShowAuth] = useState(false);

  return (
    <>
      <header>
        <div className={styles.topBar}>
          <div className={styles.left}>
            <span className={styles.logo}>
              NBK<span className={styles.logoAccent}>Market</span>
            </span>
            <nav className={styles.nav}>
              <a href="#">Explorer</a>
              <a href="#">Catégories</a>
              <a href="#">Wilayas</a>
            </nav>
          </div>
          <div className={styles.right}>
            <input
              className={styles.search}
              type="text"
              placeholder="Rechercher un produit, une boutique..."
            />
            <button className={styles.loginBtn} onClick={() => setShowAuth(true)}>
              Connexion
            </button>
          </div>
        </div>

        <div className={styles.categories}>
          {categories.map((cat, i) => (
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
