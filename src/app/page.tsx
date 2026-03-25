import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import ShopCard from "@/components/ShopCard";
import Footer from "@/components/Footer";
import styles from "./page.module.css";

const products = [
  { emoji: "👕", emojiBg: "#E3F2FD", name: "T-shirt Premium Coton", shop: "Boutique El Yasmine", price: "2 500 DA", location: "Bab El Oued" },
  { emoji: "👟", emojiBg: "#FFF3E0", name: "Baskets Sport 2025", shop: "StreetWear DZ", price: "8 900 DA", location: "Hussein Dey" },
  { emoji: "📱", emojiBg: "#E8F5E9", name: "Coque iPhone 15", shop: "TechZone DZ", price: "1 200 DA", location: "Hammamet" },
  { emoji: "💄", emojiBg: "#F3E5F5", name: "Kit Beauté Natural", shop: "Beauté d'Orient", price: "3 400 DA", location: "Kouba" },
  { emoji: "🧥", emojiBg: "#E0F2F1", name: "Veste Cuir Classic", shop: "El Yasmine Store", price: "12 500 DA", location: "Alger Centre" },
  { emoji: "👖", emojiBg: "#FFF8E1", name: "Jean Slim Homme", shop: "Mode DZ", price: "4 200 DA", location: "Oran" },
  { emoji: "👗", emojiBg: "#FCE4EC", name: "Robe d'été Femme", shop: "Nour Fashion", price: "3 800 DA", location: "Constantine" },
  { emoji: "🧢", emojiBg: "#E8EAF6", name: "Casquette NBK Style", shop: "Urban DZ", price: "1 800 DA", location: "Sétif" },
];

const shops = [
  { initials: "EY", color: "#1B3358", textColor: "#4FC3F7", name: "El Yasmine Store", category: "Mode", products: 48, rating: 5 },
  { initials: "TZ", color: "#E8F5E9", textColor: "#2E7D32", name: "TechZone DZ", category: "Électronique", products: 120, rating: 4 },
  { initials: "BO", color: "#FCE4EC", textColor: "#C2185B", name: "Beauté d'Orient", category: "Beauté", products: 35, rating: 5 },
  { initials: "SW", color: "#FFF3E0", textColor: "#E65100", name: "StreetWear DZ", category: "Mode", products: 67, rating: 4 },
  { initials: "MD", color: "#E3F2FD", textColor: "#1565C0", name: "Mode DZ", category: "Mode", products: 89, rating: 5 },
  { initials: "NF", color: "#F3E5F5", textColor: "#7B1FA2", name: "Nour Fashion", category: "Mode", products: 42, rating: 4 },
];

export default function Home() {
  return (
    <main>
      <Header />

      <div className={styles.content}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Tendances à Alger</h2>
          <div className={styles.sectionActions}>
            <span className={styles.wilayaTag}>📍 Alger</span>
            <span className={styles.viewAll}>Voir tout →</span>
          </div>
        </div>

        <div className={styles.productsGrid}>
          {products.map((product) => (
            <ProductCard key={product.name} {...product} />
          ))}
        </div>

        <div className={styles.shopsSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Boutiques populaires</h2>
            <span className={styles.viewAll}>Voir tout →</span>
          </div>

          <div className={styles.shopsGrid}>
            {shops.map((shop) => (
              <ShopCard key={shop.name} {...shop} />
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
