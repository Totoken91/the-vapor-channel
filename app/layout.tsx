import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "THE VAPOR CHANNEL",
  description: "Bulletin météo rétro 80s — Vraie météo, esthétique VHS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=VT323&family=Share+Tech+Mono&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
