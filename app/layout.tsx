import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agri-MVP",
  description: "Marché agricole (MVP) – contact WhatsApp des associations.",
  manifest: "/manifest.webmanifest",
  themeColor: "#0a0a0a",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <div className="mx-auto max-w-4xl px-4 py-6">{children}</div>
      </body>
    </html>
  );
}
