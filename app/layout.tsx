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
        
        {/* --- DECORATIVE BIRD BACKGROUND --- */}
        <div className="bg-bird-container" aria-hidden="true">
          {/* Burung 1: Kecil, Cepat, Posisi Atas */}
          <svg 
            className="bird-svg bird-small" 
            style={{ top: '10%', animationDuration: '18s', animationDelay: '0s' }}
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M22 12C22 12 18 8 12 8C6 8 2 12 2 12C2 12 6 16 12 16C18 16 22 12 22 12Z" />
            <path d="M12 8C12 8 14 4 18 4C20 4 22 6 22 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
          </svg>

          {/* Burung 2: Sedang, Lambat, Posisi Tengah */}
          <svg 
            className="bird-svg bird-medium" 
            style={{ top: '35%', animationDuration: '28s', animationDelay: '7s' }}
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
             <path d="M22 12C22 12 18 8 12 8C6 8 2 12 2 12C2 12 6 16 12 16C18 16 22 12 22 12Z" />
             <path d="M12 8C12 8 10 2 6 2C4 2 2 4 2 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
          </svg>

          {/* Burung 3: Besar, Sangat Lambat, Posisi Bawah */}
          <svg 
            className="bird-svg bird-large" 
            style={{ top: '65%', animationDuration: '40s', animationDelay: '3s' }}
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M22 12C22 12 18 8 12 8C6 8 2 12 2 12C2 12 6 16 12 16C18 16 22 12 22 12Z" />
            <path d="M12 8C12 8 14 14 18 14C20 14 22 12 22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
          </svg>

          {/* Burung 4: Kecil, Cepat, Posisi Acak */}
          <svg 
            className="bird-svg bird-small" 
            style={{ top: '20%', animationDuration: '22s', animationDelay: '12s' }}
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M22 12C22 12 18 8 12 8C6 8 2 12 2 12C2 12 6 16 12 16C18 16 22 12 22 12Z" />
          </svg>
          
          {/* Burung 5: Sedang, Posisi Rendah */}
          <svg 
            className="bird-svg bird-medium" 
            style={{ top: '80%', animationDuration: '30s', animationDelay: '15s' }}
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M22 12C22 12 18 8 12 8C6 8 2 12 2 12C2 12 6 16 12 16C18 16 22 12 22 12Z" />
          </svg>
        </div>
        {/* --- END DECORATIVE BACKGROUND --- */}

        {/* Konten Utama Website */}
        <div className="relative z-10 flex-1 flex flex-col">
          {children}
        </div>

      </body>
    </html>
  );
}
