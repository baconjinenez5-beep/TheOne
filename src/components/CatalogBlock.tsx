import { useState, useEffect } from "react";
import { Compass, Search, MapPin, Calendar, Star, SlidersHorizontal, Image, Heart, Eye, Check } from "lucide-react";
import { CatalogCard } from "../types";
import { initialCards } from "../data";
import { motion, AnimatePresence } from "motion/react";

interface CatalogBlockProps {
  onCardSelect: (card: CatalogCard) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  favorites?: string[];
  toggleFavorite?: (id: string) => void;
  cards?: CatalogCard[];
  mapRegionFilter?: string;
  setMapRegionFilter?: (region: string) => void;
  mapSearchQuery?: string;
  setMapSearchQuery?: (search: string) => void;
}

export default function CatalogBlock({
  onCardSelect,
  selectedCategory,
  setSelectedCategory,
  favorites = [],
  toggleFavorite,
  cards = [],
  mapRegionFilter = "Все регионы",
  setMapRegionFilter,
  mapSearchQuery = "",
  setMapSearchQuery
}: CatalogBlockProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState("Все регионы");
  const [dateFilter, setDateFilter] = useState("Любые даты");

  // Synchronize dynamic Map Filtering triggers from outer sections
  useEffect(() => {
    if (mapRegionFilter) {
      setRegionFilter(mapRegionFilter);
    }
  }, [mapRegionFilter]);

  useEffect(() => {
    if (mapSearchQuery !== undefined) {
      setSearchQuery(mapSearchQuery);
    }
  }, [mapSearchQuery]);

  // Clean filters inside outer states on active override changes in this view to preserve local cohesion
  const handleQueryChangeLocal = (value: string) => {
    setSearchQuery(value);
    if (setMapSearchQuery) {
      setMapSearchQuery(value);
    }
  };

  const handleRegionChangeLocal = (value: string) => {
    setRegionFilter(value);
    if (setMapRegionFilter) {
      setMapRegionFilter(value);
    }
  };

  // Filter lists based on category tab, text query, region, and date rules
  const filteredCards = cards.filter((card) => {
    const matchesCategory = selectedCategory === "Все" || card.type === selectedCategory;
    const matchesRegion = regionFilter === "Все регионы" || card.location === regionFilter;
    
    let matchesDate = true;
    if (dateFilter !== "Любые даты") {
      const cardDateLower = (card.date || "").toLowerCase();
      if (dateFilter === "Выходные дни") {
        matchesDate = cardDateLower.includes("суббот") || 
                      cardDateLower.includes("воскрес") || 
                      cardDateLower.includes("выходн") || 
                      cardDateLower.includes("пятниц") || 
                      cardDateLower.includes("ежеднев") ||
                      cardDateLower.includes("11 июля") ||
                      cardDateLower.includes("12 июля") ||
                      cardDateLower.includes("18 июля") ||
                      cardDateLower.includes("25 июля");
      } else if (dateFilter === "Июль 2026") {
        matchesDate = cardDateLower.includes("июл") || 
                      cardDateLower.includes("ежеднев") || 
                      cardDateLower.includes("индивиду");
      } else if (dateFilter === "Август 2026") {
        matchesDate = cardDateLower.includes("авг") || 
                      cardDateLower.includes("ежеднев") || 
                      cardDateLower.includes("индивиду");
      }
    }
    
    const text = (card.title + card.author + card.location + card.desc + card.type).toLowerCase();
    const matchesSearch = text.includes(searchQuery.toLowerCase());

    return matchesCategory && matchesRegion && matchesDate && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filters Header Board */}
      <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-dark-card p-6 md:p-8 shadow-xl">
        {/* Background ambient lighting */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/5 blur-3xl pointer-events-none rounded-full"></div>
        <img
          className="absolute inset-0 w-full h-full object-cover opacity-10 pointer-events-none select-none"
          src="https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1400&q=80"
          alt="Поиск туров"
        />
        <div className="relative z-10 space-y-4">
          <div>
            <span className="text-[10px] tracking-widest uppercase font-bold text-brand-gold">
              Поиск и подбор впечатлений
            </span>
            <h2 className="text-2xl sm:text-3xl font-light text-white mt-1">
              Найдите идеальное времяпровождение
            </h2>
          </div>

          {/* Controls Bar Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 pt-2">
            
            {/* Search Input field */}
            <div className="lg:col-span-5 relative flex items-center bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus-within:border-brand-gold/60 transition-colors">
              <Search className="h-4.5 w-4.5 text-brand-gold mr-3 shrink-0" />
              <input
                id="search-input-field"
                type="text"
                placeholder="Например: каяк, шхеры, фотограф, ретрит..."
                className="w-full bg-transparent text-sm border-none outline-none text-white placeholder-white/25 pr-4"
                value={searchQuery}
                onChange={(e) => handleQueryChangeLocal(e.target.value)}
              />
            </div>

            {/* Region select list */}
            <div className="lg:col-span-3 relative flex items-center bg-black/40 border border-white/10 rounded-xl px-4 py-3">
              <MapPin className="h-4.5 w-4.5 text-brand-gold mr-3 shrink-0" />
              <select
                id="region-filter-select"
                className="w-full bg-transparent text-sm border-none outline-none text-white/90 cursor-pointer appearance-none"
                value={regionFilter}
                onChange={(e) => handleRegionChangeLocal(e.target.value)}
              >
                <option value="Все регионы" className="bg-dark-card text-white">Все регионы</option>
                <option value="Карелия" className="bg-dark-card text-white">Карелия</option>
                <option value="Ленобласть" className="bg-dark-card text-white">Ленобласть</option>
                <option value="Онлайн" className="bg-dark-card text-white">Онлайн</option>
              </select>
              <div className="absolute right-4 text-white/20 pointer-events-none text-xs">▼</div>
            </div>

            {/* Date filter select */}
            <div className="lg:col-span-3 relative flex items-center bg-black/40 border border-white/10 rounded-xl px-4 py-3">
              <Calendar className="h-4.5 w-4.5 text-brand-gold mr-3 shrink-0" />
              <select
                id="date-filter-select"
                className="w-full bg-transparent text-sm border-none outline-none text-white/90 cursor-pointer appearance-none"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="Любые даты" className="bg-dark-card text-white">Любые даты</option>
                <option value="Выходные дни" className="bg-dark-card text-white">Выходные дни</option>
                <option value="Июль 2026" className="bg-dark-card text-white">Июль 2026</option>
                <option value="Август 2026" className="bg-dark-card text-white">Август 2026</option>
              </select>
              <div className="absolute right-4 text-white/20 pointer-events-none text-xs">▼</div>
            </div>

            {/* Fast reset button */}
            <button
              onClick={() => {
                handleQueryChangeLocal("");
                handleRegionChangeLocal("Все регионы");
                setDateFilter("Любые даты");
                setSelectedCategory("Все");
              }}
              id="reset-filters-btn"
              className="lg:col-span-1 p-3 rounded-xl border border-white/10 text-white/60 bg-white/5 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all flex items-center justify-center cursor-pointer active:scale-95"
              title="Сбросить все фильтры"
            >
              <SlidersHorizontal className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Categories Switch Tabs Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-b border-white/10">
        <div className="flex overflow-x-auto whitespace-nowrap scrollbar-none gap-2 pb-1.5 sm:pb-0 sm:flex-wrap w-full sm:w-auto -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth">
          {["Все", "Мероприятия", "Услуги", "Туры", "Инструкции"].map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                id={`filter-tab-${cat}`}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4.5 py-2.5 rounded-full text-xs font-bold transition-all border cursor-pointer shrink-0 ${
                  isActive
                    ? "bg-brand-gold/15 border-brand-gold text-brand-gold shadow-md shadow-brand-gold/5"
                    : "bg-transparent border-white/5 hover:border-white/15 text-white/60 hover:text-white"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <div className="text-xs font-mono text-white/40 font-medium whitespace-nowrap self-end sm:self-auto">
          Показано: <span className="text-brand-gold font-bold">{filteredCards.length}</span> из {initialCards.length} карточек
        </div>
      </div>

      {/* Catalog Cards Grid showing large vs small grid columns based on layout sizes */}
      {filteredCards.length > 0 ? (
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredCards.map((card) => {
              const isFav = favorites.includes(card.id);
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -15 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  key={card.id}
                  onClick={() => onCardSelect(card)}
                  className="group relative border border-white/10 rounded-[28px] overflow-hidden bg-dark-card shadow-lg hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[420px]"
                >
                {/* Heart bookmark trigger */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite?.(card.id);
                  }}
                  className={`absolute top-4 right-4 z-20 p-2 rounded-full border transition-all cursor-pointer backdrop-blur-md ${
                    isFav
                      ? "bg-brand-gold/20 border-brand-gold text-brand-gold"
                      : "bg-black/50 border-white/10 text-white hover:text-red-400 hover:scale-110"
                  }`}
                  title={isFav ? "Убрать из избранного" : "Добавить в избранное"}
                >
                  <Heart className={`h-4 w-4 ${isFav ? "fill-brand-gold" : ""}`} />
                </button>

                {/* Card visual frame */}
                <div className="relative h-56 w-full overflow-hidden shrink-0 border-b border-white/5">
                <img
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  src={card.img}
                  alt={card.title}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-card via-black/10 to-transparent"></div>
                <div className="absolute top-4 left-4 flex flex-wrap gap-1.5 z-10">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-black/60 border border-white/10 text-brand-gold px-3 py-1 rounded-full backdrop-blur-md">
                    {card.type}
                  </span>
                  <span className="text-[10px] font-bold bg-black/60 border border-white/10 text-brand-green px-3 py-1 rounded-full backdrop-blur-md flex items-center gap-0.5">
                    ★ {card.rating}
                  </span>
                  {card.videoUrl && (
                    <span className="text-[10px] font-bold bg-brand-gold text-dark-bg px-2.5 py-1 rounded-full backdrop-blur-md flex items-center gap-1">
                      🎥 Видео
                    </span>
                  )}
                </div>
                <div className="absolute bottom-4 left-4 text-xs font-mono font-medium text-white/80 bg-black/50 border border-white/5 px-2.5 py-1 rounded-md backdrop-blur-sm">
                  📍 {card.location}
                </div>
              </div>

              {/* Card Body content */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5 animate-none">
                  <h3 className="text-lg font-light text-white group-hover:text-brand-gold transition-colors line-clamp-2">
                    {card.title}
                  </h3>
                  <p className="text-xs text-white/50 leading-relaxed font-light line-clamp-2">
                    {card.desc}
                  </p>
                </div>

                {/* Date and Views/Bookings Stats info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-white/50">
                    <Calendar className="h-3.5 w-3.5 text-brand-gold shrink-0" />
                    <span>Дата: <strong className="text-white font-medium">{card.date}</strong></span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-white/40 bg-white/[0.02] border border-white/[0.05] p-2 rounded-xl">
                    <span className="flex items-center gap-1" title="Просмотры">
                      <Eye className="h-3.5 w-3.5 text-white/30 shrink-0" />
                      <span>{card.viewsCount ?? 0}</span>
                    </span>
                    <span className="flex items-center gap-1" title="Использовано">
                      <Check className="h-3.5 w-3.5 text-brand-green shrink-0" />
                      <span>Использовано: <strong className="text-white/60 font-semibold">{card.bookingsCount ?? 0} раз</strong></span>
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <div className="text-left">
                    <span className="text-[10px] block text-white/35 uppercase">Координатор</span>
                    <span className="text-xs text-white/65 font-medium">{card.author}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] block text-white/35 uppercase">Стоимость</span>
                    <span className="text-base font-bold text-brand-gold font-mono">{card.priceLabel}</span>
                  </div>
                </div>
              </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="py-20 rounded-3xl border border-dashed border-white/10 text-center space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-white/30 mx-auto">
            <Compass className="h-6 w-6 animate-spin-slow" />
          </div>
          <h3 className="text-lg font-bold text-white/95">Ничего не найдено</h3>
          <p className="text-xs text-white/45 max-w-sm mx-auto">
            Попробуйте упростить фразу подбора или переключить категорию. У нас всегда много отличных предложений в наличии!
          </p>
          <button
            onClick={() => {
              handleQueryChangeLocal("");
              handleRegionChangeLocal("Все регионы");
              setDateFilter("Любые даты");
              setSelectedCategory("Все");
            }}
            id="clear-all-filters-link"
            className="text-xs text-brand-gold border-b border-brand-gold/35 pb-0.5 hover:text-brand-gold-hover transition-colors inline-block cursor-pointer font-semibold"
          >
            Сбросить фильтры
          </button>
        </div>
      )}
    </div>
  );
}
