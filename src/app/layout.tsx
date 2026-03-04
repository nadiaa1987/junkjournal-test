import type { Metadata } from "next";
import { Inter, Playfair_Display, Dancing_Script } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const dancing = Dancing_Script({
  variable: "--font-dancing",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Junk Journal AI | Create Vintage Ephemera with AI",
  description: "Generate beautiful, vintage-style junk journal pages, ephemera, and collages using artificial intelligence.",
};

import { Providers } from "../components/Providers";
import Navbar from "../components/Navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${inter.variable} ${playfair.variable} ${dancing.variable}`}>
        <Providers>
          <div className="container fade-in">
            <Navbar />
            <main>
              {children}
            </main>
            <footer className="footer">
              <p>&copy; 2026 Junk Journal AI. Handmade with AI for tea-stained souls.</p>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
