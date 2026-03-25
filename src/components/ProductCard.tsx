import styles from "./ProductCard.module.css";

interface ProductCardProps {
  emoji: string;
  emojiBg: string;
  name: string;
  shop: string;
  price: string;
  location: string;
}

export default function ProductCard({
  emoji,
  emojiBg,
  name,
  shop,
  price,
  location,
}: ProductCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.image} style={{ background: emojiBg }}>
        {emoji}
      </div>
      <div className={styles.info}>
        <p className={styles.name}>{name}</p>
        <p className={styles.shop}>{shop}</p>
        <div className={styles.bottom}>
          <span className={styles.price}>{price}</span>
          <span className={styles.location}>📍 {location}</span>
        </div>
      </div>
    </div>
  );
}
