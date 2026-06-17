import { useState, useEffect } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import ProblemBlock from "./components/ProblemBlock";
import SolutionBlock from "./components/SolutionBlock";
import AdvantagesBlock from "./components/AdvantagesBlock";
import HowItWorksBlock from "./components/HowItWorksBlock";
import CatalogBlock from "./components/CatalogBlock";
import FavoritesBlock from "./components/FavoritesBlock";
import CardModal from "./components/CardModal";
import SubmitBlock from "./components/SubmitBlock";
import DashboardBlock from "./components/DashboardBlock";
import ReviewsBlock from "./components/ReviewsBlock";
import FAQBlock from "./components/FAQBlock";
import FinalCTA from "./components/FinalCTA";
import Footer from "./components/Footer";
import PricingBlock from "./components/PricingBlock";
import BackgroundPattern from "./components/BackgroundPattern";
import KareliaMiniMap from "./components/KareliaMiniMap";
import KareliaTravelAI from "./components/KareliaTravelAI";
import AuthModal from "./components/AuthModal";
import UserCabinetBlock from "./components/UserCabinetBlock";
import { CatalogCard, PromoCode, PartnerLead } from "./types";
import { initialCards, initialLeads } from "./data";
import { Sparkles, Star, MapPin, Compass, Shield } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import AdminCabinetBlock from "./components/AdminCabinetBlock";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>(() => {
    return localStorage.getItem("onepoint-active-tab") || "dashboard";
  });
  const [selectedCategory, setSelectedCategory] = useState<string>("Все");
  const [mapRegionFilter, setMapRegionFilter] = useState("Все регионы");
  const [mapSearchQuery, setMapSearchQuery] = useState("");

  const handleMapRegionSelect = (location: string, searchStr?: string) => {
    setMapRegionFilter(location);
    setMapSearchQuery(searchStr || "");
    setSelectedCategory("Все"); // Reset categories to prevent conflicts
    setActiveTab("catalog");
    window.scrollTo({ top: 350, behavior: "smooth" });
  };

  const [selectedCard, setSelectedCard] = useState<CatalogCard | null>(null);

  // Keep track of activeTab in localStorage
  useEffect(() => {
    localStorage.setItem("onepoint-active-tab", activeTab);
  }, [activeTab]);

  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Forced Dark Theme Only
  const theme = "dark";
  const resolvedTheme = "dark";

  // Favorites State
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem("onepoint-favorites");
    try {
      return saved ? JSON.parse(saved) : [];
    } catch (_) {
      return [];
    }
  });

  // Cards State with LocalStorage persistence
  const [cards, setCards] = useState<CatalogCard[]>(() => {
    const saved = localStorage.getItem("onepoint-cards");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (_) {}
    }
    return initialCards;
  });

  useEffect(() => {
    localStorage.setItem("onepoint-favorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem("onepoint-cards", JSON.stringify(cards));
  }, [cards]);

  // Shared Promo Codes State
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(() => {
    const saved = localStorage.getItem("onepoint-promo-codes");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (_) {}
    }
    return [
      { code: "KARELIA10", discountValue: 10, type: "percent", isActive: true },
      { code: "WELCOME500", discountValue: 500, type: "fixed", isActive: true },
      { code: "MELNIKOVA15", discountValue: 15, type: "percent", isActive: true }
    ];
  });

  useEffect(() => {
    localStorage.setItem("onepoint-promo-codes", JSON.stringify(promoCodes));
  }, [promoCodes]);

  const toggleFavorite = (cardId: string) => {
    setFavorites((prev) =>
      prev.includes(cardId) ? prev.filter((id) => id !== cardId) : [...prev, cardId]
    );
  };

  // Auth & Session state
  const [userSession, setUserSession] = useState<{ name: string; email: string; phone: string; isPremium: boolean } | null>(() => {
    const saved = localStorage.getItem("onepoint-user-session");
    return saved ? JSON.parse(saved) : null;
  });

  const [partnerSession, setPartnerSession] = useState<{ company: string; email: string; level: string } | null>(() => {
    const saved = localStorage.getItem("onepoint-partner-session");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (_) {}
    }
    // Return default prefilled partner business account so it loads immediately with all info!
    return {
      company: "Karelia Outdoor",
      email: "partner@karelia-outdoor.ru",
      level: "Premium"
    };
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState<"user" | "partner">("user");

  // Dynamic state list of guest booked excursions/tours
  const [userBookings, setUserBookings] = useState<any[]>(() => {
    const saved = localStorage.getItem("onepoint-user-bookings");
    if (saved) return JSON.parse(saved);
    return [
      {
        id: "book-01",
        title: "Тур на квадроциклах к водопаду Белые Мосты",
        img: "https://images.unsplash.com/photo-1531804055935-76f44d7c3621?auto=format&fit=crop&w=600&q=80",
        location: "Питкяранта, Лесные ущелья Карелии",
        date: "9 июня 2026",
        time: "18:00",
        guests: 2,
        totalPrice: 14500,
        status: "confirmed",
        checkedIn: false,
        organizer: "Karelia Extreme",
        organizerPhone: "+7 (911) 441-22-33"
      },
      {
        id: "book-02",
        title: "Kanoe Trip по Ладожским Шхерам",
        img: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80",
        location: "Сортавала, Ладожское озеро",
        date: "18 июня 2026",
        time: "11:00",
        guests: 2,
        totalPrice: 11000,
        status: "confirmed",
        checkedIn: false,
        organizer: "Karelia Outdoor",
        organizerPhone: "+7 (911) 500-20-40"
      },
      {
        id: "book-03",
        title: "Дзен-йога ретрит на пирсе в лесу",
        img: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80",
        location: "Парк-отель Дача Винтера",
        date: "28 мая 2026",
        time: "08:30",
        guests: 1,
        totalPrice: 3200,
        status: "confirmed",
        checkedIn: false,
        organizer: "Yoga Karelia Association",
        organizerPhone: "+7 (921) 123-45-67"
      }
    ];
  });

  // Save changes to sessions & bookings to localStorage
  useEffect(() => {
    if (userSession) {
      localStorage.setItem("onepoint-user-session", JSON.stringify(userSession));
    } else {
      localStorage.removeItem("onepoint-user-session");
    }
  }, [userSession]);

  useEffect(() => {
    if (partnerSession) {
      localStorage.setItem("onepoint-partner-session", JSON.stringify(partnerSession));
    } else {
      localStorage.removeItem("onepoint-partner-session");
    }
  }, [partnerSession]);

  useEffect(() => {
    localStorage.setItem("onepoint-user-bookings", JSON.stringify(userBookings));
  }, [userBookings]);

  // Actions
  const handleLoginUser = (userData: { name: string; email: string; phone: string; isPremium: boolean }) => {
    setUserSession(userData);
    setPartnerSession(null); // exclusive login demo view
    setActiveTab("user-cabinet");
  };

  const handleLoginPartner = (partnerData: { company: string; email: string; level: string }) => {
    setPartnerSession(partnerData);
    setUserSession(null); // exclusive login demo view
    setActiveTab("dashboard");
  };

  const handleLogOutAll = () => {
    setUserSession(null);
    setPartnerSession(null);
    setActiveTab("home");
  };

  const handleCancelBooking = (bookingId: string) => {
    setUserBookings(prev => 
      prev.map(b => b.id === bookingId ? { ...b, status: "cancelled" } : b)
    );
  };

  const handleCheckInBooking = (bookingId: string) => {
    setUserBookings(prev =>
      prev.map(b => b.id === bookingId ? { ...b, checkedIn: true } : b)
    );
  };

  const [reviews, setReviews] = useState<any[]>(() => {
    const saved = localStorage.getItem("onepoint-reviews");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (_) {}
    }
    return [
      { id: 1, author: "Николай Д.", rating: 5, text: "Восторг! Капитан Андрей показал скрытый водопад, куда не ходят обычные катера. Рыбалка удалась!", approved: false, service: "Аренда моторной лодки", date: "Вчера, 14:20" },
      { id: 2, author: "Юлия Смирнова", rating: 4, text: "Очень красивый йога-класс на пирсе, но утренняя роса сделала коврики слегка влажными. В остальном превосходно.", approved: false, service: "Дзен-йога ретрит", date: "2 дня назад" },
      { id: 3, author: "Екатерина В.", rating: 5, text: "Прекрасный каяк-тур по шхерам! Виды неописуемые, гид очень заботливый. Обязательно вернемся ещё раз зимой!", approved: true, service: "Kanoe Trip по Ладожским Шхерам", date: "3 дня назад" }
    ];
  });

  useEffect(() => {
    localStorage.setItem("onepoint-reviews", JSON.stringify(reviews));
  }, [reviews]);

  const handleAddReview = (newReview: any) => {
    setReviews(prev => [newReview, ...prev]);
  };

  // Shared CRM Leads/Bookings State (for partner and booking sync)
  const [leadsList, setLeadsList] = useState<PartnerLead[]>(() => {
    const saved = localStorage.getItem("onepoint-leads-list");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (_) {}
    }
    return initialLeads;
  });

  useEffect(() => {
    localStorage.setItem("onepoint-leads-list", JSON.stringify(leadsList));
  }, [leadsList]);

  // Activity Log State
  const [activityLog, setActivityLog] = useState<any[]>(() => {
    const saved = localStorage.getItem("onepoint-activity-log");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (_) {}
    }
    const rightNow = Date.now();
    return [
      { id: "act-1", time: "09:30", type: "partner", text: "Регистрация нового партнёра: 'Karelia Outdoor'", severity: "success", timestamp: rightNow - 5 * 60 * 1000 },
      { id: "act-2", time: "09:22", type: "booking", text: "Создано бронирование на 'Kanoe Trip по Ладожским Шхерам' (Гостей: 2, Сумма: 11 000 ₽)", severity: "info", timestamp: rightNow - 25 * 60 * 1000 },
      { id: "act-3", time: "08:45", type: "tour", text: "Тур 'Фестиваль «Ладожские Волны»' обновлен партнером", severity: "warning", timestamp: rightNow - 3 * 3600 * 1000 },
      { id: "act-4", time: "08:15", type: "user", text: "Регистрация нового пользователя: baconjinenez5@gmail.com", severity: "success", timestamp: rightNow - 6 * 3600 * 1000 },
      { id: "act-5", time: "07:40", type: "system", text: "Новый отзыв отправлен на модерацию пользователем Николай Д.", severity: "info", timestamp: rightNow - 25 * 3600 * 1000 },
      { id: "act-6", time: "Вчера", type: "tour", text: "Создан новый экскурсионный маршрут 'Кижи под куполом'", severity: "info", timestamp: rightNow - 30 * 3600 * 1000 },
      { id: "act-7", time: "3 дня назад", type: "booking", text: "Оплачено бронирование №4514 (Сумма: 32 000 ₽)", severity: "success", timestamp: rightNow - 3.5 * 24 * 3600 * 1000 },
      { id: "act-8", time: "5 дней назад", type: "partner", text: "Регистрация партнёра 'Ладога Сап'", severity: "success", timestamp: rightNow - 5.5 * 24 * 3600 * 1000 }
    ];
  });

  useEffect(() => {
    localStorage.setItem("onepoint-activity-log", JSON.stringify(activityLog));
  }, [activityLog]);

  const addActivityEvent = (
    text: string, 
    type: "booking" | "user" | "partner" | "tour" | "system" = "system", 
    severity: "info" | "success" | "warning" = "info"
  ) => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0].substring(0, 5); // // HH:MM
    const newEvent = {
      id: "act-" + Date.now() + Math.random().toString(36).substring(2, 5),
      time: timeStr,
      type,
      text,
      severity,
      timestamp: Date.now()
    };
    setActivityLog(prev => [newEvent, ...prev]);
  };

  const handleAddBooking = (newBooking: any) => {
    setUserBookings(prev => [newBooking, ...prev]);
    
    // Add corresponding CRM lead immediately so it syncs to the Partner Dashboard
    const newLeadId = Date.now() + Math.floor(Math.random() * 1000);
    const buyerName = userSession?.name || newBooking.name || "Александр Григорьев";
    const buyerPhone = userSession?.phone || newBooking.phone || "+7 (911) 400-12-34";
    const buyerEmail = userSession?.email || newBooking.email || "alex.karelia@mail.ru";

    const newLead: PartnerLead = {
      id: newLeadId,
      name: buyerName,
      phone: buyerPhone,
      email: buyerEmail,
      service: newBooking.title,
      date: newBooking.date + " в " + newBooking.time,
      status: "new",
      guests: newBooking.guests || 2,
      amount: newBooking.totalPrice || 11000,
      source: "Сайт (Онлайн-бронирование)",
      comments: [
        { text: `Создана заявка на бронирование "${newBooking.title}" через онлайн-каталог.`, time: "только что", author: "Система" },
        { text: "Здравствуйте! Жду подтверждения нашего бронирования. Все ли в силе?", time: "только что", author: "Клиент" }
      ]
    };

    setLeadsList(prev => [newLead, ...prev]);

    // Track activity logs in real-time
    addActivityEvent(
      `Создано онлайн-бронирование на '${newBooking.title}' (Клиент: ${buyerName}, гостей: ${newBooking.guests || 2}, к оплате: ${newBooking.totalPrice.toLocaleString("ru")} ₽)`,
      "booking",
      "success"
    );

    // Optionally auto-login if they aren't logged in yet!
    if (!userSession) {
      setUserSession({
        name: "Александр Григорьев",
        email: "alex.karelia@mail.ru",
        phone: "+7 (911) 400-12-34",
        isPremium: true
      });
    }
  };

  return (
    <div
      className="min-h-screen relative flex flex-col font-sans transition-all duration-500 overflow-x-hidden theme-dark text-white"
      style={{ background: "radial-gradient(circle at 50% 0%, #0d1e33 0%, #07101a 80%)" }}
    >
      
      {/* Background Pattern illustration */}
      <BackgroundPattern theme={theme} />

      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        favoritesCount={favorites.length}
        userSession={userSession}
        partnerSession={partnerSession}
        onOpenAuth={(tab) => {
          setAuthInitialTab(tab);
          setIsAuthModalOpen(true);
        }}
        onLogOut={handleLogOutAll}
        featuredCard={cards.find(c => !c.hidden) || cards[0]}
        onCardSelect={(card) => setSelectedCard(card)}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-12">
        {activeTab === "home" && (
          <div className="space-y-12 animate-fade-in" id="app-view-home">
            {/* HERO BLOCK */}
            <Hero
              onCatalogClick={() => {
                setSelectedCategory("Все");
                setActiveTab("catalog");
              }}
              onSubmitClick={() => setActiveTab("submit")}
              onPricingClick={() => setActiveTab("pricing")}
            />

            {/* Quick Categories visual representation wrapper */}
            <section className="rounded-3xl border border-white/10 bg-dark-card/50 p-6 md:p-8 space-y-6">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-brand-gold">
                    Категории каталога
                  </span>
                  <h3 className="text-xl sm:text-2xl font-light text-white mt-1">
                    Специализированные разделы
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setSelectedCategory("Все");
                    setActiveTab("catalog");
                  }}
                  id="section-go-all-catalog"
                  className="text-xs font-semibold text-brand-gold border-b border-brand-gold/30 pb-0.5 hover:text-brand-gold-hover cursor-pointer"
                >
                  Все предложения каталога →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { name: "Мероприятия", desc: "Уникальные фестивали, йога-ретриты и праздники", count: 4, label: "Смотреть события", color: "from-amber-500/10 to-transparent", hoverColor: "group-hover:text-amber-400" },
                  { name: "Услуги", desc: "Профессиональные фотографы, VIP трансферы, гиды", count: 3, label: "Смотреть услуги", color: "from-brand-green/10 to-transparent", hoverColor: "group-hover:text-brand-green" },
                  { name: "Туры", desc: "Захватывающие каяк-круизы и горные эко-маршруты", count: 4, label: "Смотреть туры", color: "from-blue-500/10 to-transparent", hoverColor: "group-hover:text-blue-400" },
                  { name: "Инструкции", desc: "Гайды и мануалы по публикации ваших карточек", count: 1, label: "Смотреть мануалы", color: "from-purple-500/10 to-transparent", hoverColor: "group-hover:text-purple-400" }
                ].map((sec) => (
                  <div
                    key={sec.name}
                    onClick={() => {
                      setSelectedCategory(sec.name);
                      setActiveTab("catalog");
                    }}
                    id={`home-cat-card-${sec.name}`}
                    className={`group relative p-6 rounded-2xl border border-white/5 bg-gradient-to-br ${sec.color} hover:border-brand-gold/30 hover:bg-white/3 transition-all cursor-pointer`}
                  >
                    <div className="space-y-2">
                      <span className="text-[9px] font-mono font-bold tracking-wider text-white/30 block uppercase">
                        Найдено: {sec.count} предл.
                      </span>
                      <h4 className={`text-base font-semibold text-white ${sec.hoverColor} transition-colors`}>
                        {sec.name}
                      </h4>
                      <p className="text-xs text-white/50 leading-relaxed font-light min-h-[36px]">
                        {sec.desc}
                      </p>
                    </div>

                    <div className="mt-5 text-xs text-brand-gold group-hover:underline font-semibold font-mono">
                      {sec.label} »
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Interactive geographic map filter block */}
            <KareliaMiniMap onRegionSelect={handleMapRegionSelect} />

            {/* Travel AI customized itinerary generator companion */}
            <KareliaTravelAI />

            {/* PROBLEM BLOCK */}
            <ProblemBlock />

            {/* SOLUTION BLOCK */}
            <SolutionBlock />

            {/* ADVANTAGES BLOCK */}
            <AdvantagesBlock />

            {/* HOW IT WORKS */}
            <HowItWorksBlock />

            {/* Quick Preview of featured cards */}
            <section className="p-6 md:p-8 rounded-3xl border border-white/10 bg-dark-card/40 space-y-6">
              <div className="flex justify-between items-end gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#74d5a6]">
                    Лидеры просмотров
                  </span>
                  <h3 className="text-xl sm:text-2xl font-light text-white mt-1">
                    Популярное на этой неделе
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setSelectedCategory("Все");
                    setActiveTab("catalog");
                  }}
                  id="preview-go-catalog-btn"
                  className="text-xs font-bold text-brand-gold hover:text-brand-gold-hover border-b border-brand-gold/20 pb-0.5 cursor-pointer"
                >
                  Смотреть все карточки →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {initialCards.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedCard(item)}
                    id={`featured-home-card-${item.id}`}
                    className="group border border-white/10 rounded-2xl overflow-hidden bg-dark-card hover:border-brand-gold/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                  >
                    <div className="relative h-44 overflow-hidden select-none pointer-events-none">
                      <img className="w-full h-full object-cover" src={item.img} alt={item.title} />
                      <div className="absolute inset-0 bg-gradient-to-t from-dark-card to-transparent"></div>
                      <span className="absolute top-3 left-3 text-[10px] uppercase font-bold text-brand-gold bg-black/60 px-2 rounded-md border border-white/10">
                        {item.type}
                      </span>
                    </div>
                    <div className="p-4 space-y-3">
                      <h4 className="text-sm font-semibold text-white line-clamp-1 group-hover:text-brand-gold transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-xs text-white/50 leading-relaxed font-light line-clamp-2">
                        {item.desc}
                      </p>
                      <div className="flex justify-between items-center text-xs pt-2 border-t border-white/5 font-mono">
                        <span className="text-white/40">★ {item.rating}</span>
                        <span className="text-brand-gold font-bold">{item.priceLabel}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* CASES / PROOFS BLOCK */}
            <ReviewsBlock />

            {/* FAQ BLOCK */}
            <FAQBlock />

            {/* FINAL CTA BLOCK */}
            <FinalCTA
              onStartClick={() => {
                setActiveTab("submit");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              onPricingClick={() => {
                setActiveTab("pricing");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          </div>
        )}

        {activeTab === "catalog" && (
          <div className="animate-fade-in relative z-10" id="app-view-catalog">
            <CatalogBlock
              onCardSelect={(card) => setSelectedCard(card)}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
              cards={cards.filter(c => !c.hidden)}
              mapRegionFilter={mapRegionFilter}
              setMapRegionFilter={setMapRegionFilter}
              mapSearchQuery={mapSearchQuery}
              setMapSearchQuery={setMapSearchQuery}
            />
          </div>
        )}

        {activeTab === "favorites" && (
          <div className="animate-fade-in relative z-10" id="app-view-favorites">
            <FavoritesBlock
              favorites={favorites}
              toggleFavorite={toggleFavorite}
              onCardSelect={(card) => setSelectedCard(card)}
              onNavigateToCatalog={() => {
                setSelectedCategory("Все");
                setActiveTab("catalog");
              }}
              cards={cards.filter(c => !c.hidden)}
            />
          </div>
        )}

        {activeTab === "submit" && (
          <div className="animate-fade-in relative z-10" id="app-view-submit">
            <SubmitBlock />
          </div>
        )}

        {activeTab === "dashboard" && partnerSession && (
          <div className="animate-fade-in relative z-10" id="app-view-dashboard">
            <DashboardBlock 
              partnerSession={partnerSession} 
              setPartnerSession={setPartnerSession} 
              onUpgradeClick={() => setActiveTab("pricing")} 
              cards={cards}
              setCards={setCards}
              promoCodes={promoCodes}
              setPromoCodes={setPromoCodes}
              reviews={reviews}
              setReviews={setReviews}
              leadsList={leadsList}
              setLeadsList={setLeadsList}
              addActivityEvent={addActivityEvent}
            />
          </div>
        )}

        {activeTab === "admin" && (
          <div className="animate-fade-in relative z-10" id="app-view-admin">
            <AdminCabinetBlock
              cards={cards}
              setCards={setCards}
              reviews={reviews}
              setReviews={setReviews}
              activityLog={activityLog}
              setActivityLog={setActivityLog}
              addActivityEvent={addActivityEvent}
              leadsList={leadsList}
              setLeadsList={setLeadsList}
            />
          </div>
        )}

        {activeTab === "user-cabinet" && userSession && (
          <div className="animate-fade-in relative z-10" id="app-view-user-cabinet">
            <UserCabinetBlock
              userSession={userSession}
              onLogOut={handleLogOutAll}
              onNavigateToCatalog={() => setActiveTab("catalog")}
              userBookings={userBookings}
              onCancelBooking={handleCancelBooking}
              onCheckInBooking={handleCheckInBooking}
              onAddReview={handleAddReview}
              favorites={favorites}
              cards={cards.filter(c => !c.hidden)}
              toggleFavorite={toggleFavorite}
              onCardSelect={(card) => setSelectedCard(card)}
            />
          </div>
        )}

        {activeTab === "pricing" && (
          <div className="animate-fade-in relative z-10" id="app-view-pricing">
            <PricingBlock 
              partnerSession={partnerSession} 
              setPartnerSession={setPartnerSession} 
              setActiveTab={setActiveTab} 
            />
          </div>
        )}
      </main>

      {/* FOOTER */}
      <Footer setActiveTab={setActiveTab} setSelectedCategory={setSelectedCategory} />

      {/* Global checkout popup modal */}
      {selectedCard && (
        <CardModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          onAddBooking={handleAddBooking}
          promoCodes={promoCodes}
          onAddReview={handleAddReview}
        />
      )}

      {/* Dynamic Authentication portal modal */}
      {isAuthModalOpen && (
        <AuthModal
          onClose={() => setIsAuthModalOpen(false)}
          onLoginUser={handleLoginUser}
          onLoginPartner={handleLoginPartner}
          initialTab={authInitialTab}
        />
      )}

      {/* Floating Scroll to Top Action Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            key="scroll-top-btn"
            initial={{ opacity: 0, scale: 0.5, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 30 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            id="scroll-to-top-btn"
            className="fixed bottom-6 right-6 p-4 rounded-full bg-brand-gold text-[#07101a] shadow-2xl hover:scale-110 active:scale-95 hover:bg-brand-gold-hover transition-all z-50 cursor-pointer border border-white/20 flex items-center justify-center"
            title="Наверх"
          >
            <svg
              className="h-5.5 w-5.5 stroke-[3]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
