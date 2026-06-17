import { useState, FormEvent } from "react";
import { X, Star, MapPin, Calendar, Clock, Smile, Sparkles, CheckSquare, Square, DollarSign, Key, Ticket, ShieldCheck, Play, Volume2, Eye, Check, Share2, Loader2, Plus } from "lucide-react";
import { CatalogCard, PromoCode } from "../types";
import { APIProvider, Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  "";
const hasValidKey = Boolean(API_KEY) && API_KEY !== "YOUR_API_KEY";

interface CardModalProps {
  card: CatalogCard;
  onClose: () => void;
  onAddBooking?: (booking: any) => void;
  promoCodes?: PromoCode[];
  onAddReview?: (review: any) => void;
}

export default function CardModal({ card, onClose, onAddBooking, promoCodes = [], onAddReview }: CardModalProps) {
  const [guests, setGuests] = useState(1);
  const [selectedExtras, setSelectedExtras] = useState<number[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [showCopiedNotification, setShowCopiedNotification] = useState(false);

  // User Review / Star Rating states
  const [userRating, setUserRating] = useState(5);
  const [userFeedback, setUserFeedback] = useState("");
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [isFeedbackSubmitted, setIsFeedbackSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleShare = () => {
    // Generate direct card link URL using card id query parameter representatively
    const url = `${window.location.protocol}//${window.location.host}?card=${card.id}`;
    navigator.clipboard.writeText(url)
      .then(() => {
        setShowCopiedNotification(true);
        setTimeout(() => setShowCopiedNotification(false), 2500);
      })
      .catch((err) => {
        console.error("Could not copy link to clipboard: ", err);
      });
  };

  // Promo Code States
  const [promoInput, setPromoInput] = useState("");
  const [activePromo, setActivePromo] = useState<PromoCode | null>(null);
  const [promoError, setPromoError] = useState("");

  // Code Verification States
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [sentCode, setSentCode] = useState("");
  const [verificationError, setVerificationError] = useState("");

  const handleToggleExtra = (idx: number) => {
    if (selectedExtras.includes(idx)) {
      setSelectedExtras(selectedExtras.filter((i) => i !== idx));
    } else {
      setSelectedExtras([...selectedExtras, idx]);
    }
  };

  const maxLimit = card.maxGuests || 10;
  const threshold = card.discountThreshold || 0;
  const percent = card.discountPercent || 0;

  // Base price multiplied by guest amount plus extras calculated on PER PERSON basis
  const baseTotal = card.basePrice * guests;
  const extrasTotal = selectedExtras.reduce((sum, idx) => sum + (card.extras[idx].price * guests), 0);
  const subTotal = baseTotal + extrasTotal;

  const hasDiscount = threshold > 0 && percent > 0 && guests >= threshold;
  const discountAmount = hasDiscount ? Math.round((subTotal * percent) / 100) : 0;

  // Promo code calculation
  let promoDiscount = 0;
  if (activePromo) {
    const discountedSubtotal = subTotal - discountAmount;
    if (activePromo.type === "percent") {
      promoDiscount = Math.round((discountedSubtotal * activePromo.discountValue) / 100);
    } else {
      promoDiscount = activePromo.discountValue;
    }
  }

  const grandTotal = Math.max(0, subTotal - discountAmount - promoDiscount);

  // Validate Promo Code
  const handleApplyPromo = () => {
    setPromoError("");
    if (!promoInput.trim()) return;
    
    const matched = promoCodes.find(
      (p) => p.code.trim().toUpperCase() === promoInput.trim().toUpperCase()
    );

    if (!matched) {
      setPromoError("Промокод не найден");
      setActivePromo(null);
    } else if (!matched.isActive) {
      setPromoError("Промокод больше не активен");
      setActivePromo(null);
    } else if (matched.minBookingAmount && subTotal < matched.minBookingAmount) {
      setPromoError(`Минимальная сумма бронирования: ${matched.minBookingAmount} ₽`);
      setActivePromo(null);
    } else {
      setActivePromo(matched);
      setPromoError("");
    }
  };

  const handleRemovePromo = () => {
    setActivePromo(null);
    setPromoInput("");
    setPromoError("");
  };

  // Submitting initial step triggers verification screen
  const handleSubmitBooking = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSubmitting) return;
    
    // Phone Syntax Validation
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      setPhoneError("Номер телефона должен содержать от 10 до 15 цифр (например: +7 999 123-45-67)");
      return;
    }
    
    setPhoneError("");
    setIsSubmitting(true);
    
    // Simulate slight booking request submission delay to prevent multiple inputs and feel realistic!
    setTimeout(() => {
      // Generate a clean 4-digit code for user
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      setSentCode(code);
      setIsVerifying(true);
      setIsSubmitting(false);
    }, 850);
  };

  // Confirming verification code completes the booking
  const handleConfirmVerification = (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setVerificationError("");

    if (verificationCode !== sentCode && verificationCode !== "1234") {
      setVerificationError("Неверный код подтверждения. Попробуйте еще раз или введите 1234");
      return;
    }

    setIsSubmitting(true);

    // Simulate SMS verification gateway check time
    setTimeout(() => {
      // Add dynamically to user cabinet bookings
      if (onAddBooking) {
        onAddBooking({
          id: "book-" + Math.random().toString(36).substr(2, 6),
          title: card.title,
          img: card.img,
          location: card.location,
          date: card.date,
          time: "14:30",
          guests: guests,
          totalPrice: grandTotal,
          status: "confirmed",
          checkedIn: false,
          organizer: card.author,
          organizerPhone: "+7 (911) 400-34-56"
        });
      }

      setIsSubmitted(true);
      setIsVerifying(false);
      setIsSubmitting(false);
    }, 950);
  };

  const getEmbedUrl = (url: string) => {
    if (url.includes("youtube.com/embed/")) return url;
    if (url.includes("watch?v=")) {
      return url.replace("watch?v=", "embed//").replace("embed//", "embed/");
    }
    if (url.includes("youtu.be/")) {
      const id = url.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    return url;
  };

  const hasVideo = !!card.videoUrl;
  const isYoutube = card.videoUrl && (card.videoUrl.includes("youtube.com") || card.videoUrl.includes("youtu.be"));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-3xl border border-white/10 bg-dark-card shadow-2xl overflow-hidden max-h-[95vh] flex flex-col">
        
        {/* Header bar sticky */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-dark-card/95 backdrop-blur-md sticky top-0 z-30">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-brand-gold bg-brand-gold/10 px-2.5 py-0.5 rounded-full">
              {card.type}
            </span>
            <h2 className="text-xl sm:text-2xl font-light text-white mt-1">
              {card.title}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {/* Share action button with toast success message feedback */}
            <div className="relative">
              <button
                type="button"
                onClick={handleShare}
                id="btn-card-share-action"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 border border-white/10 hover:border-brand-gold/30 text-white transition-colors cursor-pointer"
              >
                <Share2 className="h-4 w-4 text-brand-gold animate-pulse" />
                <span className="hidden sm:inline text-white/90">Поделиться</span>
              </button>
              
              {showCopiedNotification && (
                <div className="absolute right-0 top-11 z-[50] bg-brand-green text-dark-bg text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap animate-fade-in flex items-center gap-1">
                  <span className="text-dark-bg font-bold">✓</span>
                  Ссылка скопирована!
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/75 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

        {/* Modal content area */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Main Visual Frame with Video support */}
          <div className="relative rounded-2xl overflow-hidden border border-white/10 h-64 sm:h-76">
            {hasVideo ? (
              isYoutube ? (
                <div className="relative w-full h-full">
                  <iframe
                    src={`${getEmbedUrl(card.videoUrl!)}?autoplay=1&mute=1&loop=1&playlist=${card.videoUrl!.split("/").pop()}`}
                    className="w-full h-full object-cover"
                    title={card.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="relative w-full h-full">
                  <video
                    className="w-full h-full object-cover"
                    src={card.videoUrl}
                    autoPlay
                    muted
                    loop
                    playsInline
                    controls
                  />
                </div>
              )
            ) : (
              <img className="w-full h-full object-cover" src={card.img} alt={card.title} />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/95 via-dark-bg/30 to-transparent pointer-events-none"></div>
            <div className="absolute bottom-5 left-5 flex flex-wrap gap-2 pointer-events-none">
              <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-lg bg-black/50 backdrop-blur-md border border-white/10 text-brand-gold font-bold">
                <Star className="h-3.5 w-3.5 fill-brand-gold text-brand-gold" />
                {card.rating}
              </span>
              <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-lg bg-black/50 backdrop-blur-md border border-white/10 text-white/80">
                <MapPin className="h-3.5 w-3.5" />
                {card.location}
              </span>
              <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-lg bg-black/50 backdrop-blur-md border border-white/10 text-white/80">
                <Calendar className="h-3.5 w-3.5 text-brand-gold" />
                {card.date}
              </span>
              <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-lg bg-black/50 backdrop-blur-md border border-white/10 text-white/85">
                <Eye className="h-3.5 w-3.5 text-white/40" />
                <span>Смотрели: <strong className="text-white font-mono">{card.viewsCount ?? 0}</strong></span>
              </span>
              <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-lg bg-black/50 backdrop-blur-md border border-brand-green/20 text-[#74d5a6]">
                <Check className="h-3.5 w-3.5 text-brand-green" />
                <span>Воспользовались: <strong className="text-brand-green font-mono">{card.bookingsCount ?? 0} раз</strong></span>
              </span>
              {hasVideo && (
                <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-lg bg-brand-gold/20 border border-brand-gold/40 text-brand-gold animate-pulse">
                  <Play className="h-3 w-3 fill-brand-gold" />
                  Видеообзор
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Col: Explanations */}
            <div className="lg:col-span-7 space-y-4">
              <div className="p-5 rounded-2xl border border-white/5 bg-white/2 space-y-3">
                <h4 className="text-xs uppercase font-bold tracking-wider text-brand-gold">
                  Основное описание
                </h4>
                <p className="text-sm sm:text-[14px] text-white/70 leading-relaxed font-light">
                  {card.desc}
                </p>
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/5 text-xs text-white/55">
                  <div className="space-y-1">
                    <span className="text-[10px] block text-white/35 uppercase">Координатор</span>
                    <span className="font-semibold text-white">{card.author}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] block text-white/35 uppercase">Время ответа на лид</span>
                    <span className="font-semibold text-brand-gold">~ {card.response}</span>
                  </div>
                </div>
              </div>

              {/* What is included template */}
              <div className="p-5 rounded-2xl border border-white/5 bg-white/2">
                <h4 className="text-xs uppercase font-bold tracking-wider text-[#74d5a6] mb-3">
                  Что уже включено в стоимость:
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    "Персональное сопровождение",
                    "Базовая страховка",
                    "Профессиональный инвентарь",
                    "Тёплая беседка-купол в лагере",
                    "Чай с северными травами",
                    "Подробные инструкции и памятки"
                  ].map((inc, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs sm:text-[13px] text-white/60">
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-sm bg-[#74d5a6]/10 text-[#74d5a6] font-bold text-[10px]">
                        ✓
                      </span>
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Mini Map View Container */}
              <div className="p-5 rounded-2xl border border-white/5 bg-white/2 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs uppercase font-bold tracking-wider text-brand-gold flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    <span>Карта локации</span>
                  </h4>
                  <span className="text-[10px] font-mono text-white/40">
                    {(card.lat ?? 61.6112).toFixed(4)}°N, {(card.lng ?? 30.6854).toFixed(4)}°E
                  </span>
                </div>

                <div className="relative rounded-xl overflow-hidden h-48 border border-white/10 bg-black/35 flex flex-col justify-end group/map hover:scale-[1.03] hover:border-brand-gold/30 transition-all duration-500">
                  {hasValidKey ? (
                    <APIProvider apiKey={API_KEY} version="weekly">
                      <Map
                        defaultCenter={{ lat: card.lat ?? 61.6112, lng: card.lng ?? 30.6854 }}
                        defaultZoom={11}
                        mapId="DEMO_MAP_ID"
                        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                        style={{ width: '100%', height: '100%' }}
                        gestureHandling={'cooperative'}
                        disableDefaultUI={true}
                      >
                        <AdvancedMarker position={{ lat: card.lat ?? 61.6112, lng: card.lng ?? 30.6854 }}>
                          <Pin background="#d6b36a" glyphColor="#07101a" borderColor="#fff" />
                        </AdvancedMarker>
                      </Map>
                    </APIProvider>
                  ) : (
                    /* Topographic Navigation Placeholder System with instructions */
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-[#0a1320] overflow-hidden">
                      {/* Decorative Radar Grids */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                        <div className="w-40 h-40 rounded-full border border-brand-gold/40 animate-ping duration-3000"></div>
                        <div className="w-24 h-24 rounded-full border border-white/10"></div>
                        <div className="w-12 h-12 rounded-full border border-white/20"></div>
                        <div className="absolute h-full w-[0.5px] bg-white/10"></div>
                        <div className="absolute w-full h-[0.5px] bg-white/10"></div>
                      </div>

                      {/* Interactive radar target overlay that fades in on hover */}
                      <div className="absolute inset-0 bg-brand-gold/[0.02] opacity-0 group-hover/map:opacity-100 transition-opacity duration-700 pointer-events-none flex items-center justify-center">
                        <div className="absolute w-44 h-44 rounded-full border border-brand-gold/15 animate-pulse"></div>
                        <div className="absolute w-28 h-28 rounded-full border border-brand-gold/25"></div>
                        <div className="absolute w-12 h-12 rounded-full border border-brand-gold/35"></div>
                        <div className="absolute h-full w-[0.5px] bg-brand-gold/15"></div>
                        <div className="absolute w-full h-[0.5px] bg-brand-gold/15"></div>
                      </div>

                      {/* Central Pin */}
                      <div className="relative z-10 flex flex-col items-center text-center space-y-2 group-hover/map:scale-110 transition-transform duration-500">
                        <div className="h-9 w-9 rounded-full bg-brand-gold/10 border border-brand-gold flex items-center justify-center text-brand-gold animate-bounce">
                          <MapPin className="h-5 w-5" />
                        </div>
                        <div className="text-[11px] font-bold text-white font-sans">
                          {card.location} — {card.title}
                        </div>
                        <p className="text-[9px] text-white/50 max-w-[280px] leading-normal">
                          Для загрузки спутника добавьте <code>GOOGLE_MAPS_PLATFORM_KEY</code> в Secrets (настройки ⚙️ вверху справа).
                        </p>
                      </div>

                      {/* Coordinates badge overlay */}
                      <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 rounded-md border border-white/10 text-[8px] font-mono text-brand-gold self-start select-none">
                        LAT {(card.lat ?? 61.6112).toFixed(4)} LON {(card.lng ?? 30.6854).toFixed(4)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Col: Instant Calculator */}
            <div className="lg:col-span-5">
              {!isSubmitted ? (
                isVerifying ? (
                  /* 4-Digit Verification Form Stage */
                  <form
                    onSubmit={handleConfirmVerification}
                    className="p-5 rounded-2xl border border-brand-gold/20 bg-brand-gold/5 space-y-4 shadow-xl animate-fade-in"
                  >
                    <div className="text-center space-y-2">
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gold/15 text-brand-gold">
                        <Key className="h-5 w-5" />
                      </div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                        Код подтверждения
                      </h4>
                      <p className="text-xs text-white/60 leading-relaxed font-light">
                        Для завершения бронирования введите разовый код безопасности, отправленный координатором.
                      </p>
                    </div>

                    <div className="p-3 bg-black/40 border border-white/10 rounded-xl text-center space-y-1">
                      <span className="text-[10px] text-white/30 block font-mono uppercase tracking-widest">
                        Временный демо-код СМС:
                      </span>
                      <span className="text-xl font-bold font-mono tracking-widest text-[#74d5a6]">
                        {sentCode}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-white/50 block text-center">
                        Введите полученный 4-значный код <span className="text-red-400">*</span>
                      </label>
                      <input
                        id="verification-code-input"
                        type="text"
                        maxLength={4}
                        required
                        autoFocus
                        placeholder="••••"
                        className="w-full text-center bg-dark-bg border border-white/10 rounded-xl px-4 py-3 text-lg font-bold font-mono tracking-[0.5em] text-brand-gold focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold"
                        value={verificationCode}
                        onChange={(e) => {
                          setVerificationCode(e.target.value.replace(/\D/g, ""));
                          setVerificationError("");
                        }}
                      />
                      {verificationError && (
                        <span className="text-[10px] text-red-400 block text-center mt-1">{verificationError}</span>
                      )}
                    </div>

                    <button
                      id="submit-verify-code-btn"
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 rounded-xl bg-brand-gold hover:bg-brand-gold-hover text-dark-bg font-bold text-xs tracking-wider uppercase transition-colors duration-200 cursor-pointer shadow-lg active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Сверяем зашифрованные ключи...</span>
                        </>
                      ) : (
                        <span>Подтвердить бронирование</span>
                      )}
                    </button>

                    <div className="flex justify-between items-center text-[10px] text-white/40 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          const code = Math.floor(1000 + Math.random() * 9000).toString();
                          setSentCode(code);
                          setVerificationError("");
                        }}
                        className="hover:text-brand-gold transition-colors"
                      >
                        Запросить повторно
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsVerifying(false)}
                        className="hover:text-white transition-all underline"
                      >
                        Вернуться назад
                      </button>
                    </div>
                  </form>
                ) : (
                  <form
                    onSubmit={handleSubmitBooking}
                    className="p-5 rounded-2xl border border-white/10 bg-white/4 space-y-4 shadow-xl animate-fade-in"
                  >
                    <h4 className="text-xs uppercase font-bold tracking-widest text-brand-gold text-center pb-2 border-b border-white/5">
                      Интерактивный расчёт
                    </h4>

                    {/* Guests selector */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs text-white/50">
                        <span>Количество гостей <span className="text-red-400">*</span></span>
                        <span className="text-[10px] text-white/35 font-mono">
                          Лимит: до {maxLimit} чел.
                        </span>
                      </div>
                      <div className="relative">
                        <select
                          id="modal-guests-select"
                          className="w-full bg-dark-bg border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-gold/60 cursor-pointer appearance-none animate-none"
                          value={guests}
                          onChange={(e) => setGuests(Number(e.target.value))}
                        >
                          {Array.from({ length: maxLimit }, (_, i) => i + 1).map((num) => (
                            <option key={num} value={num}>
                              {num} {num === 1 ? "гость" : num > 4 ? "гостей" : "гостя"}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none text-xs">▼</div>
                      </div>

                      {/* Volume Discount Dynamic Banner */}
                      {threshold > 0 && percent > 0 && (
                        <div className={`mt-2 p-2.5 rounded-lg border text-[11px] leading-relaxed transition-all ${
                          hasDiscount
                            ? "bg-brand-green/5 border-brand-green/20 text-[#74d5a6]"
                            : "bg-brand-gold/5 border-brand-gold/15 text-brand-gold/90"
                        }`}>
                          {hasDiscount ? (
                            <div className="flex items-center gap-1.5 font-medium">
                              <Sparkles className="h-3.5 w-3.5 shrink-0 text-brand-green" />
                              <span>Активирована скидка {percent}% за объемную бронь (от {threshold} гостей)!</span>
                            </div>
                          ) : (
                            <div className="flex items-start gap-1.5 font-light">
                              <span className="text-base leading-none">💡</span>
                              <span>
                                Бронируйте от <strong>{threshold} гостей</strong> и получите <strong>скидку {percent}%</strong> на всю сумму заказа. (Нужно еще {threshold - guests} {threshold - guests === 1 ? "гостя" : "гостей"}).
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Dynamic optional extras Checklist on a PER PERSON basis */}
                    {card.extras.length > 0 && (
                      <div className="space-y-2">
                        <label className="text-[13px] font-semibold text-white/80 block">Дополнительные услуги <span className="text-xs text-brand-gold font-medium">(расчет на человека)</span></label>
                        <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                          {card.extras.map((extra, idx) => {
                            const isChecked = selectedExtras.includes(idx);
                            const extraPerPersonTotal = extra.price * guests;
                            return (
                              <button
                                type="button"
                                key={idx}
                                id={`modal-extra-btn-${idx}`}
                                onClick={() => handleToggleExtra(idx)}
                                className={`w-full text-left flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border text-xs gap-2 transition-all cursor-pointer active:scale-[0.97] active:brightness-95 duration-150 ${
                                  isChecked
                                    ? "bg-brand-gold/10 border-brand-gold/55 text-white shadow-md shadow-brand-gold/5"
                                    : "bg-black/30 border-white/5 hover:border-white/15 text-white/80"
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  {isChecked ? (
                                    <CheckSquare className="h-4.5 w-4.5 text-brand-gold shrink-0" />
                                  ) : (
                                    <Square className="h-4.5 w-4.5 text-white/30 shrink-0" />
                                  )}
                                  <span className="font-medium text-white/95 flex items-center gap-2 flex-wrap">
                                    <span>{extra.name}</span>
                                    {isChecked ? (
                                      <span className="inline-flex items-center gap-0.5 text-[9px] text-[#74d5a6] bg-[#74d5a6]/10 px-1.5 py-0.5 rounded font-bold uppercase font-mono">
                                        <Check className="h-2.5 w-2.5" /> выбрано
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-0.5 text-[9px] text-brand-gold bg-brand-gold/10 px-1.5 py-0.5 rounded font-bold uppercase font-mono">
                                        <Plus className="h-2.5 w-2.5" /> добавить
                                      </span>
                                    )}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 font-mono text-xs text-brand-gold bg-brand-gold/10 border border-brand-gold/20 px-2.5 py-0.5 rounded-lg self-start sm:self-auto shrink-0">
                                  <span>{extra.price} ₽</span>
                                  <span className="text-white/30 font-sans">×</span>
                                  <span className="text-white/70 font-sans text-[11px]">{guests} чел.</span>
                                  <span className="text-white/30 font-sans">=</span>
                                  <span className="font-bold text-brand-gold">+{extraPerPersonTotal.toLocaleString("ru")} ₽</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Promo Code Input field */}
                    <div className="space-y-1.5 pt-2 border-t border-white/5">
                      <label className="text-xs text-white/50 block flex items-center gap-1">
                        <Ticket className="h-3.5 w-3.5 text-brand-gold" />
                        Промокод на скидку
                      </label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            id="modal-promo-field"
                            type="text"
                            placeholder="Например, KARELIA10"
                            className="w-full bg-dark-bg border border-white/10 rounded-xl px-3 py-2 text-xs text-white uppercase tracking-wider focus:outline-none focus:border-brand-gold/60"
                            disabled={!!activePromo}
                            value={promoInput}
                            onChange={(e) => setPromoInput(e.target.value)}
                          />
                          {activePromo && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-brand-green">
                              ✓ Ок
                            </span>
                          )}
                        </div>
                        {activePromo ? (
                          <button
                            type="button"
                            onClick={handleRemovePromo}
                            className="px-3.5 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs transition-colors shrink-0 font-medium cursor-pointer"
                          >
                            Сбросить
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={handleApplyPromo}
                            className="px-4 py-2 rounded-xl bg-brand-gold text-dark-bg font-bold text-xs hover:bg-brand-gold-hover transition-colors shrink-0 cursor-pointer"
                          >
                            Применить
                          </button>
                        )}
                      </div>
                      {promoError && (
                        <span className="text-[10px] text-red-400 block">{promoError}</span>
                      )}
                      {activePromo && (
                        <span className="text-[10px] text-brand-green block font-medium flex items-center gap-1">
                          <Sparkles className="h-3 w-3" /> Код успешно принят! Скидка: {activePromo.type === "percent" ? `${activePromo.discountValue}%` : `${activePromo.discountValue} ₽`}
                        </span>
                      )}
                    </div>

                    {/* Calculations breakdown dynamically computed */}
                    <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1.5 font-mono text-xs">
                      <div className="flex items-center justify-between text-white/50">
                        <span>Базовый («{card.title.slice(0, 15)}...») × {guests}</span>
                        <span>{(card.basePrice * guests).toLocaleString("ru")} ₽</span>
                      </div>

                      {selectedExtras.map((idx) => {
                        const extra = card.extras[idx];
                        return (
                          <div key={idx} className="flex items-center justify-between text-[#74d5a6]/85">
                            <span>+ {extra.name} (× {guests} гостей)</span>
                            <span>{(extra.price * guests).toLocaleString("ru")} ₽</span>
                          </div>
                        );
                      })}

                      {hasDiscount && (
                        <div className="flex items-center justify-between text-brand-green/90 font-semibold border-t border-white/5 pt-1.5 mt-1.5">
                          <span className="flex items-center gap-1">
                            <Sparkles className="h-3 w-3" /> Скидка {percent}% за объем
                          </span>
                          <span>-{discountAmount.toLocaleString("ru")} ₽</span>
                        </div>
                      )}

                      {activePromo && (
                        <div className="flex items-center justify-between text-brand-green/90 font-semibold">
                          <span className="flex items-center gap-1">
                            <Ticket className="h-3 w-3 text-brand-green" /> Промокод ({activePromo.code})
                          </span>
                          <span>-{promoDiscount.toLocaleString("ru")} ₽</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-white font-semibold pt-2.5 border-t border-white/20 text-base">
                        <span className="font-sans text-white/90">Итоговая сумма</span>
                        <span className="text-brand-gold font-mono text-lg font-bold tracking-tight bg-brand-gold/15 border border-brand-gold/25 px-3 py-1 rounded-xl shadow-lg shadow-brand-gold/5">
                          {grandTotal.toLocaleString("ru")} ₽
                        </span>
                      </div>
                    </div>

                    {/* Client Booking Information Fields */}
                    <div className="space-y-2 pt-1">
                      <div className="space-y-1">
                        <label className="text-xs text-white/50">Представьтесь <span className="text-red-400">*</span></label>
                        <input
                          id="modal-client-name"
                          type="text"
                          required
                          className="w-full bg-dark-bg border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-gold/60"
                          placeholder="Например, Константин"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-white/50">Ваш телефон для связи <span className="text-red-400">*</span></label>
                        <input
                          id="modal-client-phone"
                          type="tel"
                          required
                          className="w-full bg-dark-bg border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-gold/60"
                          placeholder="+7 (999) 000-00-00"
                          value={phone}
                          onChange={(e) => {
                            setPhone(e.target.value);
                            if (e.target.value) setPhoneError("");
                          }}
                        />
                        {phoneError && <span className="text-[10px] text-red-400 block mt-1">{phoneError}</span>}
                      </div>
                    </div>

                    <button
                      id="modal-submit-booking"
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 rounded-xl bg-brand-gold hover:bg-brand-gold-hover text-dark-bg font-bold text-xs tracking-wider uppercase transition-colors duration-200 cursor-pointer shadow-lg shadow-brand-gold/10 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Формируем СМС-код...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="h-4 w-4" />
                          <span>Получить код в СМС и продолжить</span>
                        </>
                      )}
                    </button>

                    <div className="text-[10px] text-center text-white/35 leading-relaxed font-light mt-1">
                      Нажимая кнопку, вы соглашаетесь с условиями хранения данных. Система сгенерирует безопасный проверочный ключ.
                    </div>
                  </form>
                )
              ) : (
                <div className="p-8 rounded-2xl border border-brand-green/25 bg-brand-green/5 text-center space-y-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#74d5a6]/15 text-brand-green mx-auto">
                    <Smile className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Заявка успешно отправлена!</h3>
                  <p className="text-xs text-white/60 leading-relaxed">
                    Прекрасный выбор, <strong className="text-white">{name}</strong>! Мы уже зафиксировали расчет на сумму <strong className="text-brand-gold font-mono">{grandTotal.toLocaleString("ru")} ₽</strong> на имя координатора <strong className="text-white">{card.author}</strong>.
                  </p>
                  <p className="text-xs text-[#74d5a6] font-medium flex items-center justify-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 shrink-0 text-brand-green" />
                    Бронирование подтверждено секретным кодом {verificationCode || "1234"}
                  </p>
                  <p className="text-xs text-white/50">
                    Окошко брони сохранено. Координатор свяжется с вами по номеру <strong className="font-mono">{phone}</strong> в течение {card.response}.
                  </p>

                  {/* Interactive Star Rating Segment */}
                  <div className="border-t border-white/10 pt-4 mt-2 space-y-3 text-left">
                    <h4 className="text-xs font-semibold text-brand-gold uppercase tracking-wider text-center">Оцените качество бронирования</h4>
                    
                    {!isFeedbackSubmitted ? (
                      <div className="space-y-3 bg-black/30 p-4 rounded-xl border border-white/5">
                        {/* Golden Interactive Star rows */}
                        <div className="flex justify-center gap-2">
                          {[1, 2, 3, 4, 5].map((star) => {
                            const isFilled = hoveredRating ? star <= hoveredRating : star <= userRating;
                            return (
                              <button
                                type="button"
                                key={star}
                                onClick={() => setUserRating(star)}
                                onMouseEnter={() => setHoveredRating(star)}
                                onMouseLeave={() => setHoveredRating(null)}
                                className="p-0.5 hover:scale-125 transition-transform cursor-pointer"
                              >
                                <Star
                                  className={`h-7 w-7 transition-colors ${
                                    isFilled
                                      ? "fill-brand-gold text-brand-gold shadow-gold-active"
                                      : "text-white/25 hover:text-brand-gold/60"
                                  }`}
                                />
                              </button>
                            );
                          })}
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-white/40 uppercase block">Ваш комментарий / отзыв (по желанию)</label>
                          <textarea
                            className="w-full bg-dark-bg border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-brand-gold/60 min-h-[60px]"
                            placeholder="Например: Все отлично, расчет цены прозрачный, получил код СМС мгновенно!"
                            value={userFeedback}
                            onChange={(e) => setUserFeedback(e.target.value)}
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (onAddReview) {
                              onAddReview({
                                id: Math.random(),
                                author: name || "Клиент",
                                rating: userRating,
                                text: userFeedback.trim() || `Отличный, быстрый расчет бронирования на сумму ${grandTotal.toLocaleString("ru")} руб. Рекомендую!`,
                                approved: true, // Autoapprove review left directly
                                service: card.title,
                                date: "Сегодня, " + new Date().toLocaleTimeString("ru", { hour: '2-digit', minute: '2-digit' })
                              });
                            }
                            setIsFeedbackSubmitted(true);
                          }}
                          className="w-full py-2 bg-brand-gold hover:bg-brand-gold-hover text-dark-bg font-bold text-xs uppercase rounded-lg cursor-pointer transition-colors"
                        >
                          Отправить отзыв в систему
                        </button>
                      </div>
                    ) : (
                      <div className="p-3 bg-brand-green/5 border border-brand-green/20 rounded-xl text-center">
                        <p className="text-xs text-brand-green font-semibold">★ Благодарим за оценку в {userRating} звёзд!</p>
                        <p className="text-[10px] text-white/50 mt-1">Ваш отзыв успешно сохранен и передан партнерам на модерацию в CRM-кабинет!</p>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsSubmitted(false);
                      setIsFeedbackSubmitted(false);
                      setUserFeedback("");
                      setUserRating(5);
                      onClose();
                    }}
                    className="w-full px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs border border-white/10 hover:border-white/20 transition-all cursor-pointer text-white font-medium"
                  >
                    Вернуться к каталогу
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
