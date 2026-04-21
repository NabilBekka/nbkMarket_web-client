"use client";
import { useState, useEffect } from "react";
import styles from "./SearchResults.module.css";
import { useLang } from "@/context/LangContext";
import { api } from "@/services/api";

interface ProductResult {
  id: string; title: string; price: number; main_image: string;
  avg_rating: number | null; review_count: number; company_name: string;
}
interface ShopResult {
  id: string; company_name: string; category_name: string | null;
  parent_category_name: string | null; wilaya_name: string | null;
}

const PER_PAGE = 20;

export default function SearchResults({ query, type }: { query: string; type: "product" | "shop" }) {
  const { lang, t } = useLang();
  const [products, setProducts] = useState<ProductResult[]>([]);
  const [shops, setShops] = useState<ShopResult[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
    doSearch(1);
  }, [query, type, lang]);

  const doSearch = async (p: number) => {
    setLoading(true);
    const offset = (p - 1) * PER_PAGE;
    if (type === "product") {
      const res = await api.search.products(query, lang, PER_PAGE, offset);
      if (res.data) { setProducts(res.data.results); setTotal(res.data.total); }
    } else {
      const res = await api.search.shops(query, lang, PER_PAGE, offset);
      if (res.data) { setShops(res.data.results); setTotal(res.data.total); }
    }
    setLoading(false);
  };

  const handlePage = (p: number) => { setPage(p); doSearch(p); };
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const ts = t.search;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        {ts.resultsFor} "{query}" — {total} {type === "product" ? ts.products : ts.shops}
      </h2>

      {loading ? (
        <div className={styles.loading}>...</div>
      ) : total === 0 ? (
        <div className={styles.empty}>{ts.noResults}</div>
      ) : type === "product" ? (
        <div className={styles.grid}>
          {products.map(p => (
            <div key={p.id} className={styles.card}>
              <img src={p.main_image} alt={p.title} className={styles.cardImage} onError={(e) => { (e.target as HTMLImageElement).src = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><rect width='200' height='200' fill='%23f0f0f0'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23ccc' font-size='40'>📷</text></svg>"; }} />
              <div className={styles.cardBody}>
                <span className={styles.cardTitle}>{p.title}</span>
                <span className={styles.cardPrice}>{p.price.toLocaleString()} {ts.da}</span>
                <span className={styles.cardShop}>{p.company_name}</span>
                {p.avg_rating !== null ? (
                  <span className={styles.cardRating}>⭐ {p.avg_rating.toFixed(1)} ({p.review_count})</span>
                ) : (
                  <span className={styles.cardNoRating}>{ts.notRated}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.shopList}>
          {shops.map(s => (
            <div key={s.id} className={styles.shopCard}>
              <div className={styles.shopAvatar}>{s.company_name[0]}</div>
              <div className={styles.shopInfo}>
                <span className={styles.shopName}>{s.company_name}</span>
                {s.category_name && <span className={styles.shopCategory}>{s.category_name}{s.parent_category_name ? ` · ${s.parent_category_name}` : ""}</span>}
                {s.wilaya_name && <span className={styles.shopWilaya}>📍 {s.wilaya_name}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className={styles.pagination}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} className={`${styles.pageBtn} ${p === page ? styles.pageBtnActive : ""}`} onClick={() => handlePage(p)}>{p}</button>
          ))}
        </div>
      )}
    </div>
  );
}
