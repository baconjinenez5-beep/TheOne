import React, { useState } from "react";
import { MapPin, Compass, Sparkles, Filter } from "lucide-react";
import { motion } from "motion/react";

interface RegionData {
  id: string;
  name: string;
  locationFilter: string;
  searchFilter?: string;
  description: string;
  count: number;
  // SVG coordinates for a stylized topographic region path/shape
  path: string;
  labelX: number;
  labelY: number;
  spots: string[];
}

interface KareliaMiniMapProps {
  onRegionSelect: (location: string, searchStr?: string) => void;
}

export default function KareliaMiniMap({ onRegionSelect }: KareliaMiniMapProps) {
  const [activeRegion, setActiveRegion] = useState<RegionData | null>(null);

  const regions: RegionData[] = [
    {
      id: "priladozhye",
      name: "Приладожье и Сортавала",
      locationFilter: "Карелия",
      searchFilter: "шхер",
      description: "Живописные Ладожские шхеры, отвесные скалы Сортавалы и мраморный каньон Рускеала.",
      count: 4,
      // Stylized SVG region polygon 
      path: "M 40,110 L 100,105 L 120,150 L 70,180 L 30,150 Z",
      labelX: 65,
      labelY: 135,
      spots: ["Ладожские шхеры", "Сортавала", "Мраморный парк Рускеала", "Озеро Ристиярви"]
    },
    {
      id: "petrozavodsk",
      name: "Прионежье и Кижи",
      locationFilter: "Карелия",
      searchFilter: "съёмка", // matches "съёмка"
      description: "Столица Петрозаводск, Онежское озеро, древний вулкан Гирвас и деревянное зодчество Кижи.",
      count: 2,
      path: "M 105,100 L 160,90 L 180,140 L 125,145 Z",
      labelX: 135,
      labelY: 115,
      spots: ["Онежская набережная", "Остров Кижи", "Водопад Кивач", "Деревня Рубчойла"]
    },
    {
      id: "north-karelia",
      name: "Северная Карелия",
      locationFilter: "Карелия",
      searchFilter: "каяк", // matches tours
      description: "Белое море, национальный парк Паанаярви и дикая нетронутая тайга близ финской границы.",
      count: 3,
      path: "M 40,30 L 120,20 L 150,55 L 105,95 L 40,80 Z",
      labelX: 85,
      labelY: 55,
      spots: ["Парк Паанаярви", "Озеро Пяозеро", "Соловецкий архипелаг", "Река Шуя"]
    },
    {
      id: "lenoblast",
      name: "Ленинградская область",
      locationFilter: "Ленобласть",
      searchFilter: "",
      description: "Пригород Санкт-Петербурга, Карельский перешеек, Вуокса и крепость Корела.",
      count: 3,
      path: "M 30,155 L 68,185 L 115,155 L 130,210 L 40,210 Z",
      labelX: 75,
      labelY: 190,
      spots: ["Река Вуокса", "Крепость Орешек", "Финский залив", "Берег Ладоги"]
    }
  ];

  return (
    <section className="p-6 md:p-8 rounded-3xl border border-white/10 bg-dark-card/40 space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest text-brand-gold uppercase">
            <Compass className="h-4 w-4 text-brand-gold animate-spin-slow" />
            <span>Географический гид</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-light text-white mt-1">
            Интерактивная карта Карелии и СЗФО
          </h3>
          <p className="text-xs text-white/50 leading-relaxed font-light max-w-xl mt-1.5">
            Кликните по любой интерактивной зоне карты региона, чтобы мгновенно отфильтровать авторские туры, ретриты и услуги в этой геолокации.
          </p>
        </div>
        <div className="text-xs font-mono text-brand-gold flex items-center gap-2 bg-brand-gold/5 px-3 py-1.5 rounded-lg border border-brand-gold/15 self-start md:self-auto">
          <Filter className="h-3.5 w-3.5" />
          <span>Быстрый поиск по локациям</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2">
        {/* Render interactive stylized vector SVG map */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="relative w-full max-w-[360px] aspect-[4/5] bg-black/30 rounded-2xl border border-white/5 p-4 flex items-center justify-center overflow-hidden">
            
            {/* Visual radar lines in the map background */}
            <div className="absolute inset-0 pointer-events-none opacity-10">
              <div className="absolute top-[10%] left-[10%] w-[80%] h-[80%] border border-dashed border-white rounded-full"></div>
              <div className="absolute top-[25%] left-[25%] w-[50%] h-[50%] border border-dashed border-white rounded-full"></div>
              <div className="absolute top-0 bottom-0 left-1/2 w-[0.5px] bg-white"></div>
              <div className="absolute left-0 right-0 top-1/2 h-[0.5px] bg-white"></div>
            </div>

            {/* Main Interactive Map SVG */}
            <svg 
              viewBox="0 0 200 240" 
              className="w-full h-full select-none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Ladoga Lake Blue Abstract Area */}
              <circle cx="55" cy="180" r="14" fill="#1b416e" fillOpacity="0.30" stroke="#256cd1" strokeOpacity="0.2" strokeWidth="0.5" />
              <text x="55" y="182" fill="#256cd1" fillOpacity="0.6" fontSize="5" fontWeight="bold" textAnchor="middle" letterSpacing="0.2">ЛАДОГА</text>

              {/* Onega Lake Blue Abstract Area */}
              <ellipse cx="160" cy="140" rx="12" ry="18" fill="#1b416e" fillOpacity="0.30" stroke="#256cd1" strokeOpacity="0.2" strokeWidth="0.5" />
              <text x="160" y="142" fill="#256cd1" fillOpacity="0.6" fontSize="5" fontWeight="bold" textAnchor="middle" letterSpacing="0.2">ОНЕГО</text>

              {/* SVG Region Paths */}
              {regions.map((region) => {
                const isHovered = activeRegion?.id === region.id;
                return (
                  <g key={region.id} className="cursor-pointer">
                    <path
                      d={region.path}
                      fill={isHovered ? "rgba(214, 179, 106, 0.18)" : "rgba(255, 255, 255, 0.02)"}
                      stroke={isHovered ? "#d6b36a" : "rgba(255, 255, 255, 0.15)"}
                      strokeWidth={isHovered ? "1.5" : "0.75"}
                      transition="all 0.3s"
                      onMouseEnter={() => setActiveRegion(region)}
                      onMouseLeave={() => setActiveRegion(null)}
                      onClick={() => onRegionSelect(region.locationFilter, region.searchFilter)}
                    />
                    
                    {/* Region Label Indicator text */}
                    <text
                      x={region.labelX}
                      y={region.labelY}
                      fill={isHovered ? "#d6b36a" : "rgba(255, 255, 255, 0.5)"}
                      fontSize="6.5"
                      fontFamily="Inter, sans-serif"
                      fontWeight={isHovered ? "bold" : "normal"}
                      textAnchor="middle"
                      onClick={() => onRegionSelect(region.locationFilter, region.searchFilter)}
                      onMouseEnter={() => setActiveRegion(region)}
                      onMouseLeave={() => setActiveRegion(null)}
                      className="pointer-events-auto transition-colors duration-300"
                    >
                      {region.id === "priladozhye" && "Сортавала"}
                      {region.id === "petrozavodsk" && "Петрозаводск"}
                      {region.id === "north-karelia" && "Северная Карелия"}
                      {region.id === "lenoblast" && "Ленобласть"}
                    </text>

                    {/* Active hot locations coordinate target pulsing gold spots dots */}
                    {isHovered && (
                      <g>
                        <circle cx={region.labelX} cy={region.labelY - 5} r="2.5" fill="#d6b36a" />
                        <circle cx={region.labelX} cy={region.labelY - 5} r="6" stroke="#d6b36a" strokeWidth="0.5" fill="none" className="animate-ping" style={{ transformOrigin: `${region.labelX}px ${region.labelY - 5}px` }} />
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Region Information Detail Panel */}
        <div className="lg:col-span-6 space-y-5">
          <div className="min-h-[170px] rounded-2xl border border-white/5 bg-black/20 p-5 flex flex-col justify-between">
            {activeRegion ? (
              <div className="space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-brand-gold bg-brand-gold/10 px-2 py-0.5 rounded-full">
                    {activeRegion.locationFilter}
                  </span>
                  <span className="text-[10px] text-white/40 font-mono">
                    {activeRegion.count} активных туров
                  </span>
                </div>
                <h4 className="text-base font-medium text-white flex items-center gap-1.5">
                  <MapPin className="h-4.5 w-4.5 text-brand-gold shrink-0" />
                  {activeRegion.name}
                </h4>
                <p className="text-xs text-white/70 leading-relaxed font-light">
                  {activeRegion.description}
                </p>
                <div className="pt-2">
                  <div className="text-[9px] uppercase font-bold tracking-wider text-white/30 mb-1.5">Популярные направления:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {activeRegion.spots.map((spot, index) => (
                      <span key={index} className="text-[10px] text-white/85 bg-white/5 border border-white/5 px-2 py-0.5 rounded-md">
                        {spot}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-6 space-y-3">
                <div className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-brand-gold">
                  <Compass className="h-5 w-5 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-white/75 font-medium">Панель интерактивного гида</p>
                  <p className="text-[11px] text-white/45 max-w-[260px] mx-auto leading-relaxed">
                    Наведите курсор на интересующую географическую область на карте для детальной сводки.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {regions.map((reg) => (
              <button
                key={reg.id}
                onClick={() => onRegionSelect(reg.locationFilter, reg.searchFilter)}
                onMouseEnter={() => setActiveRegion(reg)}
                onMouseLeave={() => setActiveRegion(null)}
                className="p-3.5 text-left rounded-xl border border-white/5 bg-white/2 hover:border-brand-gold/30 hover:bg-white/5 transition-all text-xs font-medium text-white flex flex-col justify-between h-20 cursor-pointer"
              >
                <span className="text-white/40 text-[9px] uppercase tracking-widest font-mono">
                  {reg.id === "lenoblast" ? "Ленобласть" : "Карелия"}
                </span>
                <span className="truncate w-full block text-white/90 group-hover:text-white mt-1">
                  {reg.name.split(" ")[0]} {reg.id === "priladozhye" && "Сортавала"}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
