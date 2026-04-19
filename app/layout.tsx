import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GantangFinder — Jadwal Lomba Burung Kicau",
  description: "Temukan jadwal lomba burung kicau terlengkap se-Indonesia. Cari event lomba, penyelenggara, dan lokasi terdekat.",
  keywords: "lomba burung kicau, gantangan, jadwal lomba burung, event burung kicau",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
