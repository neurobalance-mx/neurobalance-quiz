import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Perfil Cerebral Neurobalance",
  description: "Descubre tus fortalezas, características y retos funcionales a través del cerebro asimétrico.",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#FAFAFC" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&family=Literata:opsz,wght@7..72,500;7..72,600&display=swap"
        />
      </head>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
