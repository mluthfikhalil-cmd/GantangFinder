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
        
        {/* --- BACKGROUND BURUNG DEKORATIF (ANTI-GRAVITY STYLE) --- */}
        <div className="bg-bird-container" aria-hidden="true">
          
          {/* Burung 1: Siluet Kicau/Murai (Besar, Kanan Atas) */}
          <svg className="bird-svg bird-1" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
            <path d="M429.6,134.4c-2.4-2.4-5.6-3.6-8.8-3.6c-3.2,0-6.4,1.2-8.8,3.6l-48,48c-4.8,4.8-4.8,12.8,0,17.6 c4.8,4.8,12.8,4.8,17.6,0l39.2-39.2l39.2,39.2c2.4,2.4,5.6,3.6,8.8,3.6s6.4-1.2,8.8-3.6c4.8-4.8,4.8-12.8,0-17.6L429.6,134.4z M325.6,238.4c-2.4-2.4-5.6-3.6-8.8-3.6c-3.2,0-6.4,1.2-8.8,3.6l-48,48c-4.8,4.8-4.8,12.8,0,17.6c4.8,4.8,12.8,4.8,17.6,0 l39.2-39.2l39.2,39.2c2.4,2.4,5.6,3.6,8.8,3.6s6.4-1.2,8.8-3.6c4.8-4.8,4.8-12.8,0-17.6L325.6,238.4z M221.6,342.4 c-2.4-2.4-5.6-3.6-8.8-3.6c-3.2,0-6.4,1.2-8.8,3.6l-48,48c-4.8,4.8-4.8,12.8,0,17.6c4.8,4.8,12.8,4.8,17.6,0l39.2-39.2l39.2,39.2 c2.4,2.4,5.6,3.6,8.8,3.6s6.4-1.2,8.8-3.6c4.8-4.8,4.8-12.8,0-17.6L221.6,342.4z M117.6,446.4c-2.4-2.4-5.6-3.6-8.8-3.6 c-3.2,0-6.4,1.2-8.8,3.6l-48,48c-4.8,4.8-4.8,12.8,0,17.6c4.8,4.8,12.8,4.8,17.6,0l39.2-39.2l39.2,39.2c2.4,2.4,5.6,3.6,8.8,3.6 s6.4-1.2,8.8-3.6c4.8-4.8,4.8-12.8,0-17.6L117.6,446.4z M456.8,87.2c-12.8-12.8-33.6-12.8-46.4,0L204.8,292.8 c-12.8,12.8-12.8,33.6,0,46.4c12.8,12.8,33.6,12.8,46.4,0l205.6-205.6C469.6,120.8,469.6,100,456.8,87.2z M38.4,473.6 c-12.8-12.8-12.8-33.6,0-46.4l205.6-205.6c12.8-12.8,33.6-12.8,46.4,0c12.8,12.8,12.8,33.6,0,46.4L84.8,473.6 C72,486.4,51.2,486.4,38.4,473.6z" opacity="0.3"/>
            <path d="M48,240c0,0,48-96,144-96c48,0,96,24,144,48c48,24,96,24,144,0c0,0-48,96-144,96C240,288,144,240,48,240z" opacity="0.5"/> 
            <path d="M23.99 6.124c-1.325-.71-3.03-.81-4.535-.295-.69.236-1.335.615-1.89 1.105-.555-.49-1.2-.87-1.89-1.105-1.505-.515-3.21-.415-4.535.295C9.82 6.81 8.635 8.335 8.32 10.12c-.06.34-.09.69-.09 1.04 0 2.39 1.535 4.425 3.665 5.165.255.09.525.15.8.185v2.49h2.6v-2.49c.275-.035.545-.095.8-.185 2.13-.74 3.665-2.775 3.665-5.165 0-.35-.03-.7-.09-1.04-.315-1.785-1.5-3.31-2.82-3.996z" transform="scale(15) translate(10,10)" opacity="0.4"/>
          </svg>

          {/* Burung 2: Rombongan Merpati (Kiri Bawah) */}
          <svg className="bird-svg bird-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M23.5 6.5c-2-2-5-3-8-3c-3 0-6 1-8 3c-2 2-3 5-3 8c0 3 1 6 3 8c2 2 5 3 8 3c3 0 6-1 8-3c2-2 3-5 3-8C26.5 11.5 25.5 8.5 23.5 6.5z M12 18c-3.3 0-6-2.7-6-6s2.7-6 6-6s6 2.7 6 6S15.3 18 12 18z" opacity="0.3"/>
            <path d="M2 12l10-8 10 8-10 8L2 12z" transform="scale(0.5) translate(10,10)"/>
            <path d="M2 12l10-8 10 8-10 8L2 12z" transform="scale(0.3) translate(30,20)"/>
            <path d="M2 12l10-8 10 8-10 8L2 12z" transform="scale(0.4) translate(20,30)"/>
          </svg>

          {/* Burung 3: Kecil Jauh (Tengah) */}
          <svg className="bird-svg bird-3" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M23.99 6.124c-1.325-.71-3.03-.81-4.535-.295-.69.236-1.335.615-1.89 1.105-.555-.49-1.2-.87-1.89-1.105-1.505-.515-3.21-.415-4.535.295C9.82 6.81 8.635 8.335 8.32 10.12c-.06.34-.09.69-.09 1.04 0 2.39 1.535 4.425 3.665 5.165.255.09.525.15.8.185v2.49h2.6v-2.49c.275-.035.545-.095.8-.185 2.13-.74 3.665-2.775 3.665-5.165 0-.35-.03-.7-.09-1.04-.315-1.785-1.5-3.31-2.82-3.996z" transform="scale(0.8) translate(5,5)"/>
          </svg>

        </div>
        {/* --- END BACKGROUND --- */}

        {/* Konten Utama Website */}
        <div className="relative z-10 flex-1 flex flex-col">
          {children}
        </div>

      </body>
    </html>
  );
}
