import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Miss Universo 2026 · Calificación en vivo",
  description: "Califica a las candidatas mientras ves el Miss Universo 2026 en vivo.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        {children}
        <footer className="px-4 pb-6 pt-2 text-center text-xs text-white/50">
          Desarrollado por Danniel Torres · Datos oficiales: sitio web oficial de Miss Universo
        </footer>
      </body>
    </html>
  );
}
