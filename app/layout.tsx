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
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                var stored = localStorage.getItem('gantang-theme');
                if (stored === 'light') {
                  document.documentElement.setAttribute('data-theme', 'light');
                } else {
                  // Default to dark for Gen Z aesthetic
                  document.documentElement.setAttribute('data-theme', 'dark');
                }
              } catch (e) {}
            })();
          `
        }} />
      </head>
      <body className="min-h-full flex flex-col relative font-sans">

        {/* Konten Utama Website */}
        <div className="relative z-10 flex-1 flex flex-col">
          {children}
        </div>

      </body>
    </html>
  );
}
