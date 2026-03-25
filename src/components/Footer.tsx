"use client";

import styles from "./Footer.module.css";
import { useLang } from "@/context/LangContext";

export default function Footer() {
  const { t } = useLang();

  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        <div className={styles.brand}>
          <span className={styles.logo}>
            NBK<span className={styles.logoAccent}>Market</span>
          </span>
          <p className={styles.desc}>{t.footer.desc}</p>
        </div>

        <div className={styles.links}>
          <div className={styles.col}>
            <h4>{t.footer.explore}</h4>
            <a href="#">{t.footer.categoriesLink}</a>
            <a href="#">{t.footer.wilayasLink}</a>
            <a href="#">{t.footer.popularShops}</a>
            <a href="#">{t.footer.trends}</a>
          </div>
          <div className={styles.col}>
            <h4>{t.footer.forMerchants}</h4>
            <a href="#">{t.footer.createShop}</a>
            <a href="#">{t.footer.subscriptions}</a>
            <a href="#">{t.footer.sponsoring}</a>
            <a href="#">{t.footer.proSpace}</a>
          </div>
          <div className={styles.col}>
            <h4>{t.footer.about}</h4>
            <a href="#">{t.footer.whoWeAre}</a>
            <a href="#">{t.footer.contact}</a>
            <a href="#">{t.footer.terms}</a>
            <a href="#">{t.footer.privacy}</a>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <p>{t.footer.copyright}</p>
      </div>
    </footer>
  );
}
