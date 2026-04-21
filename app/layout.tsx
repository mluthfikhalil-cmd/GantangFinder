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
                if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.setAttribute('data-theme', 'dark');
                }
              } catch (e) {}
            })();
          `
        }} />
      </head>
      <body className="min-h-full flex flex-col relative font-sans">
        
        {/* --- ANIMATED BIRD BACKGROUND --- */}
        <div className="bg-bird-container" aria-hidden="true">
          <svg className="bird-svg bird-small" style={{ top: '15%', animationDuration: '25s', animationDelay: '0s' }} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M23.99 6.124c-1.325-.71-3.03-.81-4.535-.295-.69.236-1.335.615-1.89 1.105-.555-.49-1.2-.87-1.89-1.105-1.505-.515-3.21-.415-4.535.295C9.82 6.81 8.635 8.335 8.32 10.12c-.06.34-.09.69-.09 1.04 0 2.39 1.535 4.425 3.665 5.165.255.09.525.15.8.185v2.49h2.6v-2.49c.275-.035.545-.095.8-.185 2.13-.74 3.665-2.775 3.665-5.165 0-.35-.03-.7-.09-1.04-.315-1.785-1.5-3.31-2.82-3.996z"/>
          </svg>
          <svg className="bird-svg bird-medium" style={{ top: '40%', animationDuration: '35s', animationDelay: '12s' }} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M23.5 6.5c-2-2-5-3-8-3c-3 0-6 1-8 3c-2 2-3 5-3 8c0 3 1 6 3 8c2 2 5 3 8 3c3 0 6-1 8-3c2-2 3-5 3-8C26.5 11.5 25.5 8.5 23.5 6.5z M12 18c-3.3 0-6-2.7-6-6s2.7-6 6-6s6 2.7 6 6S15.3 18 12 18z"/>
          </svg>
          <svg className="bird-svg bird-large" style={{ top: '70%', animationDuration: '45s', animationDelay: '5s' }} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M23.99 6.124c-1.325-.71-3.03-.81-4.535-.295-.69.236-1.335.615-1.89 1.105-.555-.49-1.2-.87-1.89-1.105-1.505-.515-3.21-.415-4.535.295C9.82 6.81 8.635 8.335 8.32 10.12c-.06.34-.09.69-.09 1.04 0 2.39 1.535 4.425 3.665 5.165.255.09.525.15.8.185v2.49h2.6v-2.49c.275-.035.545-.095.8-.185 2.13-.74 3.665-2.775 3.665-5.165 0-.35-.03-.7-.09-1.04-.315-1.785-1.5-3.31-2.82-3.996z"/>
          </svg>
        </div>
        {/* --- END ANIMATED BACKGROUND --- */}

        {/* Konten Utama Website */}
        <div className="relative z-10 flex-1 flex flex-col">
          {children}
        </div>

      </body>
    </html>
  );
}
