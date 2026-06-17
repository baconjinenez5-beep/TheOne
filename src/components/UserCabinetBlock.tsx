import React, { useState, useEffect } from "react";
import { Sparkles, Calendar, Compass, MapPin, Search, ArrowRight, Star, Heart, FileText, CheckCircle2, Ticket, QrCode, Download, ShieldCheck, CalendarPlus, Check, X, Info, Bell, AlertTriangle } from "lucide-react";
import { jsPDF } from "jspdf";
import { motion, AnimatePresence } from "motion/react";
import { CatalogCard } from "../types";

const translit = (str: string) => {
  const ru: Record<string, string> = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh', 'з': 'z',
    'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r',
    'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
    'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo', 'Ж': 'Zh', 'З': 'Z',
    'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R',
    'С': 'S', 'T': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'Kh', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Shch',
    'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya'
  };
  return str.split('').map(char => ru[char] || char).join('');
};

const SvgQrCode = ({ value, className = "h-16 w-16" }: { value: string; className?: string }) => {
  const getGrid = () => {
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      hash = value.charCodeAt(i) + ((hash << 5) - hash);
    }
    const grid: boolean[][] = [];
    const size = 15;
    for (let r = 0; r < size; r++) {
      grid[r] = [];
      for (let c = 0; c < size; c++) {
        const isTopLeft = r < 4 && c < 4;
        const isTopRight = r < 4 && c >= size - 4;
        const isBottomLeft = r >= size - 4 && c < 4;
        
        if (isTopLeft || isTopRight || isBottomLeft) {
          grid[r][c] = true;
        } else {
          const cellId = r * size + c;
          grid[r][c] = ((hash >> (cellId % 24)) & 1) === 1;
        }
      }
    }
    return grid;
  };
  
  const grid = getGrid();
  const size = 15;
  
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className={className} shapeRendering="crispEdges">
      <rect width={size} height={size} fill="white" />
      {grid.map((row, r) =>
        row.map((active, c) => {
          const isTopLeftLoc = r < 4 && c < 4;
          const isTopRightLoc = r < 4 && c >= size - 4;
          const isBottomLeftLoc = r >= size - 4 && c < 4;
          
          let fill = "black";
          if (isTopLeftLoc || isTopRightLoc || isBottomLeftLoc) {
            const innerLeft = (r === 1 && c === 1) || (r === 2 && c === 1) || (r === 1 && c === 2) || (r === 2 && c === 2);
            const innerRight = (r === 1 && c === size-2) || (r === 2 && c === size-2) || (r === 1 && c === size-3) || (r === 2 && c === size-3);
            const innerBottom = (r === size-2 && c === 1) || (r === size-3 && c === 1) || (r === size-2 && c === 2) || (r === size-3 && c === 2);
            
            const outerLeft = r === 0 || r === 3 || c === 0 || c === 3;
            const outerRight = r === 0 || r === 3 || c === size-1 || c === size-4;
            const outerBottom = r === size-1 || r === size-4 || c === 0 || c === 3;
            
            if (innerLeft || innerRight || innerBottom || outerLeft || outerRight || outerBottom) {
              fill = "#0f2e1a";
            } else {
              fill = "transparent";
            }
          } else if (!active) {
            fill = "transparent";
          }
          
          return fill !== "transparent" ? (
            <rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" fill={fill} />
          ) : null;
        })
      )}
    </svg>
  );
};

interface UserBooking {
  id: string;
  title: string;
  img: string;
  location: string;
  date: string;
  time?: string;
  guests: number;
  totalPrice: number;
  status: "confirmed" | "pending" | "cancelled";
  checkedIn: boolean;
  organizer: string;
  organizerPhone: string;
}

interface UserCabinetBlockProps {
  userSession: {
    name: string;
    email: string;
    phone: string;
    isPremium: boolean;
  };
  onLogOut: () => void;
  onNavigateToCatalog: () => void;
  userBookings: UserBooking[];
  onCancelBooking: (id: string) => void;
  onCheckInBooking?: (id: string) => void;
  onAddReview?: (review: any) => void;
  favorites?: string[];
  cards?: CatalogCard[];
  toggleFavorite?: (cardId: string) => void;
  onCardSelect?: (card: CatalogCard) => void;
}

export default function UserCabinetBlock({
  userSession,
  onLogOut,
  onNavigateToCatalog,
  userBookings,
  onCancelBooking,
  onCheckInBooking,
  onAddReview,
  favorites,
  cards,
  toggleFavorite,
  onCardSelect,
}: UserCabinetBlockProps) {
  const [activeSubTab, setActiveSubTab] = useState<"tickets" | "favorites" | "history">("tickets");
  const [searchQuery, setSearchQuery] = useState("");

  // Live Reminders Toggle option from localStorage
  const [remindersEnabled, setRemindersEnabled] = useState<boolean>(() => {
    return localStorage.getItem("onepoint-reminders-enabled") === "true";
  });

  const handleToggleReminders = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.checked;
    setRemindersEnabled(val);
    localStorage.setItem("onepoint-reminders-enabled", String(val));
    if (val) {
      addToast("Напоминания о предстоящих поездках включены! За 24 часа вы получите СМС и push-уведомление.", "success");
    } else {
      addToast("Напоминания о поездках отключены в системе.", "info");
    }
  };

  // Toast System in UserCabinetBlock
  interface ToastItem {
    id: number;
    message: string;
    type: "info" | "success" | "warning" | "error";
  }
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (message: string, type: "info" | "success" | "warning" | "error" = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  // Resolved dynamic favorites & cards with strict localStorage fallbacks
  const resolvedFavoritesIds = favorites || (() => {
    const saved = localStorage.getItem("onepoint-favorites");
    try {
      return saved ? JSON.parse(saved) : [];
    } catch (_) {
      return [];
    }
  })();

  const resolvedCards = cards || (() => {
    const saved = localStorage.getItem("onepoint-cards");
    try {
      return saved ? JSON.parse(saved) : [];
    } catch (_) {
      return [];
    }
  })();

  const [localFavIds, setLocalFavIds] = useState<string[]>(resolvedFavoritesIds);

  useEffect(() => {
    if (favorites) {
      setLocalFavIds(favorites);
    }
  }, [favorites]);

  const handleToggleFavInner = (cardId: string) => {
    if (toggleFavorite) {
      toggleFavorite(cardId);
    } else {
      const updated = localFavIds.includes(cardId)
        ? localFavIds.filter(id => id !== cardId)
        : [...localFavIds, cardId];
      setLocalFavIds(updated);
      localStorage.setItem("onepoint-favorites", JSON.stringify(updated));
    }
    addToast("Список избранных мест успешно обновлен!", "success");
  };

  const favoriteCards = resolvedCards.filter((c) => localFavIds.includes(c.id));

  // Simulated live partner booking operations triggering high-fidelity toasts
  const simulatePartnerConfirm = () => {
    const activeUpcoming = userBookings.filter(b => b.status === "confirmed" && !isPast(b));
    const target = activeUpcoming[Math.floor(Math.random() * activeUpcoming.length)] || userBookings[0];
    if (target) {
      addToast(`[Выбор Партнера] Организатор "${target.organizer}" повторно подтвердил готовность трансфера к туру "${target.title}". Снаряжение подготовлено!`, "success");
    } else {
      addToast("У вас пока нет активных броней для проведения симуляции партнера.", "warning");
    }
  };

  const simulatePartnerCancel = () => {
    const upcoming = userBookings.filter(b => b.status === "confirmed" && !isPast(b));
    if (upcoming.length > 0) {
      const target = upcoming[0];
      onCancelBooking(target.id);
      addToast(`[Вызов Партнера] Бронирование "${target.title}" отменено туроператором из-за штормового предупреждения. Денежные средства зачислены на ваш баланс СБП.`, "warning");
    } else {
      addToast("Нет активных предстоящих поездок для проведения симуляции отмены.", "warning");
    }
  };
  
  // Interactive Live Scanner and QR Modal states
  const [scanningBooking, setScanningBooking] = useState<UserBooking | null>(null);
  const [isScanningSimulated, setIsScanningSimulated] = useState(false);
  const [scannedSuccess, setScannedSuccess] = useState(false);

  // Leave a Review Modal states
  const [reviewingBooking, setReviewingBooking] = useState<UserBooking | null>(null);
  const [selectedReviewRating, setSelectedReviewRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState<string>("");
  const [reviewedSuccessModal, setReviewedSuccessModal] = useState<boolean>(false);
  const [reviewedBookings, setReviewedBookings] = useState<string[]>(() => {
    const saved = localStorage.getItem("onepoint-reviewed-bookings");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (_) {}
    }
    return [];
  });

  // Persist reviewed booking ids
  useState(() => {
    localStorage.setItem("onepoint-reviewed-bookings", JSON.stringify(reviewedBookings));
  });

  const handleAddReviewedId = (bookingId: string) => {
    const updated = [...reviewedBookings, bookingId];
    setReviewedBookings(updated);
    localStorage.setItem("onepoint-reviewed-bookings", JSON.stringify(updated));
  };

  // Helper: check if a booking date/time is in the past
  const isPast = (booking: UserBooking) => {
    if (booking.checkedIn) return true;
    try {
      const parts = booking.date.toLowerCase().split(/\s+/);
      const day = parseInt(parts[0], 10);
      const year = parseInt(parts[2], 10) || 2026;
      
      const monthsRu: Record<string, number> = {
        "янв": 0, "фев": 1, "мар": 2, "апр": 3, "май": 4, "июн": 5, "июл": 6, "авг": 7, "сен": 8, "окт": 9, "ноя": 10, "дек": 11,
        "мая": 4, "июня": 5, "июля": 6, "августа": 7, "сентября": 8, "октября": 9, "ноября": 10, "декабря": 11
      };
      
      const monthWord = parts[1]?.substring(0, 4);
      let monthIndex = 5; // default June
      if (monthWord) {
        for (const [key, value] of Object.entries(monthsRu)) {
          if (monthWord.startsWith(key)) {
            monthIndex = value;
            break;
          }
        }
      }
      
      const bookingDate = new Date(year, monthIndex, day, 23, 59, 59);
      const today = new Date(); // June 9, 2026
      return bookingDate < today;
    } catch (e) {
      return false;
    }
  };

  // Helper: calculate total hours until start time
  const getHoursUntilBooking = (booking: UserBooking) => {
    try {
      const parts = booking.date.toLowerCase().split(/\s+/);
      const day = parseInt(parts[0], 10);
      const year = parseInt(parts[2], 10) || 2026;
      
      const monthsRu: Record<string, number> = {
        "янв": 0, "фев": 1, "мар": 2, "апр": 3, "май": 4, "июн": 5, "июл": 6, "авг": 7, "сен": 8, "окт": 9, "ноя": 10, "дек": 11,
        "мая": 4, "июня": 5, "июля": 6, "августа": 7, "сентября": 8, "октября": 9, "ноября": 10, "декабря": 11
      };
      
      const monthWord = parts[1]?.substring(0, 4);
      let monthIndex = 5; // default June
      if (monthWord) {
        for (const [key, value] of Object.entries(monthsRu)) {
          if (monthWord.startsWith(key)) {
            monthIndex = value;
            break;
          }
        }
      }
      
      let hourNum = 10;
      let minNum = 0;
      if (booking.time) {
        const timeParts = booking.time.split(":");
        hourNum = parseInt(timeParts[0], 10) || 10;
        minNum = parseInt(timeParts[1], 10) || 0;
      }
      
      const bookingDateTime = new Date(year, monthIndex, day, hourNum, minNum, 0);
      const now = new Date(); // June 9, 2026
      
      const diffMs = bookingDateTime.getTime() - now.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      return diffHours;
    } catch (e) {
      return 999;
    }
  };

  // Helper: Get Google Calendar Link
  const getGoogleCalendarUrl = (booking: UserBooking) => {
    const title = encodeURIComponent(`Эко-тур: ${booking.title}`);
    const description = encodeURIComponent(`Ваша поездка в Карелию с OnePoint. Локация: ${booking.location}. Организатор: ${booking.organizer} (${booking.organizerPhone}). Ждем вас!`);
    const location = encodeURIComponent(booking.location);
    
    const now = new Date();
    let startYear = now.getFullYear();
    let dayNum = 15;
    let monthIndex = 5;

    const monthsRu: Record<string, number> = {
      "янв": 0, "фев": 1, "мар": 2, "апр": 3, "май": 4, "июн": 5, "июл": 6, "авг": 7, "сен": 8, "окт": 9, "ноя": 10, "дек": 11,
      "мая": 4, "июня": 5, "июля": 6, "августа": 7, "сентября": 8, "октября": 9, "ноября": 10, "декабря": 11
    };
    
    const dateParts = booking.date.toLowerCase().split(/\s+/);
    if (dateParts[0]) {
      const d = parseInt(dateParts[0], 10);
      if (!isNaN(d)) dayNum = d;
    }
    if (dateParts[1]) {
      const monthWord = dateParts[1].substring(0, 4);
      for (const [key, value] of Object.entries(monthsRu)) {
        if (monthWord.startsWith(key)) {
          monthIndex = value;
          break;
        }
      }
    }
    const startDate = new Date(startYear, monthIndex, dayNum, 10, 0);
    const endDate = new Date(startYear, monthIndex, dayNum, 14, 0);
    
    const isoStart = startDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const isoEnd = endDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${isoStart}/${isoEnd}&details=${description}&location=${location}`;
  };

  // Helper: Download .ics calendar event file
  const downloadIcsFile = (booking: UserBooking) => {
    const title = `Eco-Tour: ${booking.title}`;
    const description = `Ваша поездка в Карелию. Локация: ${booking.location}. Участников: ${booking.guests} чел. Проверка бронирования по коду ON-${booking.id.toUpperCase()}. Организатор: ${booking.organizer} (${booking.organizerPhone}).`;
    const location = booking.location;
    
    const now = new Date();
    let startYear = now.getFullYear();
    let dayNum = 15;
    let monthIndex = 5;

    const monthsRu: Record<string, number> = {
      "янв": 0, "фев": 1, "мар": 2, "апр": 3, "май": 4, "июн": 5, "июл": 6, "авг": 7, "сен": 8, "окт": 9, "ноя": 10, "дек": 11,
      "мая": 4, "июня": 5, "июля": 6, "августа": 7, "сентября": 8, "октября": 9, "ноября": 10, "декабря": 11
    };
    
    const dateParts = booking.date.toLowerCase().split(/\s+/);
    if (dateParts[0]) {
      const d = parseInt(dateParts[0], 10);
      if (!isNaN(d)) dayNum = d;
    }
    if (dateParts[1]) {
      const monthWord = dateParts[1].substring(0, 4);
      for (const [key, value] of Object.entries(monthsRu)) {
        if (monthWord.startsWith(key)) {
          monthIndex = value;
          break;
        }
      }
    }
    const startDate = new Date(startYear, monthIndex, dayNum, 10, 0);
    const endDate = new Date(startYear, monthIndex, dayNum, 14, 0);
    
    const isoStart = startDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const isoEnd = endDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    const icsLines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//The One Point//Karelia//RU",
      "BEGIN:VEVENT",
      `UID:booking-${booking.id}@onepoint.karelia`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"}`,
      `DTSTART:${isoStart}`,
      `DTEND:${isoEnd}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${location}`,
      "END:VEVENT",
      "END:VCALENDAR"
    ];

    const blob = new Blob([icsLines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Karelia_Booking_${booking.id}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const simulateLiveScan = (bookingId: string) => {
    if (isScanningSimulated) return;
    setIsScanningSimulated(true);
    setScannedSuccess(false);

    // After 1.8 seconds of scanning line laser animation, complete the check-in!
    setTimeout(() => {
      if (onCheckInBooking) {
        onCheckInBooking(bookingId);
      }
      setScannedSuccess(true);
      setIsScanningSimulated(false);
      
      // Auto close after success
      setTimeout(() => {
        setScanningBooking(null);
        setScannedSuccess(false);
      }, 1500);
    }, 1800);
  };

  const handleDownloadTicket = (booking: UserBooking) => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a5"
    });

    // Outer Frame border in gold
    doc.setDrawColor(214, 179, 106);
    doc.setLineWidth(1);
    doc.rect(5, 5, 138, 200);

    // Decorative ticket header background block
    doc.setFillColor(7, 16, 26);
    doc.rect(6, 6, 136, 28, "F");

    // Title / branding
    doc.setTextColor(214, 179, 106);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("THE ONE POINT - KARELIA", 12, 17);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(116, 213, 166);
    doc.text("PARTNER ECO-TOURISM PROTOCOL & VERIFIED TICKET", 12, 24);

    // Booking Product Title (Transliterated for standard PDF safe characters)
    const translitTitle = translit(booking.title).toUpperCase();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    const wrappedTitle = doc.splitTextToSize(translitTitle, 120);
    doc.text(wrappedTitle, 12, 48);

    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.5);
    doc.line(10, 62, 138, 62);

    // Key value detail presentation
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text("Booking ID Reference:", 12, 72);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text(`ON-${booking.id.toUpperCase()}`, 55, 72);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text("Local Region Location:", 12, 82);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text(translit(booking.location), 55, 82);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text("Scheduled Date & Time:", 12, 92);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text(`${translit(booking.date)} (at ${booking.time || "10:00"})`, 55, 92);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text("Total Nominated Guests:", 12, 102);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text(`${booking.guests} Person(s)`, 55, 102);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text("Settled Transaction Price:", 12, 112);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 110, 50);
    doc.text(`${booking.totalPrice.toLocaleString("ru")} RUB (Settle Approved)`, 55, 112);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text("Host Operator Company:", 12, 122);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text(translit(booking.organizer), 55, 122);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text("Support Operator Tel:", 12, 132);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text(booking.organizerPhone, 55, 132);

    doc.setDrawColor(230, 230, 230);
    doc.line(10, 142, 138, 142);

    // Status Area
    doc.setFillColor(242, 247, 244);
    doc.rect(10, 148, 128, 14, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    if (booking.checkedIn) {
      doc.setTextColor(15, 120, 50);
      doc.text("VERIFIED STATUS: IN-REGISTRATION COMPLETED (SCAN OK)", 16, 157);
    } else {
      doc.setTextColor(214, 140, 10);
      doc.text("STATUS: RESERVED - CHECK IN VIA OPERATOR HOST SCANNED QR", 16, 157);
    }

    doc.setFont("helvetica", "italic");
    doc.setFontSize(7.5);
    doc.setTextColor(110, 110, 110);
    doc.text("Kindly present this barcode/QR proof on your phone or printed material upon entry.", 12, 172);

    // Dynamic simulated barcode graphics (guaranteed to render standard fonts cleanly!)
    let barcodeX = 14;
    doc.setFillColor(0, 0, 0);
    for (let i = 0; i < 48; i++) {
      const barW = (i % 5 === 0 ? 1.6 : (i % 3 === 0 ? 0.7 : 0.3));
      doc.rect(barcodeX, 180, barW, 10, "F");
      barcodeX += barW + 0.6;
    }
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(140, 140, 140);
    doc.text(`TICKET IDENTIFICATE KEY CODE: ON-${booking.id.toUpperCase()}`, 14, 194);
    doc.text("Powered by Antigravity Travel Engine", 90, 194);

    doc.save(`OnePoint_Ticket_${booking.id}.pdf`);
  };

  const filteredBookings = userBookings.filter((b) => {
    const past = isPast(b);
    if (activeSubTab === "tickets") {
      if (b.status === "cancelled" || past) return false;
    }
    if (activeSubTab === "history") {
      if (b.status !== "cancelled" && !past) return false;
    }
    
    return b.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
           b.location.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-8">
      {/* Header Profile Dashboard */}
      <div className="relative rounded-[32px] border border-white/10 bg-dark-card/50 p-6 sm:p-8 overflow-hidden">
        {/* Glow decorative circle */}
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-64 h-64 bg-brand-green/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex flex-wrap items-center gap-4.5">
            {/* Avatar block with initial */}
            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-green text-dark-bg font-bold text-2xl shadow-lg shadow-brand-green/20">
                {userSession.name[0]}
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-lg bg-teal-400 border border-dark-card text-[10px] text-dark-bg font-extrabold shadow animate-bounce">
                PRO
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-mono font-extrabold tracking-widest text-brand-green bg-brand-green/10 border border-brand-green/20 px-2 py-0.5 rounded-full">
                  РуссТуристо • Кабинет отдыхающего (B2C)
                </span>
                {userSession.isPremium && (
                  <span className="rounded-md bg-brand-gold/15 border border-brand-gold/30 px-2 py-0.5 text-[9px] font-extrabold text-brand-gold uppercase tracking-wider">
                    ★ Premium Клуб
                  </span>
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl font-light text-white">
                Привет, <span className="font-semibold text-brand-gold">{userSession.name}</span>!
              </h2>
              <div className="flex flex-wrap gap-x-4 gap-y-1 items-center text-xs text-white/50">
                <span className="font-mono">{userSession.email}</span>
                <span className="text-white/20">•</span>
                <span className="font-mono">{userSession.phone}</span>
              </div>

              {/* Reminders Preferences Checkbox layout */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={remindersEnabled}
                    onChange={handleToggleReminders}
                    id="traveler-reminders-toggle"
                  />
                  <div className="w-8 h-4 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-brand-gold"></div>
                  <span className="ml-2 text-[11px] font-semibold text-white/70 peer-checked:text-brand-gold flex items-center gap-1 transition-all cursor-pointer">
                    <Bell className="h-3 w-3 shrink-0" /> Включить автоматические СМС и push-напоминания о поездках
                  </span>
                </label>
                {remindersEnabled && (
                  <span className="text-[9px] font-mono text-brand-gold bg-brand-gold/10 px-1.5 py-0.5 rounded leading-none font-bold uppercase shrink-0">
                    Сохранено в localStorage
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2.5 shrink-0">
            <button
              onClick={onNavigateToCatalog}
              className="px-5 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wide cursor-pointer transition-all"
            >
              Искать новые туры →
            </button>
            <button
              onClick={onLogOut}
              className="px-4 py-3 rounded-xl bg-red-400/10 hover:bg-red-400/20 border border-red-400/20 text-red-400 font-bold text-xs uppercase tracking-wide cursor-pointer transition-all"
            >
              Выйти
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Tickets block + Right sidebar with status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Tickets and Tabs */}
        <div className="lg:col-span-8 space-y-6">
          {/* Sub Navigation */}
          <div className="flex overflow-x-auto gap-2 pb-2 border-b border-white/10 scrollbar-none select-none">
            {[
              { id: "tickets", label: "Мои билеты & брони", icon: Ticket, count: userBookings.filter(b => b.status !== "cancelled" && !isPast(b)).length },
              { id: "favorites", label: "Избранные места", icon: Heart, count: favoriteCards.length },
              { id: "history", label: "История и Отзывы", icon: FileText, count: userBookings.filter(b => b.status === "cancelled" || isPast(b)).length }
            ].map((subTab) => {
              const Icon = subTab.icon;
              const isActive = activeSubTab === subTab.id;
              return (
                <button
                  key={subTab.id}
                  onClick={() => setActiveSubTab(subTab.id as any)}
                  className={`flex items-center gap-2 px-4.5 py-3 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? "bg-brand-green text-dark-bg shadow-md shadow-brand-green/10"
                      : "bg-white/3 border border-white/5 text-white/70 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{subTab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? "bg-dark-bg/20 text-dark-bg font-extrabold" : "bg-white/10 text-white/50"}`}>
                    {subTab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Global Search Bar (for active, upcoming and historical bookings) */}
          {(activeSubTab === "tickets" || activeSubTab === "history") && (
            <div className="flex items-center gap-3 bg-white/3 border border-white/5 p-4 rounded-2xl">
              <Search className="h-4 w-4 text-white/30 shrink-0" />
              <input
                id="cabinet-global-search-input"
                type="text"
                className="bg-transparent border-none text-xs text-white placeholder-white/35 focus:outline-none w-full"
                placeholder={
                  activeSubTab === "tickets" 
                    ? "Быстрый поиск активных броней по названию или локации билета..."
                    : "Быстрый поиск в истории поездок и отзывов по названию или локации..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="text-white/40 hover:text-brand-green text-[10px] font-bold uppercase transition-all cursor-pointer whitespace-nowrap"
                  id="clear-cabinet-search-btn"
                >
                  Очистить
                </button>
              )}
            </div>
          )}

          {activeSubTab === "tickets" && (
            <div className="space-y-4 animate-fade-in">

              {filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => {
                  const hoursUntil = getHoursUntilBooking(booking);
                  const isSoon = hoursUntil >= 0 && hoursUntil <= 24;

                  return (
                    <motion.div
                      key={booking.id}
                      layoutId={`booking-card-${booking.id}`}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ type: "spring", stiffness: 220, damping: 25 }}
                      className={`group rounded-3xl border bg-dark-card overflow-hidden transition-all duration-350 flex flex-col sm:flex-row relative ${
                        isSoon 
                          ? "border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.12)] ring-1 ring-amber-500/25" 
                          : "border-white/10 hover:border-brand-green/35"
                      }`}
                    >
                      {/* Visual Card image left side */}
                      <div className="relative w-full sm:w-48 h-40 shrink-0 bg-black overflow-hidden select-none">
                        <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={booking.img} alt={booking.title} />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent sm:from-transparent"></div>
                        
                        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
                          {isSoon && (
                            <span className="text-[9px] uppercase font-extrabold text-dark-bg bg-brand-gold px-2 py-0.5 rounded shadow-md flex items-center gap-1 animate-pulse">
                              ⏰ СКОРО (МЕНЕЕ 24Ч)
                            </span>
                          )}
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={booking.checkedIn ? "checked" : "active"}
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.8, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              {booking.checkedIn ? (
                                <span className="text-[9px] uppercase font-bold text-dark-bg bg-[#74d5a6] px-2 py-0.5 rounded-md border border-[#74d5a6]/25 shadow flex items-center gap-1">
                                  <Check className="h-3 w-3" /> ИСПОЛЬЗОВАН
                                </span>
                              ) : (
                                <span className="text-[9px] uppercase font-bold text-dark-bg bg-brand-green px-2 py-0.5 rounded-md border border-brand-green/25 shadow flex items-center gap-1">
                                  <Sparkles className="h-3 w-3 text-dark-bg animate-pulse" /> АКТИВЕН
                                </span>
                              )}
                            </motion.div>
                          </AnimatePresence>
                          {booking.checkedIn && (
                            <motion.span
                              initial={{ opacity: 0, x: -5 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="text-[8px] uppercase font-semibold text-white bg-black/60 px-1.5 py-0.5 rounded-md border border-white/5 text-center"
                            >
                              CHECKED IN
                            </motion.span>
                          )}
                        </div>
  
                        {/* Display Programmatic QR Code mockup on image hover/corner */}
                        <div 
                          onClick={() => setScanningBooking(booking)}
                          className="absolute bottom-3 right-3 p-1 rounded-lg bg-white/95 border border-white shadow-xl flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-transform z-10" 
                          title="Нажмите, чтобы приблизить QR код билета для сканирования ИТ-партнером"
                        >
                          <SvgQrCode value={booking.id} className="h-10 w-10 text-dark-bg" />
                        </div>
                      </div>
  
                      {/* Content inside */}
                      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                        <div className="space-y-1.5 text-left">
                          <div className="flex items-center gap-2 text-[10px] text-brand-gold font-mono uppercase tracking-wider">
                            <MapPin className="h-3.5 w-3.5 text-brand-gold" />
                            <span>{booking.location}</span>
                          </div>
                          <h4 className="text-base font-semibold text-white group-hover:text-brand-green transition-colors">
                            {booking.title}
                          </h4>
                          
                          {isSoon && (
                            <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-xl text-[11px] text-amber-300 mt-2 font-light">
                              <span className="animate-ping inline-block w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                              <span>Внимание! Старт вашей поездки менее чем через 24 часа в <strong>{booking.time || "10:00"}</strong>. Рекомендуем выезжать заранее и подготовить билет.</span>
                            </div>
                          )}

                          <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1.5 text-xs text-white/50 font-mono">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-white/40" />
                              {booking.date} (в {booking.time || "10:00"})
                            </span>
                          <span>•</span>
                          <span>Гостей: {booking.guests} чел.</span>
                          <span>•</span>
                          <span className="text-brand-gold font-bold">{booking.totalPrice.toLocaleString("ru")} ₽</span>
                        </div>
                      </div>

                      {/* Organizer feedback coordinates & QR scanner block */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5">
                        <div className="text-[11px] text-white/40 font-light text-left">
                          Организатор: <span className="font-medium text-white/70">{booking.organizer}</span>
                          <span className="block font-mono text-[10px]">{booking.organizerPhone}</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => onCancelBooking(booking.id)}
                            className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-white/3 border border-white/5 hover:bg-red-400/10 hover:border-red-400/20 hover:text-red-400 text-white/60 cursor-pointer transition-all"
                          >
                            Отменить
                          </button>
                          
                          <button
                            onClick={() => handleDownloadTicket(booking)}
                            className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-brand-gold hover:bg-brand-gold-hover text-dark-bg cursor-pointer flex items-center gap-1 transition-all"
                            title="Скачать официальный PDF-билет поездки"
                          >
                            <Download className="h-3.5 w-3.5 shrink-0" />
                            <span>PDF Билет</span>
                          </button>

                          {/* Calendar Actions Dropdown/Buttons */}
                          <div className="flex items-center bg-black/20 border border-white/5 rounded-lg p-0.5">
                            <button
                              onClick={() => downloadIcsFile(booking)}
                              className="p-1 px-2 text-brand-gold hover:text-white hover:bg-white/5 rounded text-[10px] font-bold transition-all flex items-center gap-0.5 cursor-pointer font-mono"
                              title="Импортировать .ics файл в Outlook/Apple iCal"
                            >
                              <CalendarPlus className="h-3 w-3" />
                              <span>.ICS</span>
                            </button>
                            <span className="text-white/10 text-xs px-0.5">|</span>
                            <a
                              href={getGoogleCalendarUrl(booking)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 px-2 text-brand-green hover:text-white hover:bg-white/5 rounded text-[10px] font-bold transition-all flex items-center gap-0.5 cursor-pointer font-mono"
                              title="Занести это событие напрямую в ваш Google Календарь"
                            >
                              <Calendar className="h-3 w-3" />
                              <span>GOOGLE</span>
                            </a>
                          </div>

                          {/* Trigger nice virtual receipt / ticket display */}
                          <div 
                            onClick={() => setScanningBooking(booking)}
                            className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider border px-3 py-1.5 rounded-lg select-none cursor-pointer transition-all ${
                              booking.checkedIn 
                                ? "text-brand-green bg-brand-green/10 border-brand-green/30" 
                                : "text-white/45 bg-white/3 border-white/5 hover:text-brand-green hover:bg-white/5"
                            }`}
                            title="Нажмите, чтобы открыть QR-пропуск на сканирование"
                          >
                            <QrCode className={`h-4 w-4 shrink-0 ${booking.checkedIn ? "text-brand-green animate-none" : "text-white/40 animate-pulse"}`} />
                            <span>{booking.checkedIn ? "Зачекинен" : `Чекин`}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
              ) : (
                <div className="text-center py-10 rounded-2xl border border-dashed border-white/10 bg-white/2">
                  <Ticket className="h-10 w-10 text-brand-green/30 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-white/80">Билеты не обнаружены</p>
                  <p className="text-xs text-white/45 mt-1 max-w-xs mx-auto">
                    Выполните бронирование любого тура в Карелию из нашего каталога, чтобы билет появился здесь!
                  </p>
                </div>
              )}
            </div>
          )}

          {activeSubTab === "favorites" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono tracking-wider text-white/40 uppercase block">Мои избранные туры («РуссТуристо»)</span>
                <button 
                  onClick={onNavigateToCatalog}
                  className="text-xs text-brand-gold hover:text-brand-gold-hover hover:underline cursor-pointer font-semibold"
                >
                  Все предложения каталога →
                </button>
              </div>

              {favoriteCards.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
                  {favoriteCards.map((card) => (
                    <div key={card.id} className="rounded-[24px] overflow-hidden border border-white/10 bg-dark-card group hover:border-brand-gold/25 transition-all text-left flex flex-col justify-between">
                      <div className="h-32 relative overflow-hidden select-none">
                        <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" src={card.img} alt={card.title} />
                        <span className="absolute top-2.5 right-2.5 bg-brand-gold text-dark-bg text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider shadow">
                          {card.type}
                        </span>
                        
                        {/* Favorite button toggle */}
                        <button
                          onClick={() => handleToggleFavInner(card.id)}
                          className="absolute top-2.5 left-2.5 p-1.5 rounded-lg bg-black/60 hover:bg-black/90 text-red-400 hover:text-white transition-all cursor-pointer border border-white/5"
                          title="Удалить из избранного"
                        >
                          <Heart className="h-3.5 w-3.5 fill-current" />
                        </button>
                      </div>

                      <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] text-brand-gold font-mono block uppercase">{card.location}</span>
                          <h5 className="text-sm font-semibold text-white leading-snug line-clamp-2 mt-0.5">{card.title}</h5>
                          <p className="text-[11px] text-white/50 leading-relaxed font-light mt-1 line-clamp-2">{card.desc}</p>
                        </div>

                        <div className="flex justify-between items-center text-[12px] pt-3 border-t border-white/5 mt-3">
                          <span className="text-brand-gold font-bold font-mono">{card.priceLabel || `${card.basePrice.toLocaleString("ru")} ₽`}</span>
                          <button
                            onClick={() => {
                              if (onCardSelect) {
                                onCardSelect(card);
                              } else {
                                onNavigateToCatalog();
                              }
                            }}
                            className="px-3.5 py-1.5 bg-brand-gold/10 hover:bg-brand-gold text-brand-gold hover:text-dark-bg transition-colors rounded-lg text-[10px] font-bold uppercase tracking-wider font-sans cursor-pointer whitespace-nowrap"
                          >
                            Забронировать »
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 rounded-2xl border border-dashed border-white/10 bg-white/2">
                  <Heart className="h-10 w-10 text-red-500/35 mx-auto mb-3 animate-pulse" />
                  <p className="text-sm font-semibold text-white/80">Список избранного пока пуст</p>
                  <p className="text-xs text-white/45 mt-1 max-w-xs mx-auto">
                    Изучите каталог приключений и нажмите на сердечко ★, чтобы добавить понравившееся в этот кабинет для быстрого выкупа!
                  </p>
                  <button 
                    onClick={onNavigateToCatalog}
                    className="mt-4 px-4 py-2 bg-brand-gold text-dark-bg font-bold text-[10px] uppercase rounded-lg hover:bg-brand-gold-hover transition-colors cursor-pointer"
                  >
                    Перейти в каталог туров
                  </button>
                </div>
              )}
            </div>
          )}

          {activeSubTab === "history" && (
            <div className="space-y-3.5 animate-fade-in text-left">
              {filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => {
                  const past = isPast(booking);
                  const isCancelled = booking.status === "cancelled";
                  
                  if (isCancelled) {
                    return (
                      <div key={booking.id} className="p-4 rounded-xl border border-red-500/10 bg-red-500/3 flex items-center justify-between gap-4">
                        <div>
                          <h5 className="text-xs font-semibold text-white/90">{booking.title}</h5>
                          <span className="text-[10px] text-red-400/90 font-mono">Статус: Отменена пользователем • Возвращено по СБП</span>
                        </div>
                        <span className="text-xs font-mono text-white/30 font-bold">-{booking.totalPrice} ₽</span>
                      </div>
                    );
                  }
                  
                  const reviewed = reviewedBookings.includes(booking.id);
                  return (
                    <div key={booking.id} className="p-4.5 rounded-2xl border border-white/10 bg-dark-card/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <img src={booking.img} alt={booking.title} className="w-14 h-14 rounded-xl object-cover shrink-0 border border-white/10" />
                        <div>
                          <h5 className="text-xs font-semibold text-white/90 leading-snug">{booking.title}</h5>
                          <span className="text-[10px] text-brand-green font-semibold font-mono block mt-0.5">Статус: Завершено • Поездка состоялась</span>
                          <span className="text-[10px] text-white/40 block mt-0.5">{booking.date} • {booking.guests} {booking.guests === 1 ? 'гость' : 'гостя'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        <span className="text-xs font-mono text-white/80 font-bold mr-1">{booking.totalPrice.toLocaleString("ru")} ₽</span>
                        {reviewed ? (
                          <span className="px-3 py-1.5 rounded-lg border border-[#74d5a6]/20 bg-[#74d5a6]/5 text-[#74d5a6] text-[10px] uppercase font-bold flex items-center gap-1 font-mono">
                            <Check className="h-3.5 w-3.5" /> Отзыв оставлен
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedReviewRating(5);
                              setReviewText("");
                              setReviewedSuccessModal(false);
                              setReviewingBooking(booking);
                            }}
                            className="px-3 py-1.5 rounded-lg border border-brand-gold bg-brand-gold/10 hover:bg-brand-gold text-brand-gold hover:text-dark-bg text-[10px] uppercase font-bold transition-all cursor-pointer font-sans whitespace-nowrap"
                          >
                            Оставить отзыв
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10 rounded-xl bg-white/2 text-white/45 text-xs border border-dashed border-white/10">
                  Нет поездок в архивной истории. Совершите путешествие, чтобы написать отзыв!
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Informative Sidebar widgets */}
        <div className="lg:col-span-4 space-y-4 text-left">
          <div className="p-5 rounded-2xl border border-white/10 bg-dark-card/60 space-y-4">
            <h4 className="text-xs uppercase font-bold tracking-widest text-[#74d5a6] border-b border-white/5 pb-2">
              Ваш Статус Бонусов
            </h4>
            
            <div className="space-y-3 font-sans">
              <div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/60 font-light">Счет Кэшбэка</span>
                  <span className="font-bold font-mono text-brand-gold">1 250 баллов</span>
                </div>
                {/* Visual bar progress */}
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-1.5">
                  <div className="bg-brand-gold h-full rounded-full" style={{ width: "65%" }}></div>
                </div>
              </div>

              <p className="text-[10px] text-white/40 leading-relaxed font-light">
                Накапливайте кэшбэк 3% с каждого бронирования эко-туров в Карелии или Ленобласти. Оплачивайте баллами до 50% стоимости развлечений партнеров.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-white/10 bg-dark-card/60 space-y-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-400/10 text-teal-400">
              <CheckCircle2 className="h-4.5 w-4.5" />
            </div>
            <h5 className="text-xs font-semibold text-white">Умное страхование</h5>
            <p className="text-[11px] text-white/50 leading-relaxed font-light">
              Все туры, забронированные на платформе The One Point, автоматически застрахованы по страховому полису "АльфаКарелия" на сумму до 100 000 ₽. Спокойный отдых гарантирован.
            </p>
          </div>

          {/* Interactive B2B status update simulator card */}
          <div className="p-5 rounded-2xl border border-dashed border-brand-gold/35 bg-brand-gold/5 space-y-3.5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-1.5 bg-brand-gold/10 rounded-bl-xl text-[8px] font-mono font-bold tracking-wider text-brand-gold uppercase">
              Dev Mode ⚙️
            </div>

            <div className="flex items-center gap-1.5 pt-1">
              <Sparkles className="h-4.5 w-4.5 text-brand-gold" />
              <h5 className="text-xs font-bold text-white uppercase tracking-wider">Симулятор действий партнера</h5>
            </div>
            
            <p className="text-[10.5px] text-white/60 leading-relaxed font-light">
              Поскольку это интерактивный прототип, вы можете симулировать моментальные push-оповещения об изменении статуса вашей брони туроператорами:
            </p>

            <div className="space-y-2 pt-1">
              <button
                onClick={simulatePartnerConfirm}
                className="w-full py-2 px-3 bg-brand-green/20 hover:bg-brand-green border border-brand-green/35 hover:text-dark-bg text-brand-green font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                title="Отправить симулированное подтверждение поездки"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Эмулировать подтверждение</span>
              </button>

              <button
                onClick={simulatePartnerCancel}
                className="w-full py-2 px-3 bg-red-400/10 hover:bg-red-400 border border-red-400/25 hover:text-dark-bg text-red-400 font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                title="Эмулировать отмену тура со стороны гидов"
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>Эмулировать отмену тура</span>
              </button>
            </div>
            
            <div className="text-[9px] text-white/35 text-center font-mono font-medium block">
              При клике сработает система Toast-уведомлений
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic QR Code scanner and pass modal */}
      <AnimatePresence>
        {scanningBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-sm rounded-[32px] border border-white/10 bg-dark-card p-6 text-center shadow-2xl overflow-hidden font-sans text-white text-left"
            >
              {/* Animated backdrop glow */}
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-brand-green/10 rounded-full blur-2xl pointer-events-none" />

              <button
                onClick={() => {
                  setScanningBooking(null);
                  setIsScanningSimulated(false);
                  setScannedSuccess(false);
                }}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="space-y-4">
                <div className="text-center">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-brand-gold bg-brand-gold/10 px-2.5 py-1 rounded-full border border-brand-gold/20 inline-block">
                    Билетный QR-Код Пропуск
                  </span>
                  <h3 className="text-base font-medium mt-2 leading-snug line-clamp-1 px-4 text-white">
                    {scanningBooking.title}
                  </h3>
                  <p className="text-[11px] text-white/40 font-mono mt-1">
                    ID Референс: ON-{scanningBooking.id.toUpperCase()}
                  </p>
                </div>

                {/* QR code box with laser scanning line animation */}
                <div className="relative mx-auto w-48 h-48 bg-white p-4 rounded-2xl border border-white/25 shadow-xl flex items-center justify-center overflow-hidden select-none">
                  <SvgQrCode value={scanningBooking.id} className="w-full h-full text-black" />
                  
                  {/* Laser line simulator */}
                  {isScanningSimulated && (
                    <motion.div
                      initial={{ top: "0%" }}
                      animate={{ top: "100%" }}
                      transition={{
                        repeat: Infinity,
                        repeatType: "reverse",
                        duration: 1.2,
                        ease: "easeInOut"
                      }}
                      className="absolute left-0 right-0 h-1 bg-red-400 shadow-md shadow-red-400/80 z-20"
                    />
                  )}

                  {scannedSuccess && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute inset-0 bg-[#74d5a6] flex flex-col items-center justify-center p-4 text-center"
                    >
                      <CheckCircle2 className="h-12 w-12 text-dark-bg animate-bounce" />
                      <span className="text-xs font-extrabold text-dark-bg uppercase tracking-wide mt-2">
                        УСПЕШНО ЗАЧЕКИНЕН
                      </span>
                    </motion.div>
                  )}
                </div>

                {/* Simulated partner instructions */}
                <div className="bg-black/40 border border-white/5 p-3.5 rounded-2xl text-left text-xs space-y-2">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-brand-green shrink-0 mt-0.5" />
                    <p className="text-[11px] text-white/70 leading-relaxed font-light">
                      Предъявите этот QR-код гиду или администратору базы отдыха в Карелии при заезде для бесконтактной регистрации (check-in).
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  {!scanningBooking.checkedIn ? (
                    <button
                      onClick={() => simulateLiveScan(scanningBooking.id)}
                      disabled={isScanningSimulated}
                      className="w-full py-3 rounded-2xl bg-brand-green hover:bg-brand-green/90 text-dark-bg font-bold text-xs tracking-wider uppercase transition-all shadow-lg shadow-brand-green/10 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      {isScanningSimulated ? (
                        <>
                          <div className="h-3.5 w-3.5 border-2 border-dark-bg border-t-transparent rounded-full animate-spin" />
                          <span>Симуляция сканирования партнером...</span>
                        </>
                      ) : (
                        <>
                          <QrCode className="h-4 w-4" />
                          <span>Эмулировать Скан (Партнер РФ)</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="w-full py-2.5 rounded-2xl border border-brand-green/35 text-[#74d5a6] font-bold text-xs uppercase tracking-wider bg-brand-green/10 flex items-center justify-center gap-1">
                      <Check className="h-4 w-4" /> Гость успешно зарегистрирован!
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setScanningBooking(null);
                      setIsScanningSimulated(false);
                      setScannedSuccess(false);
                    }}
                    className="w-full py-2.5 rounded-2xl text-[10px] font-bold uppercase tracking-wider text-white/45 bg-white/3 hover:bg-white/5 transition-all cursor-pointer text-center"
                  >
                    Закрыть окно
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {reviewingBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-md rounded-[32px] border border-white/10 bg-dark-card p-6 shadow-2xl overflow-hidden font-sans text-white text-left"
            >
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-brand-gold/10 rounded-full blur-2xl pointer-events-none" />

              <button
                onClick={() => setReviewingBooking(null)}
                className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all cursor-pointer z-10"
              >
                <X className="h-4 w-4" />
              </button>

              {!reviewedSuccessModal ? (
                <div className="space-y-4 relative z-10">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#74d5a6] bg-[#74d5a6]/10 px-2.5 py-1 rounded-full border border-[#74d5a6]/20 inline-block font-mono">
                      Оставить отзыв о поездке
                    </span>
                    <h3 className="text-base font-bold mt-2 leading-snug text-white">
                      {reviewingBooking.title}
                    </h3>
                    <p className="text-[11px] text-white/50 font-sans mt-0.5">
                      Организатор: {reviewingBooking.organizer} • Поездка от {reviewingBooking.date}
                    </p>
                  </div>

                  {/* Star Rating Selector */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wide font-bold text-white/50 block font-mono">
                      Ваша оценка туру
                    </label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setSelectedReviewRating(star)}
                          className="p-1 hover:scale-110 active:scale-95 transition-all text-brand-gold cursor-pointer"
                        >
                          <Star
                            className="h-6 w-6 transition-all"
                            fill={selectedReviewRating >= star ? "var(--color-brand-gold, #ffb800)" : "transparent"}
                            stroke={selectedReviewRating >= star ? "var(--color-brand-gold, #ffb800)" : "rgba(255,255,255,0.3)"}
                          />
                        </button>
                      ))}
                      <span className="text-xs font-bold font-mono text-brand-gold ml-2.5">
                        {selectedReviewRating === 5 ? "Отлично! (5/5)" :
                         selectedReviewRating === 4 ? "Хорошо (4/5)" :
                         selectedReviewRating === 3 ? "Нормально (3/5)" :
                         selectedReviewRating === 2 ? "Плохо (2/5)" : "Ужасно (1/5)"}
                      </span>
                    </div>
                  </div>

                  {/* Review Text Area */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wide font-bold text-white/50 block font-mono">
                      Поделитесь впечатлениями
                    </label>
                    <textarea
                      rows={4}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl p-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-brand-gold/50 transition-all resize-none"
                      placeholder="Напишите, что вам понравилось больше всего: природа, гид, проживание или организация..."
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                    />
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setReviewingBooking(null)}
                      className="flex-1 py-2.5 rounded-2xl text-[10px] font-bold uppercase tracking-wider text-white/45 bg-white/3 hover:bg-white/5 transition-all cursor-pointer text-center"
                    >
                      Отмена
                    </button>
                    <button
                      type="button"
                      disabled={!reviewText.trim()}
                      onClick={() => {
                        const newReviewObj = {
                          id: Date.now(),
                          author: userSession.name || userSession.email.split("@")[0] || "Пользователь",
                          rating: selectedReviewRating,
                          text: reviewText,
                          approved: true, // Auto-approve left directly
                          service: reviewingBooking.title,
                          date: "Только что"
                        };
                        if (onAddReview) {
                          onAddReview(newReviewObj);
                        }
                        handleAddReviewedId(reviewingBooking.id);
                        setReviewedSuccessModal(true);
                        
                        // Auto close success screen after 2.5 seconds
                        setTimeout(() => {
                          setReviewingBooking(null);
                          setReviewedSuccessModal(false);
                          setReviewText("");
                        }, 2500);
                      }}
                      className="flex-1 py-2.5 rounded-2xl bg-brand-gold hover:bg-brand-gold/90 text-dark-bg font-bold text-[10px] tracking-wider uppercase transition-all shadow-lg shadow-brand-gold/10 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-center"
                    >
                      Отправить отзыв
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center space-y-4 animate-scale-up relative z-10 w-full">
                  <div className="w-16 h-16 bg-[#74d5a6]/10 border border-[#74d5a6]/25 rounded-full flex items-center justify-center mx-auto text-[#74d5a6] animate-bounce">
                    <Check className="h-8 w-8" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-white">Спасибо за ваш отзыв!</h4>
                    <p className="text-xs text-white/60 font-light px-4 leading-relaxed">
                      Ваш отзыв успешно зарегистрирован на платформе и отправлен организаторам тура "{reviewingBooking.title}". Это поможет сделать отдых в Карелии ещё лучше!
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast notifications center */}
      <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-2.5 max-w-sm w-full select-none pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: -50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 260, damping: 25 }}
              className={`p-4 rounded-2xl border text-xs shadow-2xl flex items-start gap-3 pointer-events-auto ${
                toast.type === "success" 
                  ? "bg-[#122e1b] border-brand-green/35 text-brand-green" 
                  : toast.type === "warning"
                    ? "bg-[#2f2010] border-amber-500/35 text-amber-300"
                    : toast.type === "error"
                      ? "bg-[#2d1212] border-red-500/35 text-red-400"
                      : "bg-[#161a20] border-white/10 text-white/90"
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {toast.type === "success" && <Check className="h-4 w-4 text-brand-green" />}
                {toast.type === "warning" && <AlertTriangle className="h-4 w-4 text-amber-400" />}
                {toast.type === "error" && <X className="h-4 w-4 text-red-400" />}
                {toast.type === "info" && <Info className="h-4 w-4 text-brand-gold" />}
              </div>
              <div className="flex-1 space-y-1 text-left">
                <span className="font-semibold block uppercase text-[9px] tracking-wider font-mono opacity-60">
                  {toast.type === "success" && "Подтверждено"}
                  {toast.type === "warning" && "Внимание"}
                  {toast.type === "error" && "Отменено"}
                  {toast.type === "info" && "Информация"}
                </span>
                <p className="font-semibold text-white select-text leading-relaxed">{toast.message}</p>
              </div>
              <button 
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="text-white/30 hover:text-white transition-colors cursor-pointer shrink-0"
              >
                <X className="h-3 w-3" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
