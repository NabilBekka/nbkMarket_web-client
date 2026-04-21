"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./Header.module.css";
import AuthModal from "./AuthModal";
import { useLang } from "@/context/LangContext";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";

interface Suggestion { id: string; name: string; price?: string; score: number; }

export default function Header({ onSearch }: { onSearch?: (query: string, type: "product" | "shop") => void }) {
  const [showAuth, setShowAuth] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { lang, setLang, t } = useLang();
  const { user, accessToken, logout } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"product" | "shop">("product");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestTimer = useRef<NodeJS.Timeout | null>(null);
  const suggestRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setShowDropdown(false);
      if (suggestRef.current && !suggestRef.current.contains(e.target as Node)) setShowSuggestions(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (searchQuery.length < 1) { setSuggestions([]); setShowSuggestions(false); return; }
    if (suggestTimer.current) clearTimeout(suggestTimer.current);
    suggestTimer.current = setTimeout(async () => {
      const res = await api.search.suggest(searchQuery, searchType, lang);
      if (res.data?.suggestions) { setSuggestions(res.data.suggestions); setShowSuggestions(res.data.suggestions.length > 0); }
    }, 250);
  }, [searchQuery, searchType, lang]);

  const executeSearch = (q?: string) => {
    const query = (q || searchQuery).trim();
    if (query.length < 1 || !onSearch) return;
    setShowSuggestions(false);
    onSearch(query, searchType);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === "Enter") executeSearch(); };

  const handleSuggestionClick = (s: Suggestion) => {
    setSearchQuery(s.name);
    setShowSuggestions(false);
    if (onSearch) onSearch(s.name, searchType);
  };

  const handleLangChange = (newLang: string) => {
    const l = newLang as "en" | "fr";
    setLang(l);
    if (user && accessToken) api.auth.updateLang(accessToken, { lang: l });
  };

  const handleLogout = async () => { setShowDropdown(false); await logout(); };

  return (
    <>
      <header>
        <div className={styles.topBar}>
          <a href="/" className={styles.logo}>NBK<span className={styles.logoAccent}>Market</span></a>

          <div className={styles.searchWrap} ref={suggestRef}>
            <input className={styles.search} type="text" placeholder={t.header.searchPlaceholder} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={handleKeyDown} onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }} />
            <select className={styles.searchSelect} value={searchType} onChange={(e) => setSearchType(e.target.value as "product" | "shop")}>
              <option value="product">{t.header.searchProduct}</option>
              <option value="shop">{t.header.searchShop}</option>
            </select>
            <button className={styles.searchBtn} onClick={() => executeSearch()}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            </button>

            {showSuggestions && (
              <div className={styles.suggestDropdown}>
                {suggestions.map(s => (
                  <button key={s.id} className={styles.suggestItem} onClick={() => handleSuggestionClick(s)}>
                    <span className={styles.suggestName}>{s.name}</span>
                    {s.price && <span className={styles.suggestPrice}>{parseFloat(s.price).toLocaleString()} DA</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className={styles.right}>
            {user ? (
              <div className={styles.avatarWrap} ref={dropdownRef}>
                <button className={styles.avatarBtn} onClick={() => setShowDropdown(!showDropdown)}>{user.first_name[0]}{user.last_name[0]}</button>
                {showDropdown && (
                  <div className={styles.dropdown}>
                    <div className={styles.dropdownHeader}>
                      <span className={styles.dropdownName}>{user.first_name} {user.last_name}</span>
                      <span className={styles.dropdownEmail}>{user.email}</span>
                    </div>
                    <div className={styles.dropdownDivider} />
                    <div className={styles.dropdownLang}>
                      <button className={`${styles.dropdownLangBtn} ${lang === "en" ? styles.dropdownLangActive : ""}`} onClick={() => handleLangChange("en")}>🇬🇧 English</button>
                      <button className={`${styles.dropdownLangBtn} ${lang === "fr" ? styles.dropdownLangActive : ""}`} onClick={() => handleLangChange("fr")}>🇫🇷 Français</button>
                    </div>
                    <div className={styles.dropdownDivider} />
                    <a href="/settings" className={styles.dropdownItem} onClick={() => setShowDropdown(false)}>⚙️ {t.header.settings}</a>
                    <button className={styles.dropdownItemDanger} onClick={handleLogout}>🚪 {t.header.logout}</button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button className={styles.loginBtn} onClick={() => setShowAuth(true)}>{t.header.login}</button>
                <select className={styles.langSelect} value={lang} onChange={(e) => handleLangChange(e.target.value)}>
                  <option value="en">🇬🇧 EN</option>
                  <option value="fr">🇫🇷 FR</option>
                </select>
              </>
            )}
          </div>
        </div>
      </header>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}
