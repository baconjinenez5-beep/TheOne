import { Compass, Sparkles, TrendingUp, Users, Clock, Flame } from "lucide-react";

interface HeroProps {
  onCatalogClick: () => void;
  onSubmitClick: () => void;
  onPricingClick: () => void;
}

export default function Hero({ onCatalogClick, onSubmitClick, onPricingClick }: HeroProps) {
  return (
    <section className="relative w-full rounded-[40px] overflow-hidden border border-white/10 bg-dark-card md:min-h-[460px] mb-8 shadow-xl">
      {/* Background Image with optimized parallax overlay */}
      <img
        className="absolute inset-0 w-full h-full object-cover opacity-30 select-none pointer-events-none"
        src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=80"
        alt="Карельская природа"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-dark-bg via-dark-bg/90 to-transparent"></div>

      {/* Content wrapper */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 p-6 sm:p-10 lg:p-14 items-center">
        {/* Texts side */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-gold/25 bg-brand-gold/10 px-4 py-1.5 text-xs text-brand-gold font-medium">
            <Sparkles className="h-3.5 w-3.5 animate-spin-slow text-brand-gold" />
            <span>Карелия • Ленобласть • Северо-Запад</span>
          </div>

          <h1 className="font-sans text-4xl sm:text-5xl lg:text-6xl font-light leading-[1.05] tracking-tight text-white">
            Каталог впечатлений {` `}
            <span className="font-semibold text-brand-gold block mt-1">под вашим контролем</span>
          </h1>

          <p className="text-sm sm:text-base leading-relaxed text-white/70 max-w-xl">
            Разместите туры, фотосессии, аренду или ретриты в оптимизированной витрине. Получайте чистые лиды прямо в CRM-кабинет партнёра без переплат за дорогой софт.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              id="hero-add-service"
              onClick={onSubmitClick}
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl text-xs font-bold bg-brand-gold text-dark-bg hover:bg-brand-gold-hover active:scale-95 transition-all cursor-pointer shadow-lg shadow-brand-gold/15"
            >
              <Sparkles className="h-4 w-4" />
              Добавить объявление
            </button>
            <button
              id="hero-go-catalog"
              onClick={onCatalogClick}
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl text-xs font-bold bg-white/5 hover:bg-white/10 border border-white/15 hover:border-white/20 text-white active:scale-95 transition-all cursor-pointer"
            >
              <Compass className="h-4 w-4 text-brand-gold" />
              Смотреть каталог
            </button>
            <button
              id="hero-go-pricing"
              onClick={onPricingClick}
              className="px-5 py-3.5 rounded-2xl text-xs font-bold text-white/50 hover:text-white transition-colors cursor-pointer"
            >
              Планы и тарифы
            </button>
          </div>
        </div>

        {/* Real-time stats grid side */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-4">
          {[
            {
              id: "stat-partners",
              label: "Активных партнёров",
              value: "280+",
              sub: "в Карелии и СЗФО",
              icon: Users,
            },
            {
              id: "stat-cards",
              label: "Объявлений в базе",
              value: "1 240",
              sub: "качественных карточек",
              icon: Flame,
            },
            {
              id: "stat-conv",
              label: "Средняя конверсия",
              value: "9.2%",
              sub: "из просмотра в лид",
              icon: TrendingUp,
            },
            {
              id: "stat-response",
              label: "Скорость ответа",
              value: "14 мин",
              sub: "через умный чат-бот",
              icon: Clock,
            },
          ].map((stat) => {
            const StatIcon = stat.icon;
            return (
              <div
                key={stat.id}
                id={`hero-card-${stat.id}`}
                className="group p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md transition-all duration-300 hover:border-brand-gold/30 hover:bg-white/8"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-white/40">
                    {stat.label}
                  </span>
                  <StatIcon className="h-4 w-4 text-brand-gold group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-2xl sm:text-3xl font-light font-mono text-brand-gold mt-3">
                  {stat.value}
                </div>
                <div className="text-[11px] text-white/45 mt-1">{stat.sub}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
