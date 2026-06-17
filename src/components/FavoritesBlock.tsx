import { Heart, Landmark, Compass, Trash2, Calendar, Eye, Check } from "lucide-react";
import { CatalogCard } from "../types";
import { initialCards } from "../data";

interface FavoritesBlockProps {
  favorites: string[];
  toggleFavorite: (id: string) => void;
  onCardSelect: (card: CatalogCard) => void;
  onNavigateToCatalog: () => void;
  cards?: CatalogCard[];
}

export default function FavoritesBlock({
  favorites,
  toggleFavorite,
  onCardSelect,
  onNavigateToCatalog,
  cards = []
}: FavoritesBlockProps) {
  // Filter cards to only those that are favorited
  const favoritedCards = cards.filter((card) => favorites.includes(card.id));

  return (
    <div className="space-y-8" id="favorites-block-container">
      {/* Header Board for Favorites */}
      <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-dark-card p-6 md:p-8 shadow-xl">
        {/* Background ambient gold nebula lighting */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/5 blur-3xl pointer-events-none rounded-full"></div>
        <img
          className="absolute inset-0 w-full h-full object-cover opacity-10 pointer-events-none select-none"
          src="https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=1400&q=80"
          alt="Избранные туры"
        />
        <div className="relative z-10 space-y-2">
          <span className="text-[10px] tracking-widest uppercase font-bold text-brand-gold flex items-center gap-1">
            <Heart className="h-3 w-3 text-brand-gold fill-brand-gold" />
            Ваша персональная подборка
          </span>
          <h2 className="text-2xl sm:text-3xl font-light text-white">
            Избранные впечатления
          </h2>
          <p className="text-xs text-white/50 max-w-xl font-light leading-relaxed">
            Здесь хранятся все мероприятия, услуги и эко-туры, которые вы добавили в закладки. Планируйте свое путешествие по Карелии и Ленобласти в один клик.
          </p>
        </div>
      </div>

      {favoritedCards.length > 0 ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Выбранные предложения ({favoritedCards.length})
            </h3>
            <button
              id="clear-all-favorites-btn"
              onClick={() => {
                if (window.confirm("Вы уверены, что хотите очистить весь список избранного?")) {
                  // toggle all favorites out
                  favoritedCards.forEach(c => toggleFavorite(c.id));
                }
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all cursor-pointer"
            >
              <Trash2 className="h-3 w-3" />
              <span>Очистить избранное</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoritedCards.map((card) => (
              <div
                key={card.id}
                onClick={() => onCardSelect(card)}
                className="group relative border border-white/10 rounded-[28px] overflow-hidden bg-dark-card shadow-lg hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[420px]"
              >
                {/* Heart toggle on the card */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(card.id);
                  }}
                  className="absolute top-4 right-4 z-20 p-2 rounded-full border border-white/10 bg-black/50 text-red-400 hover:scale-115 transition-all cursor-pointer backdrop-blur-md"
                  title="Убрать из избранного"
                >
                  <Heart className="h-4 w-4 fill-red-400 text-red-400" />
                </button>

                {/* Card visual frame */}
                <div className="relative h-56 w-full overflow-hidden select-none pointer-events-none shrink-0 border-b border-white/5">
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    src={card.img}
                    alt={card.title}
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-card via-black/10 to-transparent"></div>
                  <div className="absolute top-4 left-4 flex gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-black/60 border border-white/10 text-brand-gold px-3 py-1 rounded-full backdrop-blur-md">
                      {card.type}
                    </span>
                    <span className="text-[10px] font-bold bg-black/60 border border-white/10 text-brand-green px-3 py-1 rounded-full backdrop-blur-md flex items-center gap-0.5">
                      ★ {card.rating}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 text-xs font-mono font-medium text-white/80 bg-black/50 border border-white/5 px-2.5 py-1 rounded-md backdrop-blur-sm">
                    📍 {card.location}
                  </div>
                </div>

                {/* Card Body content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
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

                  <div className="pt-3 border-t border-white/5 flex items-center justify-between font-sans">
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
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Symmetrical empty state design */
        <div className="py-20 rounded-3xl border border-dashed border-white/10 text-center space-y-5 bg-white/[0.01]">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-white/30 mx-auto">
            <Heart className="h-6 w-6 text-brand-gold animate-pulse" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white/95">Список избранного пока пуст</h3>
            <p className="text-xs text-white/45 max-w-sm mx-auto leading-relaxed px-4">
              Сохраняйте понравившиеся туры, эко-отели и активные развлечения с помощью иконки сердца ♡. Вы сможете быстро вернуться к ним в любой момент!
            </p>
          </div>
          <button
            onClick={onNavigateToCatalog}
            id="fav-go-catalog-btn"
            className="px-6 py-2.5 rounded-full text-xs font-bold bg-brand-gold text-dark-bg hover:bg-brand-gold-hover active:scale-95 transition-all shadow-lg shadow-brand-gold/15 cursor-pointer font-semibold inline-flex items-center gap-2"
          >
            <Compass className="h-3.5 w-3.5" />
            <span>Перейти в Каталог</span>
          </button>
        </div>
      )}
    </div>
  );
}
