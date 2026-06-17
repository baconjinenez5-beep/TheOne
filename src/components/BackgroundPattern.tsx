import { useEffect, useState } from "react";

interface BackgroundPatternProps {
  theme: "light" | "dark" | "system";
}

export default function BackgroundPattern({ theme }: BackgroundPatternProps) {
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      setResolvedTheme(mediaQuery.matches ? "dark" : "light");

      const listener = (e: MediaQueryListEvent) => {
        setResolvedTheme(e.matches ? "dark" : "light");
      };
      mediaQuery.addEventListener("change", listener);
      return () => mediaQuery.removeEventListener("change", listener);
    } else {
      setResolvedTheme(theme);
    }
  }, [theme]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* Background canvas filled with gradient based on resolved theme */}
      <div
        className={`absolute inset-0 transition-colors duration-700 ease-in-out ${
          resolvedTheme === "light"
            ? "bg-[#fbfaf7] text-[#121824]"
            : "bg-[#07101a] text-white"
        }`}
      />

      {/* Decorative Topography Lines + Compass Design Drawing */}
      <svg
        className={`absolute inset-0 w-full h-full opacity-[0.08] sm:opacity-[0.12] transition-colors duration-700 ${
          resolvedTheme === "light" ? "text-brand-gold/70" : "text-brand-gold/40"
        }`}
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        <defs>
          {/* Subtle grid pattern */}
          <pattern id="geo-grid" width="120" height="120" patternUnits="userSpaceOnUse">
            <path
              d="M 120 0 L 0 0 0 120"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              strokeDasharray="4 8"
            />
            <circle cx="120" cy="120" r="1.5" fill="currentColor" opacity="0.4" />
          </pattern>
        </defs>

        {/* Dynamic Grid Background */}
        <rect width="100%" height="100%" fill="url(#geo-grid)" />

        {/* Dynamic Topography/Contour design lines */}
        <g stroke="currentColor" fill="none" strokeWidth="1" strokeLinecap="round">
          {/* Wave 1 */}
          <path d="M-100,200 C300,350 400,50 800,250 C1200,450 1400,100 1800,280" strokeDasharray="5 5" />
          {/* Wave 2 */}
          <path d="M-150,230 C250,380 430,90 780,290 C1130,490 1450,140 1850,320" />
          {/* Wave 3 (Tight) */}
          <path d="M-50,600 C200,500 600,800 1000,650 C1400,500 1600,750 2000,600" strokeDasharray="12 4" />
          <path d="M-50,620 C200,520 600,820 1000,670 C1400,520 1600,770 2000,620" />
          {/* North East Contour lines representing mountain slopes of Ruskeala */}
          <path d="M1200,-50 C1300,100 1500,200 1700,150 C1900,100 2000,300 2100,350" />
          <path d="M1250,-50 C1350,120 1530,220 1730,170 C1930,120 2030,320 2150,370" strokeWidth="1.5" />
          <path d="M1300,-50 C1400,140 1560,240 1760,190 C1960,140 2060,340 2200,390" />
        </g>

        {/* Coordinates texts (Human Labels referencing actual spots) */}
        <g
          className={`font-mono text-[9px] font-semibold tracking-widest ${
            resolvedTheme === "light" ? "fill-slate-500/80" : "fill-white/40"
          }`}
        >
          <text x="5%" y="15%">RUSKEALA CANYON // 61°56'56"N 30°34'52"E</text>
          <text x="75%" y="8%">LADOGA SKERRIES // 61°32'44"N 30°11'02"E</text>
          <text x="12%" y="84%">VIBORG CASTLE // 60°42'57"N 28°43'45"E</text>
          <text x="68%" y="92%">KIVACH WATERFALL // 62°16'05"N 33°58'48"E</text>
          <text x="82%" y="54%">ONEGA LAKE // 61°45'00"N 35°00'00"E</text>
        </g>

        {/* Decorative Compass Rose Vector design */}
        <g
          transform="translate(180, 400)"
          className={`transition-transform duration-700 ${
            resolvedTheme === "light" ? "text-brand-gold/60" : "text-brand-gold/30"
          }`}
          stroke="currentColor"
          fill="none"
          strokeWidth="1"
        >
          <circle cx="0" cy="0" r="45" strokeDasharray="3 3" />
          <circle cx="0" cy="0" r="15" />
          {/* Compass Needles */}
          <line x1="0" y1="-55" x2="0" y2="55" strokeWidth="1.5" />
          <line x1="-55" y1="0" x2="55" y2="0" strokeWidth="1.5" />
          {/* Diagonal */}
          <line x1="-35" y1="-35" x2="35" y2="35" strokeDasharray="2 4" />
          <line x1="35" y1="-35" x2="-35" y2="35" strokeDasharray="2 4" />
          {/* Compass directions */}
          <g
            className={`font-sans text-[10px] font-bold text-center ${
              resolvedTheme === "light" ? "fill-slate-700" : "fill-white/70"
            }`}
            stroke="none"
            textAnchor="middle"
          >
            <text x="0" y="-60">N</text>
            <text x="0" y="70">S</text>
            <text x="68" y="4">E</text>
            <text x="-68" y="4">W</text>
          </g>
        </g>

        {/* Karelia Nature symbols watermarked softly */}
        {/* Mountain outline watermark in lower right */}
        <g
          transform="translate(850, 680)"
          className={`transition-colors duration-700 ${
            resolvedTheme === "light" ? "text-slate-200/50" : "text-white/5"
          }`}
          stroke="currentColor"
          fill="none"
          strokeWidth="2"
        >
          {/* Peaks */}
          <polygon points="0,150 150,30 300,150" />
          <polygon points="100,150 220,50 340,150" />
          <polygon points="250,150 320,80 400,150" strokeDasharray="2 2" />
        </g>
      </svg>

      {/* Dynamic Colored Nebulae Glow Effects (Slightly altered based on dark/light) */}
      <div
        className={`absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none transition-all duration-1000 ${
          resolvedTheme === "light"
            ? "bg-brand-gold/5 opacity-50"
            : "bg-brand-gold/10 opacity-70"
        }`}
      />
      <div
        className={`absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-[160px] pointer-events-none transition-all duration-1000 ${
          resolvedTheme === "light"
            ? "bg-brand-green/5 opacity-40"
            : "bg-[#74d5a6]/10 opacity-60"
        }`}
      />
    </div>
  );
}
