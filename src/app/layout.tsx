import type { Metadata } from "next";
import "@/styles/globals.css";
import { LangProvider } from "@/context/LangContext";
import { AuthProvider } from "@/context/AuthContext";
import GoogleWrapper from "@/context/GoogleWrapper";

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
        <GoogleWrapper>
          <LangProvider>
            <AuthProvider>{children}</AuthProvider>
          </LangProvider>
        </GoogleWrapper>
      </body>
    </html>
  );
}
