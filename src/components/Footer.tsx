import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        <div className={styles.brand}>
          <span className={styles.logo}>
            NBK<span className={styles.logoAccent}>Market</span>
          </span>
          <p className={styles.desc}>
            La marketplace sociale des commerçants algériens. Trouvez les
            meilleurs produits près de chez vous.
          </p>
        </div>

        <div className={styles.links}>
          <div className={styles.col}>
            <h4>Explorer</h4>
            <a href="#">Catégories</a>
            <a href="#">Wilayas</a>
            <a href="#">Boutiques populaires</a>
            <a href="#">Tendances</a>
          </div>
          <div className={styles.col}>
            <h4>Pour les commerçants</h4>
            <a href="#">Créer ma boutique</a>
            <a href="#">Abonnements</a>
            <a href="#">Sponsoring</a>
            <a href="#">Espace Pro</a>
          </div>
          <div className={styles.col}>
            <h4>À propos</h4>
            <a href="#">Qui sommes-nous</a>
            <a href="#">Contact</a>
            <a href="#">Conditions d&apos;utilisation</a>
            <a href="#">Confidentialité</a>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <p>© 2026 NBK Market. Tous droits réservés.</p>
      </div>
    </footer>
  );
}
