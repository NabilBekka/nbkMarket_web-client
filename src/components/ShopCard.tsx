import styles from "./ShopCard.module.css";

interface ShopCardProps {
  initials: string;
  color: string;
  textColor: string;
  name: string;
  category: string;
  products: number;
  rating: number;
}

export default function ShopCard({
  initials,
  color,
  textColor,
  name,
  category,
  products,
  rating,
}: ShopCardProps) {
  return (
    <div className={styles.card}>
      <div
        className={styles.avatar}
        style={{ background: color, color: textColor }}
      >
        {initials}
      </div>
      <div>
        <p className={styles.name}>{name}</p>
        <p className={styles.meta}>
          {category} · {products} produits
        </p>
        <p className={styles.stars}>
          {"★".repeat(rating)}
          {"☆".repeat(5 - rating)}
        </p>
      </div>
    </div>
  );
}
