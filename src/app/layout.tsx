import type { Metadata } from "next";
import "@/styles/globals.css";
import { LangProvider } from "@/context/LangContext";

export const metadata: Metadata = {
  title: "NBK Market",
  description: "The social marketplace for Algerian merchants",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}
