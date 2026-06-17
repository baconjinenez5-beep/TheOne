import { Sparkles, Compass, Plus, AreaChart, CircleDollarSign, UserCheck, Briefcase, LogOut, Heart, Shield } from "lucide-react";
import { motion } from "motion/react";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  favoritesCount?: number;
  userSession: { name: string; email: string; phone: string; isPremium: boolean } | null;
  partnerSession: { company: string; email: string; level: string } | null;
  onOpenAuth: (initialTab: "user" | "partner") => void;
  onLogOut: () => void;
  featuredCard?: any;
  onCardSelect?: (card: any) => void;
}

export default function Header({
  activeTab,
  setActiveTab,
  favoritesCount = 0,
  userSession,
  partnerSession,
  onOpenAuth,
  onLogOut,
  featuredCard,
  onCardSelect
}: HeaderProps) {
  return (
    <div className="sticky top-0 z-50 py-4 px-4 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-[28px] border border-white/10 bg-dark-bg/85 px-6 py-4 backdrop-blur-xl shadow-lg transition-colors">
          
          {/* Logo & Sub-tagging */}
          <div className="flex items-center justify-between gap-4 w-full lg:w-auto">
            <button
              onClick={() => setActiveTab("home")}
              className="group flex items-center gap-2 text-left cursor-pointer transition-transform duration-200 active:scale-95"
              id="nav-logo"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-gold to-brand-gold/60 text-dark-bg shadow-md shadow-brand-gold/10">
                <Sparkles className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <div className="font-sans text-sm font-bold tracking-widest uppercase text-white group-hover:text-brand-gold transition-colors duration-200">
                  The One Point
                </div>
                <div className="text-[10px] text-white/45 font-medium">
                  Платформа для Карелии и Ленобласти
                </div>
              </div>
            </button>

            {/* Mobile-Only quick signin or settings menu */}
            <div className="flex items-center gap-1.5 lg:hidden">
              <button
                onClick={() => onOpenAuth("user")}
                className="p-2 rounded-full bg-white/5 text-white/75 hover:text-white"
                title="Вход"
              >
                <UserCheck className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Navigation links - Desktop */}
          <nav className="hidden md:flex flex-wrap items-center gap-2">
            {[
              { id: "home", label: "Главная", icon: Sparkles },
              { id: "catalog", label: "Каталог", icon: Compass },
              { id: "favorites", label: "Избранное", icon: Heart },
              { id: "submit", label: "Подать объявление", icon: Plus },
              { id: "pricing", label: "Тарифы", icon: CircleDollarSign },
            ].map((tab) => {
              const IconComp = tab.icon;
              const isActive = activeTab === tab.id;
              const isFavs = tab.id === "favorites";
              return (
                <button
                  key={tab.id}
                  id={`nav-link-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-brand-gold text-dark-bg shadow-md shadow-brand-gold/15 scale-105"
                      : tab.id === "catalog"
                        ? "text-white/90 hover:text-white hover:scale-[1.05] hover:bg-white/10 hover:border-white/20 border border-transparent"
                        : "text-white/65 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5"
                  }`}
                >
                  <IconComp className={`h-3.5 w-3.5 ${isActive ? "text-dark-bg" : isFavs ? "text-red-400" : "text-brand-gold"}`} />
                  <span className={tab.id === "catalog" ? "font-bold text-white tracking-normal" : ""}>{tab.label}</span>
                  {isFavs && favoritesCount > 0 && (
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full leading-none scale-90 ${isActive ? "bg-dark-bg/25 text-dark-bg" : "bg-brand-gold text-dark-bg shadow"}`}>
                      {favoritesCount}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Conditional Tab for Guest Cabinet */}
            {userSession && (
              <button
                id="nav-link-user-cabinet"
                onClick={() => setActiveTab("user-cabinet")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
                  activeTab === "user-cabinet"
                    ? "bg-brand-green text-dark-bg shadow-md"
                    : "text-white/65 hover:text-white hover:bg-white/5"
                }`}
              >
                <UserCheck className="h-3.5 w-3.5 text-brand-green" />
                <span>Мои билеты</span>
              </button>
            )}

            {/* Conditional Tab for Partner CRM */}
            {partnerSession && (
              <button
                id="nav-link-dashboard"
                onClick={() => setActiveTab("dashboard")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
                  activeTab === "dashboard"
                    ? "bg-brand-gold text-dark-bg shadow-md"
                    : "text-white/65 hover:text-white hover:bg-white/5"
                }`}
              >
                <AreaChart className="h-3.5 w-3.5 text-brand-gold" />
                <span>Кабинет ({partnerSession.company})</span>
              </button>
            )}

            {/* Admin Panel Link */}
            <button
              id="nav-link-admin"
              onClick={() => setActiveTab("admin")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
                activeTab === "admin"
                  ? "bg-red-500 text-white shadow-md font-bold scale-105"
                  : "text-white/65 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5"
              }`}
            >
              <Shield className="h-3.5 w-3.5 text-red-400" />
              <span>Админ-панель</span>
            </button>
          </nav>

          {/* Sign In Buttons Row */}
          <div className="flex flex-wrap items-center gap-3 justify-center">
            
            {/* Logins States Action triggers */}
            {!userSession && !partnerSession ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onOpenAuth("user")}
                  id="header-open-auth-user"
                  className="px-3 py-1.5 sm:px-4 sm:py-2.5 rounded-full text-xs font-bold bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <UserCheck className="h-3.5 w-3.5 text-brand-green" />
                  Гость
                </button>
                <button
                  onClick={() => onOpenAuth("partner")}
                  id="header-open-auth-partner"
                  className="px-3 py-1.5 sm:px-4 sm:py-2.5 rounded-full text-xs font-bold bg-brand-gold text-dark-bg hover:bg-brand-gold-hover shadow-lg shadow-brand-gold/15 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Briefcase className="h-3.5 w-3.5" />
                  Партнёр
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-white/5 border border-white/5 rounded-full py-1 px-3">
                <div className="text-left font-sans mr-1">
                  <div className="text-[10px] text-white/40 uppercase font-bold tracking-wider leading-none">
                    {userSession ? "Гость" : "Организатор"}
                  </div>
                  <div className="text-xs font-semibold text-white leading-tight">
                    {userSession ? userSession.name.split(" ")[0] : partnerSession?.company}
                  </div>
                </div>

                {/* Switch shortcut */}
                <button
                  onClick={() => {
                    if (userSession) {
                      setActiveTab("user-cabinet");
                    } else {
                      setActiveTab("dashboard");
                    }
                  }}
                  className="px-2.5 py-1 bg-black/30 hover:bg-black/50 text-[9px] text-brand-gold rounded-full font-bold uppercase transition-colors"
                >
                  Кабинет
                </button>

                <button
                  onClick={onLogOut}
                  className="p-1.5 rounded-full hover:bg-red-400/20 text-red-400 transition-colors"
                  title="Выйти из аккаунта"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Breadcrumb Trail */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          onClick={() => {
            if (featuredCard && onCardSelect) {
              onCardSelect(featuredCard);
            }
          }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] text-white/40 mt-3 px-6 select-none font-mono tracking-widest uppercase cursor-pointer hover:bg-white/2 p-2 rounded-xl border border-dashed border-white/5 transition-all duration-300"
        >
          <div className="flex items-center gap-2">
            <span className="hover:text-brand-gold cursor-pointer transition-colors" onClick={(e) => { e.stopPropagation(); setActiveTab("home") }}>theonepoint</span>
            {activeTab !== "home" && (
              <>
                <span className="text-white/20">/</span>
                <span className="text-brand-gold/80 font-semibold">
                  {activeTab === "catalog" && "каталог"}
                  {activeTab === "favorites" && "избранное"}
                  {activeTab === "submit" && "подать объявление"}
                  {activeTab === "pricing" && "тарифные планы"}
                  {activeTab === "user-cabinet" && "билеты отдыхающего"}
                  {activeTab === "dashboard" && "панель партнера"}
                </span>
              </>
            )}
          </div>

          {featuredCard && (
            <div className="flex items-center gap-1.5 text-brand-gold font-sans font-bold normal-case text-xs animate-pulse bg-brand-gold/10 px-2.5 py-0.5 rounded-full border border-brand-gold/20 hover:bg-brand-gold/20 transition-all select-none">
              <span className="text-[10px] text-white/45">⭐ ПОПУЛЯРНОЕ:</span>
              <span className="underline truncate max-w-[150px] sm:max-w-[250px]">{featuredCard.title}</span>
            </div>
          )}
        </motion.div>

        {/* Navigation links - Mobile view */}
        <div className="flex md:hidden overflow-x-auto justify-start py-2 scrollbar-none gap-2 mt-2 px-1">
          {[
            { id: "home", label: "Главная" },
            { id: "catalog", label: "Каталог" },
            { id: "favorites", label: `Избранное${favoritesCount > 0 ? ` (${favoritesCount})` : ""}` },
            { id: "submit", label: "Подать" },
            { id: "pricing", label: "Тарифы" },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-link-mob-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`py-1.5 px-4 rounded-full text-[11px] font-bold tracking-wide shrink-0 transition-all duration-200 ${
                  isActive
                    ? "bg-brand-gold text-dark-bg"
                    : "bg-white/3 text-white/70 border border-white/5"
                }`}
              >
                {tab.label}
              </button>
            );
          })}

          {userSession && (
            <button
              onClick={() => setActiveTab("user-cabinet")}
              className={`py-1.5 px-4 rounded-full text-[11px] font-bold tracking-wide shrink-0 transition-all duration-200 ${
                activeTab === "user-cabinet" ? "bg-brand-green text-dark-bg" : "bg-white/3 text-brand-green/90 border border-white/5"
              }`}
            >
              Билеты
            </button>
          )}

          {partnerSession && (
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`py-1.5 px-4 rounded-full text-[11px] font-bold tracking-wide shrink-0 transition-all duration-200 ${
                activeTab === "dashboard" ? "bg-brand-gold text-dark-bg" : "bg-white/3 text-brand-gold border border-white/5"
              }`}
            >
              CRM КОРП
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

