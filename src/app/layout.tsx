import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "NBK Market",
  description: "La marketplace sociale des commerçants algériens",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
