# NBK Market — Web Client

Site public de la marketplace NBK Market. Permet aux utilisateurs de parcourir les boutiques, rechercher des produits et contacter les commerçants.

## Stack technique

- Next.js 15 (App Router)
- React 19
- TypeScript
- CSS Modules

## Installation

```bash
npm install
```

## Configuration

```bash
cp .env.example .env.local
```

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | URL de l'API backend |

## Lancement

```bash
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000) dans ton navigateur.

## Structure

```
src/
├── app/              # Pages (App Router)
│   ├── layout.tsx    # Layout racine
│   ├── page.tsx      # Page d'accueil
│   └── page.module.css
├── components/       # Composants réutilisables
│   ├── Header.tsx
│   ├── ProductCard.tsx
│   ├── ShopCard.tsx
│   └── Footer.tsx
└── styles/
    └── globals.css   # Variables CSS + reset
```

## Design

- Thème : Bleu nuit (`#0B1A2E`) + blanc + accent cyan (`#4FC3F7`)
- Prix affichés en Dinar Algérien (DA)
- Localisation par wilaya
- Contact direct (pas de panier/paiement)
