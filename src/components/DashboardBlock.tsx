import React, { useState, FormEvent } from "react";
import { motion } from "motion/react";
import { 
  BarChart as RechartsBarChart, 
  Bar as RechartsBar, 
  XAxis as RechartsXAxis, 
  YAxis as RechartsYAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend as RechartsLegend, 
  ResponsiveContainer, 
  AreaChart as RechartsAreaChart, 
  Area as RechartsArea 
} from "recharts";
import {
  AreaChart,
  Users,
  Star,
  Handshake,
  Check,
  MessageSquare,
  Plus,
  Mail,
  Phone,
  ExternalLink,
  Calendar,
  Search,
  Info,
  Sparkles,
  Edit2,
  Trash2,
  UserCheck,
  Save,
  Image,
  Tag,
  MapPin,
  Clock,
  Briefcase,
  FileSpreadsheet,
  Upload,
  CheckSquare,
  Square,
  DollarSign,
  CalendarDays,
  MessageCircle,
  LayoutGrid,
  List,
  AlertTriangle,
  Send,
  Loader2,
  X
} from "lucide-react";
import { initialLeads, staticServiceStats } from "../data";
import { PartnerLead, ServiceStats, CatalogCard, ExtraOption, PromoCode } from "../types";

interface DashboardBlockProps {
  partnerSession: {
    company: string;
    email: string;
    level: string;
    phone?: string;
    desc?: string;
    logo?: string;
    website?: string;
  };
  setPartnerSession: (session: any) => void;
  onUpgradeClick: () => void;
  cards: CatalogCard[];
  setCards: React.Dispatch<React.SetStateAction<CatalogCard[]>>;
  promoCodes?: PromoCode[];
  setPromoCodes?: React.Dispatch<React.SetStateAction<PromoCode[]>>;
  reviews?: any[];
  setReviews?: React.Dispatch<React.SetStateAction<any[]>>;
  leadsList?: PartnerLead[];
  setLeadsList?: React.Dispatch<React.SetStateAction<PartnerLead[]>>;
  addActivityEvent?: (
    text: string, 
    type: "booking" | "user" | "partner" | "tour" | "system", 
    severity: "info" | "success" | "warning"
  ) => void;
}

export default function DashboardBlock({
  partnerSession,
  setPartnerSession,
  onUpgradeClick,
  cards,
  setCards,
  promoCodes = [],
  setPromoCodes,
  reviews,
  setReviews,
  leadsList: propLeadsList,
  setLeadsList: propSetLeadsList,
  addActivityEvent
}: DashboardBlockProps) {
  const [activeTab, setActiveTab] = useState<"analytics" | "listings" | "leads" | "reviews" | "profile" | "promocodes">("analytics");

  // State for CRM leads management
  const [localLeadsList, setLocalLeadsList] = useState<PartnerLead[]>(initialLeads);
  const leadsList = propLeadsList || localLeadsList;
  const setLeadsList = propSetLeadsList || setLocalLeadsList;

  const [leadFilter, setLeadFilter] = useState<"all" | "new" | "progress" | "done" | "cancelled">("all");
  const [expandedLeadId, setExpandedLeadId] = useState<number | null>(null);
  const [newCommentText, setNewCommentText] = useState("");

  // Viewed Lead IDs to display dynamic real-time unread/unreviewed badges
  const [viewedLeadIds, setViewedLeadIds] = useState<number[]>(() => {
    const saved = localStorage.getItem("onepoint-viewed-leads");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (_) {}
    }
    return [];
  });

  // Toast State for quick cancellations
  const [toasts, setToasts] = useState<{ id: string; message: string; type: "success" | "info" | "warning" | "error" }[]>([]);
  const showToast = (message: string, type: "success" | "info" | "warning" | "error" = "success") => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const handleToggleExpandLead = (id: number) => {
    const isCurrentlyExpanded = expandedLeadId === id;
    setExpandedLeadId(isCurrentlyExpanded ? null : id);
    if (!isCurrentlyExpanded && !viewedLeadIds.includes(id)) {
      const updated = [...viewedLeadIds, id];
      setViewedLeadIds(updated);
      localStorage.setItem("onepoint-viewed-leads", JSON.stringify(updated));
    }
  };

  // Checkbox state for bulk actions
  const [selectedLeadIds, setSelectedLeadIds] = useState<number[]>([]);
  const [bulkMessage, setBulkMessage] = useState<string>("");
  const [startDateStr, setStartDateStr] = useState<string>("");
  const [endDateStr, setEndDateStr] = useState<string>("");
  const [productListSort, setProductListSort] = useState<"name" | "bookings" | "earnings" | "price">("bookings");
  
  // Alternate view state for the leads tab
  const [leadsViewMode, setLeadsViewMode] = useState<"list" | "calendar">("list");
  // Current month for calendar view
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState<string>("2026-06");
  // Billing and commissions payout calculation month
  const [selectedBillingMonth, setSelectedBillingMonth] = useState<string>("2026-06");
  // Payout request simulation status
  const [payoutRequested, setPayoutRequested] = useState<boolean>(false);
  // Chat typing loading state (for realistic response back from traveler!)
  const [travelerTypingId, setTravelerTypingId] = useState<number | null>(null);

  // State for analytics switcher
  const [selectedService, setSelectedService] = useState("Профессиональная съёмка в Рускеале");

  // State for fallback local reviews, if not injected
  const [localReviews, setLocalReviews] = useState([
    { id: 1, author: "Николай Д.", rating: 5, text: "Восторг! Капитан Андрей показал скрытый водопад, куда не ходят обычные катера. Рыбалка удалась!", approved: false, service: "Аренда моторной лодки" },
    { id: 2, author: "Юлия Смирнова", rating: 4, text: "Очень красивый йога-класс на пирсе, но утренняя роса сделала коврики слегка влажными. В остальном превосходно.", approved: false, service: "Дзен-йога ретрит" }
  ]);

  const onHoldReviews = reviews || localReviews;
  const setOnHoldReviews = setReviews || setLocalReviews;

  // Product Listings states (CRUD for CatalogCard)
  const [productFilter, setProductFilter] = useState<"all" | "mine">("all");
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Edit Card state form fields
  const [editTitle, setEditTitle] = useState("");
  const [editType, setEditType] = useState<CatalogCard["type"]>("Услуги");
  const [editLocation, setEditLocation] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editBasePrice, setEditBasePrice] = useState(0);
  const [editDesc, setEditDesc] = useState("");
  const [editImg, setEditImg] = useState("");
  const [editExtras, setEditExtras] = useState<ExtraOption[]>([]);
  const [editMaxGuests, setEditMaxGuests] = useState(10);
  const [editDiscountThreshold, setEditDiscountThreshold] = useState(0);
  const [editDiscountPercent, setEditDiscountPercent] = useState(0);
  // Temp extra form inputs
  const [tempExtraName, setTempExtraName] = useState("");
  const [tempExtraPrice, setTempExtraPrice] = useState("");

  // States to handle Promo Code Addition
  const [isAddingPromo, setIsAddingPromo] = useState(false);
  const [newPromoCode, setNewPromoCode] = useState("");
  const [newPromoDiscount, setNewPromoDiscount] = useState<number>(10);
  const [newPromoType, setNewPromoType] = useState<"percent" | "fixed">("percent");
  const [newPromoMinAmount, setNewPromoMinAmount] = useState<number>(0);

  // States to handle Bulk CSV Import of promo codes
  const [isBulkImporting, setIsBulkImporting] = useState(false);
  const [csvInput, setCsvInput] = useState("");
  const [csvError, setCsvError] = useState("");
  const [csvSuccess, setCsvSuccess] = useState("");

  // Memoized Last 30 Days Bookings analytical dataset
  const last30DaysBookingsData = React.useMemo(() => {
    const data = [];
    for (let i = 1; i <= 30; i++) {
      const base = 5 + Math.sin(i / 1.5) * 3;
      const weekendBonus = (i % 7 === 0 || i % 7 === 6) ? 4 : 0;
      const randomNoise = (i * 3 + 7) % 3; // Deterministic stable noise
      const bookings = Math.round(base + weekendBonus + randomNoise);
      data.push({
        day: `${i} мая`,
        bookings: bookings,
      });
    }
    return data;
  }, []);

  // Memoized Peak Hours booking activity (Hourly metrics)
  const peakHoursData = React.useMemo(() => {
    return [
      { hour: "08:00", count: 14, label: "Утро" },
      { hour: "10:00", count: 32, label: "Прайм утренний" },
      { hour: "12:00", count: 48, label: "Обед" },
      { hour: "14:00", count: 35, label: "Послеобед" },
      { hour: "16:00", count: 28, label: "Тихий час" },
      { hour: "18:00", count: 58, label: "Прайм вечерний" },
      { hour: "20:00", count: 72, label: "Пик посещаемости" },
      { hour: "22:00", count: 45, label: "Поздний вечер" },
      { hour: "00:00", count: 18, label: "Ночь" },
    ];
  }, []);

  // Memoized Weekday booking load activity splits
  const weekdayDistributionData = React.useMemo(() => {
    return [
      { name: "Понедельник", abbrev: "Пн", count: 28, conversion: 72 },
      { name: "Вторник", abbrev: "Вт", count: 24, conversion: 68 },
      { name: "Среда", abbrev: "Ср", count: 32, conversion: 75 },
      { name: "Четверг", abbrev: "Чт", count: 36, conversion: 79 },
      { name: "Пятница", abbrev: "Пт", count: 68, conversion: 89 },
      { name: "Суббота", abbrev: "Сб", count: 96, conversion: 94 },
      { name: "Воскресенье", abbrev: "Вс", count: 82, conversion: 88 },
    ];
  }, []);

  const handleCSVImportSubmit = (e: FormEvent) => {
    e.preventDefault();
    setCsvError("");
    setCsvSuccess("");
    
    if (!csvInput.trim()) {
      setCsvError("Пожалуйста, заполните текстовое поле.");
      return;
    }

    const lines = csvInput.split("\n");
    const parsed: PromoCode[] = [];
    const duplicates: string[] = [];
    const errors: string[] = [];

    lines.forEach((line, idx) => {
      const cleanLine = line.trim();
      if (!cleanLine) return; // skip empty lines

      // format support: CODE, DISCOUNT, TYPE (percent/fixed), MIN_AMOUNT
      const cols = cleanLine.split(/[;,]/);
      if (cols.length < 2) {
        errors.push(`Строка ${idx + 1}: неверный формат (минимум 2 колонки: КОД, СКИДКА)`);
        return;
      }

      const code = cols[0].trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
      const discVal = Number(cols[1].trim());
      const typeStr = cols[2]?.trim().toLowerCase();
      const type = typeStr === "fixed" ? "fixed" : "percent";
      const minAmount = cols[3] ? Number(cols[3].trim()) : undefined;

      if (!code) {
        errors.push(`Строка ${idx + 1}: невалидный код`);
        return;
      }
      if (isNaN(discVal) || discVal <= 0) {
        errors.push(`Строка ${idx + 1}: неверный размер скидки`);
        return;
      }

      const isDuplicate = promoCodes.some((p) => p.code.toUpperCase() === code) ||
                         parsed.some((p) => p.code === code);

      if (isDuplicate) {
        duplicates.push(code);
        return;
      }

      parsed.push({
        code,
        discountValue: discVal,
        type,
        isActive: true,
        minBookingAmount: minAmount && minAmount > 0 ? minAmount : undefined
      });
    });

    if (errors.length > 0) {
      setCsvError(errors.join(" | "));
      return;
    }

    if (parsed.length === 0) {
      if (duplicates.length > 0) {
        setCsvError(`Все указанные промокоды уже существуют: ${duplicates.join(", ")}`);
      } else {
        setCsvError("Система не смогла обработать строки. Формат: КОД, СКИДКА, ТИП, МИН_ОБЪЕМ");
      }
      return;
    }

    if (setPromoCodes) {
      setPromoCodes((prev) => [...parsed, ...prev]);
    }

    let msg = `Успешно импортировано промокодов: ${parsed.length}!`;
    if (duplicates.length > 0) {
      msg += ` Пропущено дубликатов: ${duplicates.join(", ")}.`;
    }
    setCsvSuccess(msg);
    setCsvInput("");
    setTimeout(() => {
      setIsBulkImporting(false);
      setCsvSuccess("");
    }, 4500);
  };

  const handleAddPromoSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newPromoCode.trim()) return;

    if (promoCodes.some((p) => p.code.toUpperCase() === newPromoCode.trim().toUpperCase())) {
      alert("Такой промокод уже существует!");
      return;
    }

    const newPromo: PromoCode = {
      code: newPromoCode.trim().toUpperCase(),
      discountValue: Number(newPromoDiscount),
      type: newPromoType,
      isActive: true,
      minBookingAmount: newPromoMinAmount > 0 ? Number(newPromoMinAmount) : undefined
    };

    if (setPromoCodes) {
      setPromoCodes((prev) => [newPromo, ...prev]);
    }
    setNewPromoCode("");
    setNewPromoDiscount(10);
    setNewPromoType("percent");
    setNewPromoMinAmount(0);
    setIsAddingPromo(false);
  };

  const handleTogglePromoActive = (code: string) => {
    if (setPromoCodes) {
      setPromoCodes((prev) =>
        prev.map((p) => {
          if (p.code === code) {
            return { ...p, isActive: !p.isActive };
          }
          return p;
        })
      );
    }
  };

  const handleDeletePromo = (code: string) => {
    if (setPromoCodes) {
      setPromoCodes((prev) => prev.filter((p) => p.code !== code));
    }
  };

  // Profile Form state
  const [profileCompany, setProfileCompany] = useState(partnerSession.company || "");
  const [profileEmail, setProfileEmail] = useState(partnerSession.email || "");
  const [profilePhone, setProfilePhone] = useState(partnerSession.phone || "+7 (911) 500-20-40");
  const [profileDesc, setProfileDesc] = useState(partnerSession.desc || "Организация премиальных катерных туров, сплавов под ключ, и индивидуальной дзен-йоги в Карелии и Выборге.");
  const [profileLogo, setProfileLogo] = useState(partnerSession.logo || "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=150&q=80");
  const [profileWebsite, setProfileWebsite] = useState(partnerSession.website || "https://karelia-outdoor.ru");
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Active Analytics stats lookup
  const activeStats: ServiceStats = staticServiceStats[selectedService] || staticServiceStats["Профессиональная съёмка в Рускеале"];

  // Total completed sums calculation based on Leads CRM list
  const totalCompletedEarnings = leadsList
    .filter((l) => l.status === "done")
    .reduce((sum, l) => sum + l.amount, 0);

  // Helper to parse lead.date to Milliseconds
  const parseLeadDateToMs = (dateStr: string): number => {
    if (!dateStr) return 0;
    const now = new Date();
    const lower = dateStr.toLowerCase();
    
    if (lower.includes("сегодня")) {
      return now.getTime();
    }
    if (lower.includes("вчера")) {
      const yesterday = new Date();
      yesterday.setDate(now.getDate() - 1);
      return yesterday.getTime();
    }
    
    // Custom parsing for Russian month templates (e.g. "22 июля 2026")
    const months: Record<string, number> = {
      "янв": 0, "фев": 1, "мар": 2, "апр": 3, "май": 4, "мая": 4, "июн": 5, "июл": 6, "авг": 7, "сен": 8, "окт": 9, "ноя": 10, "дек": 11
    };
    
    const match = dateStr.match(/(\d+)\s+([а-яёА-ЯЁa-zA-Z]+)(?:\s+(\d{4}))?/);
    if (match) {
      const day = parseInt(match[1]);
      const monthText = match[2].toLowerCase().substring(0, 3);
      const year = match[3] ? parseInt(match[3]) : now.getFullYear();
      const monthIndex = months[monthText] !== undefined ? months[monthText] : now.getMonth();
      
      return new Date(year, monthIndex, day).getTime();
    }
    
    const dotMatch = dateStr.match(/(\d{2})\.(\d{2})\.(\d{4})/);
    if (dotMatch) {
      const day = parseInt(dotMatch[1]);
      const month = parseInt(dotMatch[2]) - 1;
      const year = parseInt(dotMatch[3]);
      return new Date(year, month, day).getTime();
    }
    
    return now.getTime();
  };

  const filteredLeads = React.useMemo(() => {
    return leadsList.filter((lead) => {
      // 1. Status Filter
      if (leadFilter !== "all" && lead.status !== leadFilter) {
        return false;
      }
      
      // 2. Date Range Filter
      if (startDateStr || endDateStr) {
        const leadMs = parseLeadDateToMs(lead.date);
        
        if (startDateStr) {
          const startMs = new Date(startDateStr).getTime();
          if (leadMs < startMs) return false;
        }
        
        if (endDateStr) {
          const endObj = new Date(endDateStr);
          endObj.setHours(23, 59, 59, 999);
          const endMs = endObj.getTime();
          if (leadMs > endMs) return false;
        }
      }
      return true;
    });
  }, [leadsList, leadFilter, startDateStr, endDateStr]);

  const handleUpdateLeadStatus = (leadId: number, nextStatus: "progress" | "done") => {
    setLeadsList(
      leadsList.map((lead) => {
        if (lead.id === leadId) {
          const systemMsg = nextStatus === "progress" 
            ? "Взят в работу партнером" 
            : "Сделка закрыта. Оплата зафиксирована";
          return {
            ...lead,
            status: nextStatus,
            comments: [
              ...lead.comments,
              { text: systemMsg, time: "только что", author: "Система" }
            ]
          };
        }
        return lead;
      })
    );
  };

  const handleAddComment = (leadId: number, e: FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const messageToSend = newCommentText.trim();
    setNewCommentText("");

    setLeadsList(prev =>
      prev.map((lead) => {
        if (lead.id === leadId) {
          return {
            ...lead,
            comments: [
              ...lead.comments,
              { text: messageToSend, time: "только что", author: "Партнёр", read: false }
            ]
          };
        }
        return lead;
      })
    );

    // Simulate traveler reading the message after 2.5 seconds
    setTimeout(() => {
      setLeadsList(prevList =>
        prevList.map(item => {
          if (item.id === leadId) {
            const updated = item.comments.map(c => 
              c.author === "Партнёр" ? { ...c, read: true } : c
            );
            return {
              ...item,
              comments: updated
            } as any;
          }
          return item;
        })
      );
    }, 2200);

    // Simulate instant traveler replying back in Chat!
    setTravelerTypingId(leadId);
    setTimeout(() => {
      const travelerReplies = [
        "Отлично, спасибо большое за предупреждение! Будем вовремя.",
        "Понятно. Подскажите, пожалуйста, а дождевики и снаряжение вы выдаете?",
        "Принято, спасибо за мгновенный ответ! Ждем встречи с гидом.",
        "Супер! А трансфер отправляется ровно в назначенное время?",
        "Хорошо, спасибо! С нами будет один ребенок 8 лет, это ок?",
        "Подскажите контакты нашего гида для связи на месте, пожалуйста."
      ];
      const randomReply = travelerReplies[Math.floor(Math.random() * travelerReplies.length)];

      setLeadsList(prevList =>
        prevList.map(item => {
          if (item.id === leadId) {
            return {
              ...item,
              comments: [
                ...item.comments,
                { text: randomReply, time: "только что", author: "Клиент", read: true }
              ]
            } as any;
          }
          return item;
        })
      );
      setTravelerTypingId(null);
    }, 1500);
  };

  const handleBulkUpdateStatus = (nextStatus: "progress" | "done") => {
    if (selectedLeadIds.length === 0) return;
    setLeadsList(prev =>
      prev.map(lead => {
        if (selectedLeadIds.includes(lead.id)) {
          const systemMsg = nextStatus === "progress"
            ? "Массово взят в работу партнером"
            : "Сделка массово закрыта оператором";
          return {
            ...lead,
            status: nextStatus,
            comments: [
              ...lead.comments,
              { text: systemMsg + " (Групповая операция).", time: "только что", author: "Система" }
            ]
          };
        }
        return lead;
      })
    );
    setSelectedLeadIds([]);
  };

  const handleSendGroupNotification = () => {
    if (selectedLeadIds.length === 0 || !bulkMessage.trim()) return;
    setLeadsList(prev =>
      prev.map(lead => {
        if (selectedLeadIds.includes(lead.id)) {
          return {
            ...lead,
            comments: [
              ...lead.comments,
              { text: bulkMessage.trim(), time: "только что", author: "Партнёр" }
            ]
          };
        }
        return lead;
      })
    );
    if (addActivityEvent) {
      addActivityEvent(
        `Партнёр разослал групповое уведомление для ${selectedLeadIds.length} клиентов.`,
        "partner",
        "info"
      );
    }
    showToast(`Уведомление отправлено ${selectedLeadIds.length} клиентам!`, "success");
    setSelectedLeadIds([]);
    setBulkMessage("");
  };

  const handleApproveReview = (id: number) => {
    setOnHoldReviews(
      onHoldReviews.map((rev) => (rev.id === id ? { ...rev, approved: true } : rev))
    );
  };

  // Profile data save trigger
  const handleSaveProfile = (e: FormEvent) => {
    e.preventDefault();
    const updated = {
      ...partnerSession,
      company: profileCompany,
      email: profileEmail,
      phone: profilePhone,
      desc: profileDesc,
      logo: profileLogo,
      website: profileWebsite
    };
    setPartnerSession(updated);
    setProfileSuccess(true);
    setTimeout(() => {
      setProfileSuccess(false);
    }, 3000);
  };

  // Card list filtering based on toggle ownership (Mine vs All)
  const filteredProducts = cards.filter((item) => {
    if (productFilter === "mine") {
      return item.author.trim().toLowerCase() === partnerSession.company.trim().toLowerCase();
    }
    return true;
  });

  const sortedProducts = React.useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      if (productListSort === "bookings") {
        return (b.bookingsCount || 0) - (a.bookingsCount || 0);
      }
      if (productListSort === "earnings") {
        const earningsA = (a.bookingsCount || 0) * (a.basePrice || 0);
        const earningsB = (b.bookingsCount || 0) * (b.basePrice || 0);
        return earningsB - earningsA;
      }
      if (productListSort === "price") {
        return b.basePrice - a.basePrice;
      }
      // "name" or default
      return a.title.localeCompare(b.title);
    });
  }, [filteredProducts, productListSort]);

  // Open Edit parameters setup
  const handleStartEditCard = (card: CatalogCard) => {
    setEditingCardId(card.id);
    setIsAddingNew(false);
    setEditTitle(card.title || "");
    setEditType(card.type || "Услуги");
    setEditLocation(card.location || "");
    setEditDate(card.date || "");
    setEditBasePrice(card.basePrice || 0);
    setEditDesc(card.desc || "");
    setEditImg(card.img || "");
    setEditExtras(card.extras || []);
    setEditMaxGuests(card.maxGuests || 10);
    setEditDiscountThreshold(card.discountThreshold || 0);
    setEditDiscountPercent(card.discountPercent || 0);
    setTempExtraName("");
    setTempExtraPrice("");
  };

  // Save changes to card state list
  const handleSaveCardEdits = (e: FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim()) return alert("Укажите заголовок товара!");

    setCards((prev) =>
      prev.map((c) => {
        if (c.id === editingCardId) {
          return {
            ...c,
            title: editTitle,
            type: editType,
            location: editLocation,
            date: editDate,
            basePrice: Number(editBasePrice),
            priceLabel: `от ${Number(editBasePrice).toLocaleString("ru")} ₽`,
            desc: editDesc,
            img: editImg || "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80",
            extras: editExtras,
            pricePerPerson: Number(editBasePrice),
            maxGuests: Number(editMaxGuests),
            discountThreshold: Number(editDiscountThreshold),
            discountPercent: Number(editDiscountPercent)
          };
        }
        return c;
      })
    );
    alert("Продукт успешно обновлен!");
    setEditingCardId(null);
  };

  // Delete card safely
  const handleDeleteCard = (id: string) => {
    if (window.confirm("Вы действительно хотите удалить этот продукт/услугу из каталога?")) {
      setCards((prev) => prev.filter((c) => c.id !== id));
      alert("Карточка успешно удалена.");
    }
  };

  // Add extra options dynamically inside forms
  const handleAddExtraOption = () => {
    if (!tempExtraName.trim() || !tempExtraPrice) return;
    setEditExtras((prev) => [
      ...prev,
      { name: tempExtraName.trim(), price: Number(tempExtraPrice) }
    ]);
    setTempExtraName("");
    setTempExtraPrice("");
  };

  const handleRemoveExtraOption = (index: number) => {
    setEditExtras((prev) => prev.filter((_, i) => i !== index));
  };

  // Setup blank object form to trigger card additions
  const handleStartAddCard = () => {
    setIsAddingNew(true);
    setEditingCardId(null);
    setEditTitle("");
    setEditType("Услуги");
    setEditLocation("Карелия");
    setEditDate("Ежедневно");
    setEditBasePrice(1500);
    setEditDesc("");
    setEditImg("https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80");
    setEditExtras([]);
    setEditMaxGuests(10);
    setEditDiscountThreshold(0);
    setEditDiscountPercent(0);
    setTempExtraName("");
    setTempExtraPrice("");
  };

  // Form submit to append new product catalog card
  const handleSaveNewCard = (e: FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim()) return alert("Пожалуйста, заполните название!");

    const newCard: CatalogCard = {
      id: `custom-card-${Date.now()}`,
      title: editTitle,
      type: editType,
      location: editLocation,
      date: editDate,
      basePrice: Number(editBasePrice),
      priceLabel: `от ${Number(editBasePrice).toLocaleString("ru")} ₽`,
      desc: editDesc,
      img: editImg || "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=800&q=80",
      extras: editExtras,
      author: partnerSession.company,
      rating: 5.0,
      response: "10 мин",
      size: "medium",
      pricePerPerson: Number(editBasePrice),
      maxGuests: Number(editMaxGuests),
      discountThreshold: Number(editDiscountThreshold),
      discountPercent: Number(editDiscountPercent)
    };

    setCards((prev) => [newCard, ...prev]);
    alert("Новый продукт успешно добавлен в каталог!");
    setIsAddingNew(false);
  };

  // SVG Trend Path Calculation helpers
  const trendMax = Math.max(...activeStats.trend);
  const trendMin = Math.min(...activeStats.trend);
  const graphWidth = 500;
  const graphHeight = 100;

  const points = activeStats.trend.map((val, idx) => {
    const x = (idx / (activeStats.trend.length - 1)) * graphWidth;
    const y = graphHeight - ((val - trendMin) / (trendMax - trendMin || 1)) * (graphHeight - 20) - 10;
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="space-y-6">
      {/* Dynamic dashboard header stats */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl border border-white/10 bg-dark-card/60 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-md">
            <img
              className="h-full w-full object-cover rounded-xl"
              src={profileLogo}
              alt="Logo"
              onError={(e) => {
                // fallback to emoji/text indicator
                (e.target as any).style.display = 'none';
              }}
            />
            <Briefcase className="h-6 w-6 text-brand-gold absolute" style={{ zIndex: -1 }} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#74d5a6]">
              Административная панель
            </span>
            <h2 className="text-2xl sm:text-3xl font-light text-white mt-0.5">
              Кабинет: <span className="font-semibold text-brand-gold">{profileCompany}</span>
            </h2>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="p-3 bg-white/3 border border-white/5 rounded-2xl text-xs text-center min-w-[120px]">
            <span className="text-white/35 block uppercase text-[9px] font-bold">Закрытый объём</span>
            <span className="text-sm font-bold font-mono text-brand-gold">{totalCompletedEarnings.toLocaleString("ru")} ₽</span>
          </div>
          <div className="p-3 bg-white/3 border border-white/5 rounded-2xl text-xs text-center min-w-[100px]">
            <span className="text-white/35 block uppercase text-[9px] font-bold">Новых лидов</span>
            <span className="text-sm font-bold font-mono text-brand-green">
              {leadsList.filter(l => l.status === "new").length}
            </span>
          </div>
        </div>
      </div>

      {/* Dynamic Subscription / Tariff Alert Banner */}
      <div className="p-5 rounded-3xl border border-brand-gold/15 bg-brand-gold/[0.03] backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-brand-gold/10 text-brand-gold">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Текущий тарифный план:</span>
              <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-brand-gold text-dark-bg uppercase tracking-widest leading-none">
                {partnerSession.level || "Free"}
              </span>
            </div>
            <p className="text-xs text-white/60 mt-1 leading-relaxed">
              {partnerSession.level === "Free" && "Вы используете базовую версию (лимит: 1 объявление). Снизьте комиссию до 5% или 2% и откройте полный СRM контроль над заявками."}
              {partnerSession.level === "Pro" && "Активны SMS-уведомления, интерактивные опции для броней и до 10 активных объявлений. Готовы к безлимиту?"}
              {partnerSession.level === "Premium" && "Вам подключен максимальный тариф: безлимитные объявления, супер-комиссия 2%, SEO-продвижение и личный кабинет менеджера."}
              {(!partnerSession.level || partnerSession.level.includes("плюс") || partnerSession.level.includes("Регистрация")) && "Индивидуальный ознакомительный доступ. Все возможности CRM-модулей активны."}
            </p>
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto shrink-0 justify-end">
          {partnerSession.level !== "Premium" ? (
            <button
              onClick={onUpgradeClick}
              className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-brand-gold text-dark-bg text-xs font-bold hover:bg-brand-gold-hover transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-brand-gold/10 active:scale-95 text-center"
            >
              🚀 Улучшить тариф
            </button>
          ) : (
            <span className="text-xs font-bold text-brand-green bg-brand-green/10 border border-brand-green/20 px-3.5 py-2 rounded-xl shrink-0 flex items-center gap-1">
              ✓ Максимальный пакет
            </span>
          )}
        </div>
      </div>

      {/* Tabs list switches layout */}
      <div className="flex overflow-x-auto gap-2 pb-2 border-b border-white/10 scrollbar-none select-none">
        {[
          { id: "analytics", label: "Продукт-аналитика", icon: AreaChart },
          { id: "listings", label: "Управление продуктами", icon: ExternalLink },
          { id: "leads", label: "CRM Лиды", icon: Users },
          { id: "reviews", label: "Отзывы клиентов", icon: MessageSquare },
          { id: "promocodes", label: "Промокоды", icon: Tag },
          { id: "profile", label: "Профиль компании", icon: UserCheck }
        ].map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;
          const pendingReviewsCount = onHoldReviews.filter((r) => !r.approved).length;
          const unreadLeadsCount = leadsList.filter((l) => !viewedLeadIds.includes(l.id)).length;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              id={`dash-tab-btn-${tab.id}`}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                isActive
                  ? "bg-brand-gold text-dark-bg font-bold shadow-md shadow-brand-gold/10"
                  : "bg-white/3 border border-white/5 text-white/70 hover:text-white"
              }`}
            >
              <TabIcon className="h-4 w-4" />
              <span>{tab.label}</span>
              {tab.id === "reviews" && pendingReviewsCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white px-1.5 shadow-lg shadow-red-500/20 animate-pulse font-mono">
                  {pendingReviewsCount}
                </span>
              )}
              {tab.id === "leads" && unreadLeadsCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-gold text-[10px] font-extrabold text-dark-bg px-1.5 shadow-lg shadow-brand-gold/20 animate-pulse font-mono">
                  {unreadLeadsCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* RENDER ACTIVE PANELS */}
      {activeTab === "analytics" && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="space-y-6"
          id="dash-panel-analytics"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl border border-white/10 bg-dark-card/50">
            <div>
              <h3 className="text-lg font-light text-white">Выбор карточки анализа</h3>
              <p className="text-xs text-white/45">Выберите и проверьте воронку конкретной карточки.</p>
            </div>
            {/* Service toggle dropdown list */}
            <div className="relative min-w-[240px]">
              <select
                id="analytics-service-dropdown"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-gold/60 cursor-pointer appearance-none animate-none"
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
              >
                {Object.keys(staticServiceStats).map((name) => (
                  <option key={name} value={name} className="bg-dark-card text-white">
                    {name}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none text-xs">▼</div>
            </div>
          </div>

          {/* Service stats grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Просмотры периода", value: activeStats.views.toLocaleString("ru"), detail: `${activeStats.growthWeek} на этой неделе`, color: "text-brand-gold" },
              { label: "Лидов получено", value: activeStats.leads, detail: `Конверсия: ${activeStats.conversion}`, color: "text-white" },
              { label: "Средний чек услуги", value: `${activeStats.avgCheck.toLocaleString("ru")} ₽`, detail: `Опций в среднем: 2.1`, color: "text-brand-gold" },
              { label: "Желаемые / Избранное", value: activeStats.favorites, detail: `CTR карточки: ${activeStats.ctr}`, color: "text-white" }
            ].map((stCard, sIdx) => (
              <div key={sIdx} className="p-5 rounded-2xl bg-white/4 border border-white/5 space-y-2">
                <span className="text-[9px] uppercase font-bold tracking-widest text-white/35 block">
                  {stCard.label}
                </span>
                <div className={`text-2xl font-light font-mono ${stCard.color}`}>
                  {stCard.value}
                </div>
                <span className="text-[10px] text-white/45 block pt-1 border-t border-white/5">
                  {stCard.detail}
                </span>
              </div>
            ))}
          </div>

          {/* SVG Trend Graph charting visitor clicks */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-5 rounded-2xl border border-white/10 bg-dark-card/70 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <h4 className="text-xs uppercase font-bold tracking-widest text-brand-gold">
                  Тренд посещаемости (Клики за 7 дней)
                </h4>
                <span className="text-[10px] text-[#74d5a6] font-mono font-semibold">Пиковый день: {activeStats.peakDay}</span>
              </div>

              {/* Vector SVG Graph Line */}
              <div className="relative pt-4">
                <svg className="w-full h-24 overflow-visible" viewBox={`0 0 ${graphWidth} ${graphHeight}`} preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#d6b36a" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#d6b36a" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Gradient Area under curve */}
                  <path
                    d={`M 0,${graphHeight} L ${points} L ${graphWidth},${graphHeight} Z`}
                    fill="url(#chartGrad)"
                  />

                  {/* Top Curved Line */}
                  <polyline
                    fill="none"
                    stroke="#d6b36a"
                    strokeWidth="2"
                    points={points}
                  />

                  {/* Data Point Circles */}
                  {activeStats.trend.map((val, idx) => {
                    const x = (idx / (activeStats.trend.length - 1)) * graphWidth;
                    const y = graphHeight - ((val - trendMin) / (trendMax - trendMin || 1)) * (graphHeight - 20) - 10;
                    return (
                      <g key={idx}>
                        <circle cx={x} cy={y} r="3" fill="#07101a" stroke="#d6b36a" strokeWidth="2" />
                        <text x={x} y={y - 10} fill="#ffffff" fontSize="8" fontFamily="monospace" textAnchor="middle">
                          {val}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                <div className="flex justify-between text-[9px] text-white/30 pt-3 border-t border-white/5 font-mono">
                  {["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"].map((day) => (
                    <span key={day}>{day.slice(0, 3)}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-white/10 bg-dark-card/70 space-y-3 flex flex-col justify-between">
              <div>
                <h4 className="text-xs uppercase font-bold tracking-widest text-white/40 pb-2 border-b border-white/5">
                  Топ Региональной воронки
                </h4>
                <div className="space-y-3 pt-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-white/60">География переходов</span>
                    <span className="font-mono text-brand-gold">{activeStats.geoTop}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/60">Повторные обращения</span>
                    <span className="font-mono text-[#74d5a6]">{activeStats.repeat}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/60">Показатель отказов</span>
                    <span className="font-mono text-red-400">{activeStats.bounceRate}</span>
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-white/35 font-light leading-relaxed bg-white/2 p-3.5 rounded-xl border border-white/5">
                <Info className="h-3.5 w-3.5 text-brand-gold inline mr-1" />
                Настройки SEO в Карелии показывают повышенную плотность прямого трафика в выходные дни. Рекомендуем держать онлайн в субботу с 09:00 до 12:00.
              </div>
            </div>
          </div>

          {/* Recharts Booking trends & Revenue growth charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Booking Trends Area Chart */}
            <div className="p-5 rounded-2xl border border-white/10 bg-dark-card/70 space-y-4 text-left">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <div>
                  <h4 className="text-xs uppercase font-bold tracking-widest text-[#74d5a6]">
                    Динамика бронирований (по дням)
                  </h4>
                  <p className="text-[10px] text-white/40 mt-1">Количество бронирований за последний месяц</p>
                </div>
                <span className="text-[10px] bg-[#74d5a6]/10 border border-[#74d5a6]/25 text-[#74d5a6] px-2 py-0.5 rounded font-bold font-mono">
                  30 Дней
                </span>
              </div>
              <div className="h-64 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsAreaChart data={last30DaysBookingsData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="rechartsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#74d5a6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#74d5a6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <RechartsXAxis dataKey="day" stroke="rgba(255,255,255,0.4)" fontSize={8.5} interval={4} />
                    <RechartsYAxis stroke="rgba(255,255,255,0.4)" fontSize={9} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: "#07101a", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px" }}
                      labelStyle={{ color: "#fff", fontSize: "10px", fontWeight: "bold" }}
                      itemStyle={{ color: "#74d5a6", fontSize: "11px" }}
                    />
                    <RechartsArea type="monotone" dataKey="bookings" name="Бронирования" stroke="#74d5a6" strokeWidth={2.5} fillOpacity={1} fill="url(#rechartsGrad)" />
                  </RechartsAreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Revenue Growth Bar Chart */}
            <div className="p-5 rounded-2xl border border-white/10 bg-dark-card/70 space-y-4 text-left">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <div>
                  <h4 className="text-xs uppercase font-bold tracking-widest text-brand-gold">
                    Рост выручки партнера (Выручка, ₽)
                  </h4>
                  <p className="text-[10px] text-white/40 mt-1">Финансовые показатели за закрытые периоды</p>
                </div>
                <span className="text-[10px] bg-brand-gold/10 border border-brand-gold/25 text-brand-gold px-2 py-0.5 rounded font-bold font-mono">
                  +433% Рост выручки
                </span>
              </div>
              <div className="h-64 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={[
                    { name: "Янв", bookings: 12, revenue: 120000 },
                    { name: "Фев", bookings: 19, revenue: 195000 },
                    { name: "Мар", bookings: 15, revenue: 160000 },
                    { name: "Апр", bookings: 28, revenue: 310000 },
                    { name: "Май", bookings: 42, revenue: 490000 },
                    { name: "Июн", bookings: 55, revenue: 640000 }
                  ]} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <RechartsXAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={9} />
                    <RechartsYAxis stroke="rgba(255,255,255,0.4)" fontSize={9} tickFormatter={(v) => `${(v/1000)}k`} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: "#07101a", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px" }}
                      labelStyle={{ color: "#fff", fontSize: "10px", fontWeight: "bold" }}
                      itemStyle={{ color: "#d6b36a", fontSize: "11px" }}
                      formatter={(v) => [`${Number(v).toLocaleString("ru")} ₽`, "Выручка"]}
                    />
                    <RechartsBar dataKey="revenue" name="Выручка" fill="#d6b36a" radius={[4, 4, 0, 0]} maxBarSize={30} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Third Row: Peak Hours & Weekday analytics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Peak Hours Area Chart */}
            <div className="p-5 rounded-2xl border border-white/10 bg-dark-card/70 space-y-4 text-left">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <div>
                  <h4 className="text-xs uppercase font-bold tracking-widest text-[#74d5a6]">
                    Пиковые Часы Активности Бронирований
                  </h4>
                  <p className="text-[10px] text-white/40 mt-1">Почасовая плотность заявок за последние 30 дней</p>
                </div>
                <span className="text-[10px] bg-[#74d5a6]/10 border border-[#74d5a6]/25 text-[#74d5a6] px-2 py-0.5 rounded font-bold font-mono">
                  По Суткам
                </span>
              </div>
              <div className="h-64 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsAreaChart data={peakHoursData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="rechartsGrad2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#74d5a6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#74d5a6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <RechartsXAxis dataKey="hour" stroke="rgba(255,255,255,0.4)" fontSize={9} />
                    <RechartsYAxis stroke="rgba(255,255,255,0.4)" fontSize={9} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: "#07101a", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px" }}
                      labelStyle={{ color: "#fff", fontSize: "10px", fontWeight: "bold" }}
                      itemStyle={{ color: "#74d5a6", fontSize: "11px" }}
                    />
                    <RechartsArea type="monotone" dataKey="count" name="Заявки" stroke="#74d5a6" strokeWidth={2.5} fillOpacity={1} fill="url(#rechartsGrad2)" />
                  </RechartsAreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Weekly Load Distribution Split */}
            <div className="p-5 rounded-2xl border border-white/10 bg-dark-card/70 space-y-4 text-left">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <div>
                  <h4 className="text-xs uppercase font-bold tracking-widest text-brand-gold">
                    Загруженность по Дням Недели
                  </h4>
                  <p className="text-[10px] text-white/40 mt-1">Доля бронирований и процент конверсий в оплаты</p>
                </div>
                <span className="text-[10px] bg-brand-gold/10 border border-brand-gold/25 text-brand-gold px-2 py-0.5 rounded font-bold font-mono">
                  Выходные (Пик)
                </span>
              </div>
              
              <div className="space-y-3.5 pt-1">
                {weekdayDistributionData.map((day, dIdx) => (
                  <div key={dIdx} className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-white/70 flex items-center gap-1.5">
                        <span className="text-[10px] bg-white/10 border border-white/15 px-1.5 py-0.5 rounded text-white/50">{day.abbrev}</span>
                        <span>{day.name}</span>
                      </span>
                      <span className="font-semibold text-white/90">
                        {day.count} броней <span className="text-[#74d5a6] text-[10px]">({day.conversion}% опл.)</span>
                      </span>
                    </div>
                    {/* Progress Bar metric line */}
                    <div className="w-full h-2 bg-black/40 border border-white/5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          day.count >= 60 ? "bg-brand-gold" : "bg-brand-green"
                        }`}
                        style={{ width: `${day.count}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

       {activeTab === "listings" && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="space-y-6"
          id="dash-panel-listings"
        >
          {/* Header Actions for Listing Page */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-dark-card/50 border border-white/10">
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase font-bold tracking-widest text-[#74d5a6]">
                Менеджмент контента
              </span>
              <div className="flex gap-1 border border-white/10 bg-black/30 p-1 rounded-lg">
                <button
                  onClick={() => setProductFilter("all")}
                  className={`text-[10px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    productFilter === "all" ? "bg-brand-gold text-dark-bg" : "text-white/50 hover:text-white"
                  }`}
                >
                  Все ({cards.length})
                </button>
                <button
                  onClick={() => setProductFilter("mine")}
                  className={`text-[10px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    productFilter === "mine" ? "bg-brand-gold text-dark-bg" : "text-white/50 hover:text-white"
                  }`}
                >
                  Только ваши ({cards.filter(c => c.author === partnerSession.company).length})
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5 items-center w-full sm:w-auto">
              {/* Product list sorting dropdown */}
              <div className="flex items-center gap-2 text-xs text-white/65 bg-black/40 border border-white/10 px-3 py-2 rounded-xl">
                <span>Сортировка:</span>
                <select
                  value={productListSort}
                  onChange={(e) => setProductListSort(e.target.value as any)}
                  className="bg-transparent border-none text-brand-gold font-bold focus:outline-none cursor-pointer text-xs"
                >
                  <option value="bookings" className="bg-[#0f243a] text-white">🔥 Бронирования</option>
                  <option value="earnings" className="bg-[#0f243a] text-white">💰 Сумма заработка</option>
                  <option value="name" className="bg-[#0f243a] text-white">🔤 По названию</option>
                  <option value="price" className="bg-[#0f243a] text-white">🪙 По цене</option>
                </select>
              </div>

              <button
                id="dash-add-new-product-btn"
              onClick={handleStartAddCard}
              className="px-4 py-2 border border-brand-green/30 bg-brand-green/10 text-brand-green text-xs font-bold rounded-xl hover:bg-brand-green/20 active:scale-95 transition-all cursor-pointer flex items-center gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Создать услугу или тур</span>
            </button>
          </div>
        </div>

          {/* ADD NEW PRODUCT FORM CONTAINER */}
          {isAddingNew && (
            <div className="p-6 rounded-3xl border border-brand-green/30 bg-brand-green/[0.02] space-y-4 animate-fade-in relative">
              <div className="absolute top-4 right-4 text-[9px] uppercase font-mono font-bold text-brand-green bg-brand-green/10 border border-brand-green/20 px-2.5 py-1 rounded-full">
                Режим создания
              </div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Plus className="h-4 w-4 text-brand-green" />
                Новая карточка товара / услуги на платформе
              </h3>

              <form onSubmit={handleSaveNewCard} className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] uppercase font-bold text-white/60">Название карточки</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-gold/60"
                    placeholder="Пример: Круиз к Ладожским шхерам на комфортабельном катере"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-white/60">Категория</label>
                  <select
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-gold/60 cursor-pointer"
                    value={editType}
                    onChange={(e) => setEditType(e.target.value as any)}
                  >
                    <option value="Туры">Туры</option>
                    <option value="Услуги">Услуги</option>
                    <option value="Мероприятия">Мероприятия</option>
                    <option value="Инструкции">Инструкции</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-white/60">Регион нахождения</label>
                  <select
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-gold/60 cursor-pointer"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                  >
                    <option value="Карелия">Карелия</option>
                    <option value="Ленобласть">Ленобласть</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-white/60">Базовая стоимость (₽)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-brand-gold/60"
                    placeholder="3500"
                    value={editBasePrice || ""}
                    onChange={(e) => setEditBasePrice(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-white/60">Сроки проведения / Период</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-gold/60"
                    placeholder="Пример: Ежедневно в 10:00 или 15-18 августа"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                  />
                </div>

                {/* Advanced group booking settings */}
                <div className="space-y-2 md:col-span-2 border border-white/5 bg-white/2 p-4 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-brand-gold block border-b border-white/5 pb-1.5 mb-2.5">
                     Параметры групп и объемных скидок
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-white/45 flex items-center gap-1">
                        Лимит гостей (макс. чел.)
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white font-mono focus:outline-none focus:border-brand-gold/60"
                        value={editMaxGuests}
                        onChange={(e) => setEditMaxGuests(Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-white/45">
                        Порог для скидки (от чел.)
                      </label>
                      <input
                        type="number"
                        min="0"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white font-mono focus:outline-none focus:border-brand-gold/60"
                        placeholder="Например, 4. 0 = выкл"
                        value={editDiscountThreshold || ""}
                        onChange={(e) => setEditDiscountThreshold(Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-white/45">
                        Размер скидки (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white font-mono focus:outline-none focus:border-brand-gold/60"
                        placeholder="Например, 10%"
                        value={editDiscountPercent || ""}
                        onChange={(e) => setEditDiscountPercent(Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] uppercase font-bold text-white/60">Ссылка на обложку (изображение Unsplash)</label>
                  <input
                    type="text"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-gold/60"
                    placeholder="Используйте прямую ссылку на фото"
                    value={editImg}
                    onChange={(e) => setEditImg(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] uppercase font-bold text-white/60">Развёрнутое описание продукта</label>
                  <textarea
                    rows={4}
                    required
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-gold/60 resize-none font-light leading-relaxed"
                    placeholder="Опишите вашу услугу или программу во всех подробностях..."
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                  />
                </div>

                <div className="md:col-span-2 flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-brand-green/80 hover:bg-brand-green active:scale-95 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition duration-155 cursor-pointer"
                  >
                    Активировать предложение
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingNew(false);
                      // Clear fields
                      setEditTitle("");
                      setEditDesc("");
                      setEditBasePrice(0);
                      setEditDate("");
                    }}
                    className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white/70 font-semibold text-xs rounded-xl transition duration-155 cursor-pointer"
                  >
                    Отмена
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* LISTS ITERATION (CRUD) */}
          <div className="space-y-4">
            {filteredProducts.map((card) => {
              const isEditing = editingCardId === card.id;
              
              return (
                <div
                  key={card.id}
                  id={`product-manage-row-${card.id}`}
                  className={`p-5 rounded-3xl border transition-all duration-300 ${
                    isEditing ? "border-brand-gold bg-brand-gold/[0.02]" : "border-white/10 bg-dark-card/60 hover:border-white/20"
                  }`}
                >
                  {!isEditing ? (
                    /* Read Mode Row view */
                    <div className="flex flex-col md:flex-row gap-5 items-start md:items-center justify-between">
                      <div className="flex gap-4 items-center">
                        <div className="h-16 w-24 rounded-xl overflow-hidden shrink-0 border border-white/5 select-none pointer-events-none">
                          <img className="h-full w-full object-cover" src={card.img} alt={card.title} />
                        </div>
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-brand-gold bg-brand-gold/10 border border-brand-gold/20 px-2 py-0.5 rounded-full leading-none">
                              {card.type}
                            </span>
                            <span className="text-[10px] text-white/40 font-mono">
                              📍 {card.location}
                            </span>
                          </div>
                          <h4 className="text-base font-semibold text-white">{card.title}</h4>
                          <span className="text-xs text-white/45 block">
                            Организатор: <span className="text-white/70">{card.author}</span> • {card.date}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-6 w-full md:w-auto self-stretch md:self-auto border-t md:border-t-0 pt-3 md:pt-0 border-white/5 justify-between">
                        <div className="text-left md:text-center min-w-[80px]">
                          <span className="text-[9px] uppercase text-white/35 block font-bold tracking-wider">Цена</span>
                          <span className="text-base font-bold font-mono text-brand-gold">{card.basePrice.toLocaleString("ru")} ₽</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            id={`edit-product-btn-${card.id}`}
                            onClick={() => handleStartEditCard(card)}
                            className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-brand-gold/40 hover:bg-brand-gold/5 text-white/80 hover:text-brand-gold transition-all cursor-pointer"
                            title="Редактировать параметры услуги"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            id={`delete-product-btn-${card.id}`}
                            onClick={() => handleDeleteCard(card.id)}
                            className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-red-400/40 hover:bg-red-400/5 text-white/80 hover:text-red-400 transition-all cursor-pointer"
                            title="Удалить предложение навсегда"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Inline interactive update form fields */
                    <form onSubmit={handleSaveCardEdits} className="space-y-4 animate-fade-in">
                      <div className="flex items-center justify-between pb-2 border-b border-white/5">
                        <h4 className="text-xs uppercase font-bold tracking-widest text-brand-gold flex items-center gap-1.5">
                          <Edit2 className="h-3.5 w-3.5" />
                          Редактирование: {card.title}
                        </h4>
                        <span className="text-[10px] font-mono text-white/30">ID товара: {card.id}</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-bold text-white/60">Заголовок услуги</label>
                          <input
                            type="text"
                            required
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white font-semibold focus:outline-none focus:border-brand-gold/60"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-bold text-white/60">Категория на платформе</label>
                          <select
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-brand-gold/60"
                            value={editType}
                            onChange={(e) => setEditType(e.target.value as any)}
                          >
                            <option value="Туры">Туры</option>
                            <option value="Услуги">Услуги</option>
                            <option value="Мероприятия">Мероприятия</option>
                            <option value="Инструкции">Инструкции</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-bold text-white/60">Локация / Регион</label>
                          <input
                            type="text"
                            required
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none"
                            value={editLocation}
                            onChange={(e) => setEditLocation(e.target.value)}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-bold text-white/60">Стоимость (₽)</label>
                          <input
                            type="number"
                            required
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white font-mono focus:outline-none"
                            value={editBasePrice}
                            onChange={(e) => setEditBasePrice(Number(e.target.value))}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-bold text-white/60">График / Сроки</label>
                          <input
                            type="text"
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none"
                            value={editDate}
                            onChange={(e) => setEditDate(e.target.value)}
                          />
                        </div>

                        {/* Edit card group settings */}
                        <div className="space-y-2 md:col-span-2 border border-white/5 bg-white/2 p-4 rounded-xl">
                          <span className="text-[10px] uppercase font-bold text-brand-gold block border-b border-white/5 pb-1.5 mb-2.5">
                            Групповые параметры и объёмная скидка
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] uppercase font-bold text-white/45 flex items-center gap-1">
                                Лимит гостей (чел.)
                              </label>
                              <input
                                type="number"
                                min="1"
                                required
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white font-mono focus:outline-none focus:border-brand-gold/60"
                                value={editMaxGuests}
                                onChange={(e) => setEditMaxGuests(Number(e.target.value))}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] uppercase font-bold text-white/45">
                                Порог для скидки (от чел.)
                              </label>
                              <input
                                type="number"
                                min="0"
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white font-mono focus:outline-none focus:border-brand-gold/60"
                                placeholder="0 = выкл"
                                value={editDiscountThreshold || ""}
                                onChange={(e) => setEditDiscountThreshold(Number(e.target.value))}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] uppercase font-bold text-white/45">
                                Величина скидки (%)
                              </label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white font-mono focus:outline-none focus:border-brand-gold/60"
                                placeholder="Например, 10"
                                value={editDiscountPercent || ""}
                                onChange={(e) => setEditDiscountPercent(Number(e.target.value))}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-bold text-white/60">Ссылка на изображение</label>
                          <input
                            type="text"
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none"
                            value={editImg}
                            onChange={(e) => setEditImg(e.target.value)}
                          />
                        </div>

                        <div className="space-y-1.5 md:col-span-2">
                          <label className="text-[10px] uppercase font-bold text-white/60">Краткое описание на карточке</label>
                          <textarea
                            rows={3}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white leading-relaxed resize-none"
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                          />
                        </div>

                        {/* Extras option editing */}
                        <div className="space-y-2 md:col-span-2 border-t border-white/5 pt-3">
                          <span className="text-[10px] uppercase font-bold text-brand-gold block">
                            Сопутствующие платные опции (калькуляция стоимости):
                          </span>

                          {editExtras.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {editExtras.map((opt, oIdx) => (
                                <span key={oIdx} className="inline-flex items-center gap-1 text-[10px] font-bold bg-white/5 border border-white/5 text-[#74d5a6] px-2.5 py-1 rounded-lg">
                                  {opt.name} (+{opt.price} ₽)
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveExtraOption(oIdx)}
                                    className="text-red-400 hover:text-white font-extrabold ml-1 cursor-pointer"
                                  >
                                    ✕
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="flex gap-2 max-w-md pt-1">
                            <input
                              type="text"
                              className="flex-1 bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                              placeholder="Новая опция..."
                              value={tempExtraName}
                              onChange={(e) => setTempExtraName(e.target.value)}
                            />
                            <input
                              type="number"
                              className="w-20 bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                              placeholder="Цена ₽"
                              value={tempExtraPrice}
                              onChange={(e) => setTempExtraPrice(e.target.value)}
                            />
                            <button
                              type="button"
                              onClick={handleAddExtraOption}
                              className="px-3 bg-brand-gold text-dark-bg font-extrabold text-[10px] rounded-lg cursor-pointer hover:bg-white"
                            >
                              ✚ Опция
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-3 border-t border-white/5">
                        <button
                          type="submit"
                          className="px-5 py-2.5 rounded-xl bg-brand-gold hover:bg-brand-gold-hover text-dark-bg font-bold text-xs cursor-pointer flex items-center gap-1.5"
                        >
                          <Save className="h-3.5 w-3.5" />
                          Сохранить изменения
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingCardId(null)}
                          className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-xs"
                        >
                          Отмена
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {activeTab === "leads" && (
        <div className="space-y-4 animate-fade-in" id="dash-panel-leads">
          
          {/* Monthly Billing & Commissions Summary Panel */}
          <div className="p-6 rounded-3xl border border-brand-gold/20 bg-gradient-to-br from-dark-card to-black/40 shadow-xl space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 bg-brand-gold/10 rounded-bl-2xl text-[9px] font-mono tracking-wider text-brand-gold uppercase font-bold border-l border-b border-brand-gold/25">
              Мониторинг финансов ({partnerSession.level})
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#74d5a6] flex items-center gap-1.5">
                  <DollarSign className="h-4.5 w-4.5 text-brand-green" />
                  Финансовый биллинг и выплаты
                </h3>
                <p className="text-xs text-white/50 font-light mt-1 text-left">
                  Расчет агентской комиссии платформы и чистой выплаты на СБП / расчетный счет.
                </p>
              </div>

              <div className="flex items-center gap-2 font-sans self-start">
                <span className="text-xs text-white/60">Период расчета:</span>
                <select
                  value={selectedBillingMonth}
                  onChange={(e) => {
                    setSelectedBillingMonth(e.target.value);
                    setPayoutRequested(false);
                  }}
                  className="bg-black/60 border border-white/10 rounded-xl px-3.5 py-1.5 text-xs text-brand-gold focus:outline-none focus:border-brand-gold font-semibold font-mono"
                >
                  <option value="2026-06">Июнь 2026 (Текущий)</option>
                  <option value="2026-07">Июль 2026 (Будущий)</option>
                  <option value="2026-05">Май 2026 (Архив)</option>
                </select>
              </div>
            </div>

            {/* Calculations metrics grid */}
            {(() => {
              const levelName = partnerSession.level || "";
              const isPrem = levelName.toLowerCase().includes("премиум") || levelName.toLowerCase().includes("premium") || levelName.includes("Стандарт плюс");
              const commissionRate = isPrem ? 2 : 5; // 2% for premium level, else 5%
              
              const isMonthMatch = (leadDateStr: string, monthVal: string) => {
                if (monthVal === "2026-06") {
                  return leadDateStr.toLowerCase().includes("июн") || leadDateStr.toLowerCase().includes("сегодня") || leadDateStr.toLowerCase().includes("вчера");
                } else if (monthVal === "2026-07") {
                  return leadDateStr.toLowerCase().includes("июл");
                } else if (monthVal === "2026-05") {
                  return leadDateStr.toLowerCase().includes("мая");
                }
                return true;
              };

              const monthLeads = leadsList.filter(l => isMonthMatch(l.date, selectedBillingMonth));
              const completedLeads = monthLeads.filter(l => l.status === "done");
              
              const totalGross = completedLeads.reduce((sum, l) => sum + l.amount, 0);
              const totalCommission = Math.round((totalGross * commissionRate) / 100);
              const netPayout = Math.max(0, totalGross - totalCommission);

              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2 text-left">
                    <div className="p-4 rounded-2xl bg-white/2 border border-white/5 space-y-1">
                      <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider block">Успешные сделки</span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-lg font-bold text-white font-mono">{completedLeads.length}</span>
                        <span className="text-[10px] text-white/50">из {monthLeads.length} лидов</span>
                      </div>
                      <span className="text-[10px] text-white/30 block font-mono">Гросс оборот: {totalGross.toLocaleString("ru")} ₽</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/2 border border-white/5 space-y-1">
                      <span className="text-[10px] text-brand-gold uppercase font-bold tracking-wider block">Сбор The One Point</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-bold text-brand-gold font-mono">-{totalCommission.toLocaleString("ru")} ₽</span>
                        <span className="text-[9px] font-bold bg-brand-gold/10 text-brand-gold px-1.5 py-0.5 rounded uppercase">{commissionRate}% тариф</span>
                      </div>
                      <span className="text-[10px] text-white/30 block">{isPrem ? "Скидка Premium-партнера применена" : "+3% экономии при Premium"}</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-brand-green/5 border border-brand-green/20 space-y-1">
                      <span className="text-[10px] text-[#74d5a6] uppercase font-bold tracking-wider block font-sans">Чистая выплата</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-black text-[#74d5a6] font-mono">{netPayout.toLocaleString("ru")} ₽</span>
                      </div>
                      <span className="text-[10px] text-white/40 block">Автовывод по графику клиринга</span>
                    </div>
                  </div>

                  {/* Payout actions row */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/5">
                    <div className="text-[10.5px] text-white/50 font-light flex items-center gap-1 text-left">
                      <Info className="h-3.5 w-3.5 text-brand-gold shrink-0" />
                      <span>Выплаты формируются автоматически 10-го числа каждого расчетного месяца.</span>
                    </div>

                    {netPayout > 0 ? (
                      payoutRequested ? (
                        <div className="py-2 px-4 rounded-xl bg-brand-green/20 text-brand-green font-bold text-[10.5px] uppercase tracking-wider flex items-center gap-1.5 border border-brand-green/45 animate-pulse">
                          <Check className="h-3.5 w-3.5" />
                          <span>Заявка обрабатывается • Средства отправлены</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setPayoutRequested(true);
                          }}
                          className="px-4.5 py-2 rounded-xl bg-brand-green hover:bg-brand-green-hover text-dark-bg font-bold text-[11px] uppercase tracking-wider cursor-pointer shadow-md duration-200 transition-all hover:scale-[1.02]"
                        >
                          Вывести досрочно на СБП ⚡
                        </button>
                      )
                    ) : (
                      <button
                        disabled
                        className="px-4.5 py-2 rounded-xl bg-white/5 text-white/20 border border-white/5 font-bold text-[11px] uppercase tracking-wider cursor-not-allowed"
                      >
                        Нет средств к выводу
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Tab view mode controls & Filter Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-dark-card/50 border border-white/10 rounded-2xl">
            <div className="flex items-center gap-2 text-left">
              <span className="text-xs uppercase font-extrabold tracking-widest text-[#74d5a6] bg-brand-green/10 px-2 py-0.5 rounded border border-brand-green/20 font-mono">
                B2B CRM
              </span>
              <h3 className="text-sm font-light text-white hidden sm:block font-sans">
                Заказы и загруженность
              </h3>
            </div>
            
            <div className="flex items-center gap-3 self-end sm:self-auto flex-wrap sm:flex-nowrap">
              {/* List tab filters */}
              {leadsViewMode === "list" && (
                <div className="flex gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
                  {[
                    { id: "all", label: "Все" },
                    { id: "new", label: "Новые" },
                    { id: "progress", label: "В работе" },
                    { id: "done", label: "Закрытые" }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setLeadFilter(opt.id as any)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        leadFilter === opt.id
                          ? "bg-brand-gold/20 text-brand-gold border border-brand-gold/20 font-bold"
                          : "text-white/60 hover:text-white"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}

              {/* View mode switcher */}
              <div className="flex items-center gap-1 bg-white/3 p-1 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setLeadsViewMode("list")}
                  className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                    leadsViewMode === "list"
                      ? "bg-brand-gold text-dark-bg font-black"
                      : "text-white/60 hover:text-white"
                  }`}
                  title="Список сделок"
                >
                  <List className="h-4 w-4" />
                  <span className="hidden md:inline">Списком</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLeadsViewMode("calendar")}
                  className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                    leadsViewMode === "calendar"
                      ? "bg-brand-gold text-dark-bg font-black"
                      : "text-white/60 hover:text-white"
                  }`}
                  title="Календарь занятости"
                >
                  <CalendarDays className="h-4 w-4" />
                  <span className="hidden md:inline">Календарь</span>
                </button>
              </div>
            </div>
          </div>

          {/* LEADS LIST VIEW WITH BULK ACTIONS */}
          {leadsViewMode === "list" && (
            <div className="space-y-3">
              
              {/* Bulk actions status / Select all row */}
              <div className="py-2.5 px-4 rounded-xl bg-white/2 border border-white/5 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const visibleIds = filteredLeads.map(l => l.id);
                      const allSelected = visibleIds.every(id => selectedLeadIds.includes(id));
                      if (allSelected) {
                        // Unselect all visible
                        setSelectedLeadIds(prev => prev.filter(id => !visibleIds.includes(id)));
                      } else {
                        // Select all visible
                        setSelectedLeadIds(prev => Array.from(new Set([...prev, ...visibleIds])));
                      }
                    }}
                    className="flex items-center gap-1.5 text-white/70 hover:text-white cursor-pointer select-none font-medium"
                  >
                    {filteredLeads.length > 0 && filteredLeads.map(l => l.id).every(id => selectedLeadIds.includes(id)) ? (
                      <CheckSquare className="h-4 w-4 text-brand-gold" />
                    ) : (
                      <Square className="h-4 w-4 text-white/35" />
                    )}
                    <span>Выбрать все в списке ({filteredLeads.length})</span>
                  </button>
                </div>

                {selectedLeadIds.length > 0 && (
                  <span className="font-semibold text-brand-gold font-mono uppercase text-[10px]">
                    Выделено: {selectedLeadIds.length} броней
                  </span>
                )}
              </div>

              {/* Bulk Actions Bar (Sticky / Highlighted absolute) */}
              {selectedLeadIds.length > 0 && (
                <div className="p-4 rounded-2xl bg-brand-gold/10 border border-brand-gold/30 flex flex-col md:flex-row items-center justify-between gap-3.5 text-left animate-slide-in">
                  <div className="space-y-0.5">
                    <h5 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <CheckSquare className="h-4 w-4 text-brand-gold" />
                      Групповой менеджмент сделок ({selectedLeadIds.length})
                    </h5>
                    <p className="text-[10px] text-white/60">
                      Будет произведено массовое обновление статусов для {selectedLeadIds.length} выделенных участников СБП клиринга.
                    </p>
                  </div>

                  <div className="flex gap-2 w-full md:w-auto self-stretch md:self-auto">
                    <button
                      onClick={() => handleBulkUpdateStatus("progress")}
                      className="flex-1 md:flex-initial py-2 px-3.5 bg-brand-gold hover:bg-brand-gold-hover text-dark-bg font-bold text-[10px] uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Check className="h-3 w-3" />
                      В работу
                    </button>

                    <button
                      onClick={() => handleBulkUpdateStatus("done")}
                      className="flex-1 md:flex-initial py-2 px-3.5 bg-brand-green hover:bg-brand-green-hover text-dark-bg font-bold text-[10px] uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Check className="h-3 w-3" />
                      Закрыть сделки
                    </button>

                    <button
                      onClick={() => setSelectedLeadIds([])}
                      className="py-2 px-3 bg-white/5 hover:bg-white/10 text-white font-medium text-[10px] uppercase rounded-xl transition-all cursor-pointer"
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              )}

              {/* Leads actual list rendering */}
              {filteredLeads.length > 0 ? (
                <div className="space-y-3">
                  {filteredLeads.map((lead) => {
                    const isExpanded = expandedLeadId === lead.id;
                    const isSelected = selectedLeadIds.includes(lead.id);
                    const isNewUnread = !viewedLeadIds.includes(lead.id);

                    const statusColors = {
                      new: "bg-brand-gold/15 text-brand-gold border-brand-gold/30",
                      progress: "bg-blue-400/15 text-blue-400 border-blue-400/30",
                      done: "bg-[#71f0bc]/15 text-[#71f0bc] border-[#71f0bc]/30",
                      cancelled: "bg-red-405/15 text-red-400 border-red-400/30"
                    };

                    return (
                      <div
                        key={lead.id}
                        id={`lead-profile-card-${lead.id}`}
                        className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                          isExpanded ? "border-brand-gold bg-brand-gold/3 shadow-lg" : "border-white/10 bg-dark-card hover:border-white/20"
                        } ${isSelected ? "border-brand-gold/50 bg-brand-gold/2" : ""} ${
                          isNewUnread ? "ring-1 ring-brand-gold/30 bg-brand-gold/[0.01]" : ""
                        }`}
                      >
                        {/* Lead basic banner row */}
                        <div
                          onClick={() => handleToggleExpandLead(lead.id)}
                          className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none"
                        >
                          <div className="flex gap-3 sm:gap-4 items-center flex-1">
                            {/* Checkbox item */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedLeadIds(prev =>
                                  prev.includes(lead.id) ? prev.filter(id => id !== lead.id) : [...prev, lead.id]
                                );
                              }}
                              className="text-white/40 hover:text-white cursor-pointer p-1 rounded-lg shrink-0"
                            >
                              {isSelected ? (
                                <CheckSquare className="h-4.5 w-4.5 text-brand-gold" />
                              ) : (
                                <Square className="h-4.5 w-4.5 text-white/20 hover:text-white/40" />
                              )}
                            </button>

                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gold/10 text-brand-gold text-sm font-bold shrink-0 shadow-sm font-sans uppercase">
                              {lead.name[0]}
                            </div>
                            
                            <div className="min-w-0 text-left">
                              <h4 className="text-sm font-semibold text-white truncate flex items-center gap-1.5">
                                {lead.name}
                                {isNewUnread && (
                                  <span className="h-2 w-2 rounded-full bg-brand-gold animate-pulse shadow-[0_0_8px_rgba(217,175,99,0.8)] shrink-0" />
                                )}
                              </h4>
                              <p className="text-xs text-white/55 mt-0.5 truncate">
                                {lead.service} • {lead.guests} чел. • {lead.date}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3.5 justify-between sm:justify-start pl-8 sm:pl-0">
                            <span className="text-sm font-bold font-mono text-brand-gold">
                              {lead.amount.toLocaleString("ru")} ₽
                            </span>
                            <span className={`text-[9.5px] uppercase font-bold tracking-wider border px-2.5 py-1 rounded-full ${statusColors[lead.status]}`}>
                              {lead.status === "new" ? "Новый" : lead.status === "progress" ? "В работе" : lead.status === "done" ? "Закрыт" : "Отменен"}
                            </span>
                          </div>
                        </div>

                        {/* Expanded details with immersive chat center client communication */}
                        {isExpanded && (
                          <div className="p-5 bg-black/40 border-t border-white/5 space-y-4 text-xs font-light tracking-wide leading-relaxed animate-fade-in text-white/85">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-3 border-b border-white/5 text-left">
                              <div className="space-y-1">
                                <span className="text-[9px] text-white/30 uppercase block font-mono font-bold">Личные данные отдыхающего</span>
                                <span className="text-white font-medium block font-sans">{lead.name}</span>
                                <span className="text-white/60 block">{lead.email}</span>
                                <span className="text-white/65 font-mono block">{lead.phone}</span>
                              </div>
                              <div className="space-y-1">
                                <span className="text-[9px] text-white/30 uppercase block font-mono font-bold">Параметры брони</span>
                                <span className="text-white font-medium block font-sans">{lead.service}</span>
                                <span className="text-white/60 block">Количество гостей: {lead.guests} чел.</span>
                                <span className="text-white/60 block">Дата выезда: {lead.date}</span>
                              </div>
                              <div className="space-y-1">
                                <span className="text-[9px] text-white/30 uppercase block font-mono font-bold">Финансовый расчет</span>
                                <span className="text-brand-gold font-bold font-mono text-sm block">
                                  {lead.amount.toLocaleString("ru")} ₽
                                </span>
                                <span className="text-white/40 block">Включена комиссия {partnerSession.level.includes("Premium") ? "2%" : "5%"}</span>
                                <span className="text-[#71f0bc] block font-mono text-[10px]">✓ Безопасный эквайринг зафиксирован</span>
                              </div>
                            </div>

                            {/* Chat with Client - Nested Instant Messenger UI */}
                            <div className="space-y-3 p-4 bg-black/50 border border-white/5 rounded-2xl">
                              <div className="flex items-center justify-between border-b border-white/5 pb-2 select-none">
                                <div className="flex items-center gap-2">
                                  <MessageCircle className="h-4 w-4 text-brand-gold" />
                                  <span className="font-bold text-[10px] text-[#d6b36a] uppercase tracking-wider">
                                    Чат по бронированию: {lead.name}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="h-1.5 w-1.5 rounded-full bg-brand-green animate-pulse"></span>
                                  <span className="text-[9px] font-mono text-brand-green uppercase font-bold">Клиент онлайн</span>
                                </div>
                              </div>

                              {/* Message bubble stream scroll container */}
                              <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                                {lead.comments.map((cmd, cIdx) => {
                                  let bubbleClass = "";
                                  let label = "";
                                  
                                  if (cmd.author === "Система") {
                                    return (
                                      <div key={cIdx} className="flex justify-center my-1 select-none">
                                        <span className="text-[9px] font-mono font-semibold text-white/35 bg-white/2 border border-white/5 rounded-full px-3 py-1">
                                          ⚙️ {cmd.text} — {cmd.time}
                                        </span>
                                      </div>
                                    );
                                  } else if (cmd.author === "Клиент") {
                                    bubbleClass = "bg-white/5 text-white mr-auto text-left border border-white/5";
                                    label = lead.name;
                                  } else {
                                    bubbleClass = "bg-brand-gold/10 text-white ml-auto text-left border border-brand-gold/20";
                                    label = "Вы (Организатор)";
                                  }

                                  const isUnread = cmd.read === false;

                                  return (
                                    <div key={cIdx} className={`max-w-[85%] rounded-2xl p-3 space-y-1 ${bubbleClass}`}>
                                      <div className="flex items-center justify-between gap-4 select-none">
                                        <span className="text-[10px] font-extrabold text-brand-gold">{label}</span>
                                        <span className="text-[9px] text-white/30 font-mono">{cmd.time}</span>
                                      </div>
                                      <p className="text-xs font-light leading-relaxed select-text">{cmd.text}</p>
                                      
                                      {/* Read/Unread status tracker */}
                                      {cmd.author !== "Система" && (
                                        <div className="flex justify-end pt-0.5 select-none">
                                          {isUnread ? (
                                            <span className="text-[8.5px] font-extrabold text-white/30 bg-white/5 px-2 py-0.5 rounded-full font-mono tracking-wider uppercase">
                                              Не прочитано
                                            </span>
                                          ) : (
                                            <span className="text-[8.5px] font-extrabold text-[#71f0bc] bg-[#71f0bc]/10 border border-[#71f0bc]/20 px-2 py-0.5 rounded-full font-mono flex items-center gap-0.5 tracking-wider uppercase">
                                              ✓✓ Прочитано
                                            </span>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}

                                {/* Simulated traveler dynamic typing indicator */}
                                {travelerTypingId === lead.id && (
                                  <div className="flex items-center gap-2 text-[10px] text-brand-gold font-medium bg-brand-gold/5 border border-brand-gold/10 p-2.5 rounded-xl max-w-xs transition-all animate-pulse">
                                    <Loader2 className="h-3 w-3 animate-spin text-brand-gold" />
                                    <span>{lead.name} пишет ответ...</span>
                                  </div>
                                )}
                              </div>

                              {/* Preset quick answer template suggestions row */}
                              <div className="pt-2 border-t border-white/5">
                                <span className="block text-[9px] uppercase font-mono tracking-widest text-white/30 mb-1.5 select-none text-left">Быстрые шаблоны ответов:</span>
                                <div className="flex flex-wrap gap-1.5">
                                  {[
                                    "👋 Приветствуем! Все забронировано, очень вас ждем!",
                                    "🚙 Трансфер отправляется строго в назначенное время.",
                                    "🌦️ Погода отличная, рекомендуем удобную обувь.",
                                    "👍 Принято, контакты вашего гида отправили по СМС."
                                  ].map((tpl, tIdx) => (
                                    <button
                                      type="button"
                                      key={tIdx}
                                      onClick={() => {
                                        // Auto-send selected quick reply!
                                        setLeadsList(prev =>
                                          prev.map(item => {
                                            if (item.id === lead.id) {
                                              return {
                                                ...item,
                                                comments: [
                                                  ...item.comments,
                                                  { text: tpl, time: "только что", author: "Партнёр" }
                                                ]
                                              };
                                            }
                                            return item;
                                          })
                                        );
                                        // Simulate client response
                                        setTravelerTypingId(lead.id);
                                        setTimeout(() => {
                                          setLeadsList(prevList =>
                                            prevList.map(item => {
                                              if (item.id === lead.id) {
                                                return {
                                                  ...item,
                                                  comments: [
                                                    ...item.comments,
                                                    { text: "Спасибочки за информацию! 👍 Всё понятно.", time: "только что", author: "Клиент" }
                                                  ]
                                                } as any;
                                              }
                                              return item;
                                            })
                                          );
                                          setTravelerTypingId(null);
                                        }, 1400);
                                      }}
                                      className="py-1 px-2 text-[9.5px] font-medium rounded-lg bg-white/5 border border-white/5 hover:border-brand-gold/30 hover:bg-brand-gold/5 text-white/70 transition-colors text-left cursor-pointer truncate max-w-[285px]"
                                      title="Отправить мгновенный шаблонный ответ"
                                    >
                                      {tpl}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Input messenger area form */}
                              <form
                                onSubmit={(e) => handleAddComment(lead.id, e)}
                                className="flex gap-2 pt-2 border-t border-white/5"
                              >
                                <input
                                  type="text"
                                  className="flex-1 bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-gold/60 focus:ring-1 focus:ring-brand-gold/30"
                                  placeholder="Напечатайте сообщение клиенту в чат..."
                                  value={newCommentText}
                                  onChange={(e) => setNewCommentText(e.target.value)}
                                />
                                <button
                                  type="submit"
                                  className="px-4.5 py-2.5 rounded-xl bg-brand-gold hover:bg-brand-gold-hover text-dark-bg font-bold text-xs flex items-center gap-1 cursor-pointer duration-200"
                                >
                                  <Send className="h-3 w-3" />
                                  <span>Отправить</span>
                                </button>
                              </form>
                            </div>

                            {/* Standard Action buttons */}
                            <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5 text-left">
                              {lead.status === "new" && (
                                <button
                                  id={`btn-accept-lead-${lead.id}`}
                                  onClick={() => handleUpdateLeadStatus(lead.id, "progress")}
                                  className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl bg-brand-gold hover:bg-brand-gold-hover text-dark-bg font-bold text-[11px] uppercase tracking-wide cursor-pointer shadow-md duration-200"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                  Взять в работу
                                </button>
                              )}
                              {lead.status === "progress" && (
                                <button
                                  id={`btn-done-lead-${lead.id}`}
                                  onClick={() => handleUpdateLeadStatus(lead.id, "done")}
                                  className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl bg-[#71f0bc]/10 hover:bg-[#71f0bc]/20 border border-[#71f0bc]/30 text-[#71f0bc] font-bold text-[11px] uppercase tracking-wide cursor-pointer shadow-md duration-200"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                  Закрыть сделку и принять оплату
                                </button>
                              )}

                              {lead.status !== "cancelled" && (
                                <button
                                  id={`btn-cancel-lead-${lead.id}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    
                                    // Update lead list status
                                    setLeadsList(prev =>
                                      prev.map(l => {
                                        if (l.id === lead.id) {
                                          return {
                                            ...l,
                                            status: "cancelled",
                                            comments: [
                                              ...l.comments,
                                              { text: "Заказ отменен партнером. Клиенту автоматически отправлено СМС-уведомление об отмене бронирования.", time: "только что", author: "Система" }
                                            ]
                                          };
                                        }
                                        return l;
                                      })
                                    );

                                    // Display toast notice
                                    showToast(`Заказ №${lead.id} успешно отменен. Клиент ${lead.name} уведомлен автоматически по SMS и Email! ✉`, "error");
                                    
                                    // Trigger activity log event
                                    addActivityEvent?.(
                                      `Отмена заказа №${lead.id} партнером "${partnerSession.company}" (Клиент: ${lead.name}, тур: ${lead.service})`,
                                      "booking",
                                      "warning"
                                    );
                                  }}
                                  className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold text-[11px] uppercase tracking-wide cursor-pointer shadow-md duration-200"
                                >
                                  <X className="h-3.5 w-3.5" />
                                  Быстрая отмена
                                </button>
                              )}

                              <a
                                href={`tel:${lead.phone}`}
                                onClick={(e) => e.stopPropagation()}
                                className="px-4.5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-[11px] uppercase tracking-wide text-center"
                              >
                                Позвонить на Смартфон
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16 rounded-3xl border border-dashed border-white/15 bg-white/2">
                  <p className="text-sm font-semibold text-white/50">Заказы с выбранным статусом отсутствуют</p>
                  <p className="text-xs text-white/30 mt-1">Измените фильтр или подождите поступления новых лидов на платформу</p>
                </div>
              )}
            </div>
          )}

          {/* MONTHLY CALENDAR CAPACITY VIEW */}
          {leadsViewMode === "calendar" && (
            <div className="space-y-4 animate-fade-in text-left">
              <div className="p-4 rounded-2xl bg-white/2 border border-white/5 flex items-center justify-between gap-3 text-xs select-none">
                <span className="font-semibold text-white/80">Календарная сетка: <strong className="text-brand-gold">Июнь 2026</strong></span>
                <span className="text-[10px] text-white/40 block font-mono uppercase">Карелия • Пик сезона • Текущая бронь</span>
              </div>

              {/* True monthly grid layout */}
              <div className="p-4 bg-dark-card rounded-3xl border border-white/10 shadow-2xl space-y-3">
                
                {/* Visual indicator / Legend */}
                <div className="flex gap-4 text-[10px] font-mono font-medium text-white/50 border-b border-white/5 pb-3 justify-center select-none">
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-brand-gold"></span> Новый (New)</span>
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-400"></span> В работе (Progress)</span>
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-brand-green"></span> Закрыт (Done)</span>
                </div>

                {/* Week Day Titles */}
                <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-bold text-white/45 uppercase tracking-widest py-1 border-b border-white/5">
                  <div>Пн</div>
                  <div>Вт</div>
                  <div>Ср</div>
                  <div>Чт</div>
                  <div>Пт</div>
                  <div className="text-brand-gold/85">Сб</div>
                  <div className="text-brand-gold/85">Вс</div>
                </div>

                {/* Days Grid - June 2026 starts on Monday */}
                <div className="grid grid-cols-7 gap-1.5 md:gap-2.5 pt-1">
                  {(() => {
                    const days = Array.from({ length: 30 }, (_, i) => i + 1);
                    
                    // Simple helper to assign days
                    const getLeadCalendarDay = (lead: any): number => {
                      if (lead.date.includes("Сегодня")) return 9;
                      if (lead.date.includes("Вчера")) return 8;
                      const match = lead.date.trim().match(/^(\d+)/);
                      if (match) return parseInt(match[1], 10);
                      return ((lead.id * 11) % 28) + 1; // Fallback helper to populate full calendar
                    };

                    return days.map((day) => {
                      const dayBookings = leadsList.filter(l => getLeadCalendarDay(l) === day);
                      const isToday = day === 9; // June 9, 2026 represents representative local time

                      return (
                        <div
                          key={day}
                          className={`min-h-[75px] sm:min-h-[105px] rounded-xl p-1.5 sm:p-2.5 transition-all text-left flex flex-col justify-between ${
                            isToday 
                              ? "bg-brand-gold/15 border-2 border-brand-gold" 
                              : "bg-white/2 border border-white/5 hover:bg-white/4 hover:border-white/10"
                          }`}
                        >
                          <div className="flex items-center justify-between select-none">
                            <span className={`text-[10px] font-bold ${
                              isToday ? "text-brand-gold font-extrabold" : "text-white/45"
                            }`}>{day}</span>
                            {isToday && (
                              <span className="text-[7px] bg-brand-gold text-dark-bg font-extrabold px-1 rounded uppercase tracking-tighter shrink-0 select-none">
                                Сег.
                              </span>
                            )}
                          </div>

                          {/* Day bookings bullet list */}
                          <div className="flex-1 flex flex-col gap-1 justify-end pt-1.5">
                            {dayBookings.map((b) => {
                              const badgeColor = b.status === "new" ? "bg-brand-gold" : b.status === "progress" ? "bg-blue-400" : "bg-[#71f0bc]";
                              return (
                                <button
                                  key={b.id}
                                  onClick={() => {
                                    setExpandedLeadId(b.id);
                                    setLeadsViewMode("list");
                                  }}
                                  className="w-full text-left p-1 rounded bg-black/50 hover:bg-black/90 text-white border border-white/5 transition-all overflow-hidden cursor-pointer"
                                  title={`Заказчик: ${b.name}\n${b.service}\nСумма: ${b.amount} ₽`}
                                >
                                  <div className="flex items-center gap-1">
                                    <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${badgeColor}`}></span>
                                    <span className="text-[7.5px] font-semibold text-white/90 truncate block max-w-full font-mono">
                                      {b.name.split(" ")[0]}
                                    </span>
                                  </div>
                                  <span className="text-[7px] text-white/50 block truncate max-w-full leading-tight font-light select-none">
                                    {b.service}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Small instructions banner */}
              <div className="p-4 rounded-2xl bg-white/2 border border-white/5 text-[11px] font-medium text-white/55 leading-relaxed text-center select-none">
                💡 Вы можете нажать на любой забронированный билет в календарной сетке, чтобы мгновенно перейти в CRM-карточку сделки и начать переписку в ЧАТЕ с клиентом!
              </div>
            </div>
          )}

        </div>
      )}

      {activeTab === "reviews" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in" id="dash-panel-reviews">
          {/* Incoming reviews on hold */}
          <div className="p-6 rounded-3xl border border-white/10 bg-dark-card/60 space-y-4">
            <h3 className="text-xs uppercase font-bold tracking-widest text-[#d6b36a]">
              На модерации ({onHoldReviews.filter(r => !r.approved).length})
            </h3>

            <div className="space-y-3">
              {onHoldReviews.filter((r) => !r.approved).length > 0 ? (
                onHoldReviews
                  .filter((r) => !r.approved)
                  .map((rev) => (
                    <div key={rev.id} className="p-4 rounded-xl border border-white/5 bg-black/20 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-semibold text-white block text-sm">{rev.author}</span>
                          <span className="text-[10px] text-white/30 block mt-0.5">Карточка: {rev.service}</span>
                        </div>
                        <div className="flex gap-0.5 text-brand-gold font-bold text-xs select-none">
                          {Array.from({ length: rev.rating }).map((_, i) => "★")}
                        </div>
                      </div>

                      <p className="text-xs font-light text-white/70 leading-relaxed italic">
                        « {rev.text} »
                      </p>

                      <div className="flex gap-2 pt-2 border-t border-white/5">
                        <button
                          id={`approve-rev-btn-${rev.id}`}
                          onClick={() => handleApproveReview(rev.id)}
                          className="px-3.5 py-1.5 rounded-lg bg-brand-green/10 hover:bg-brand-green/20 text-brand-green text-[11px] font-bold border border-brand-green/30"
                        >
                          Опубликовать
                        </button>
                        <button
                          onClick={() => alert("Отзыв отклонён и удалён из тикетов")}
                          className="px-3.5 py-1.5 rounded-lg bg-red-400/10 hover:bg-red-400/20 text-red-400 text-[11px] font-bold border border-red-400/30"
                        >
                          Отклонить
                        </button>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-xs text-white/45 text-center py-6">
                  Нет новых отзывов на модерации. Все отзывы опубликованы!
                </div>
              )}
            </div>
          </div>

          {/* Approved testimonials */}
          <div className="p-6 rounded-3xl border border-white/10 bg-dark-card/60 space-y-4">
            <h3 className="text-xs uppercase font-bold tracking-widest text-brand-green">
              Опубликованные на витрине
            </h3>

            <div className="space-y-3">
              {onHoldReviews.filter((r) => r.approved).length > 0 ? (
                onHoldReviews
                  .filter((r) => r.approved)
                  .map((rev) => (
                    <div key={rev.id} className="p-4 rounded-xl border border-brand-green/10 bg-brand-green/3 space-y-2">
                      <div className="flex justify-between">
                        <span className="font-semibold text-white block text-sm">{rev.author}</span>
                        <div className="flex gap-0.5 text-brand-gold font-bold text-xs">
                          {Array.from({ length: rev.rating }).map((_, i) => "★")}
                        </div>
                      </div>
                      <p className="text-xs font-light text-white/80 leading-relaxed italic">
                        {rev.text}
                      </p>
                      <span className="text-[10px] text-brand-green font-bold block">✓ Активен в каталоге</span>
                    </div>
                  ))
              ) : (
                <div className="text-xs text-white/35 text-center py-6 leading-relaxed">
                  Опубликуйте отзывы из левой панели, чтобы они начали отображаться гостям в каталоге и заслужили доверие.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* NEW PROFILE TAB (корректировка данных партнёра) */}
      {activeTab === "profile" && (
        <div className="space-y-6 animate-fade-in" id="dash-panel-profile">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Live profile preview layout */}
            <div className="p-6 rounded-3xl border border-white/10 bg-dark-card/60 space-y-5 h-fit">
              <span className="text-[10px] tracking-widest uppercase font-bold text-brand-gold block">
                Предпросмотр профиля компании
              </span>

              <div className="text-center space-y-3 pb-4 border-b border-white/5">
                <div className="relative h-20 w-20 mx-auto rounded-3xl border border-white/10 bg-black/40 p-1 overflow-hidden flex items-center justify-center">
                  <img
                    className="h-full w-full object-cover rounded-2xl"
                    src={profileLogo}
                    alt="Current Brand Logo"
                    onError={(e) => {
                      (e.target as any).src = "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=150&q=80";
                    }}
                  />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white tracking-wide">{profileCompany || "Karelia Outdoor"}</h4>
                  <span className="text-[10px] font-mono tracking-widest text-[#74d5a6] uppercase">
                    Статус: {partnerSession.level || "Premium"}
                  </span>
                </div>
              </div>

              <div className="space-y-3.5 text-xs font-light">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-bold text-white/30 block">Электронная почта</span>
                  <span className="text-white bg-black/30 px-3 py-1.5 rounded-lg block border border-white/5 font-mono">{profileEmail}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-bold text-white/30 block">Телефон координатора</span>
                  <span className="text-white bg-black/30 px-3 py-1.5 rounded-lg block border border-white/5 font-mono">{profilePhone}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-bold text-white/30 block">Веб-ресурс / Ссылка</span>
                  <span className="text-brand-gold bg-black/30 px-3 py-1.5 rounded-lg block border border-white/5 font-mono truncate">{profileWebsite}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-bold text-white/30 block">О компании</span>
                  <p className="text-white/60 leading-relaxed bg-black/10 p-3 rounded-lg border border-white/5 text-[11px] italic">
                    « {profileDesc} »
                  </p>
                </div>
              </div>
            </div>

            {/* Editing settings form fields */}
            <div className="lg:col-span-2 p-6 rounded-3xl border border-white/10 bg-dark-card/90 space-y-6">
              <div>
                <h3 className="text-lg font-light text-white">Редактирование реквизитов партнёра</h3>
                <p className="text-xs text-white/45">Обновите ваши публичные данные. Изменения применятся ко всем вашим предложениям на платформе.</p>
              </div>

              {profileSuccess && (
                <div className="p-4 rounded-xl border border-brand-green/30 bg-brand-green/10 text-brand-green text-xs font-bold flex items-center gap-2 animate-fade-in animate-none">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-brand-green animate-ping"></span>
                  Изменения в профиле успешно сохранены и синхронизированы!
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-white/60">Название организации / Бренд</label>
                    <input
                      type="text"
                      required
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-semibold focus:outline-none focus:border-brand-gold/60"
                      value={profileCompany}
                      onChange={(e) => setProfileCompany(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-white/60">Email для уведомлений</label>
                    <input
                      type="email"
                      required
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-brand-gold/60"
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-white/60">Контактный телефон</label>
                    <input
                      type="text"
                      required
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-brand-gold/60"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-white/60">Веб-сайт или Telegram аккаунт</label>
                    <input
                      type="text"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-brand-gold/60"
                      value={profileWebsite}
                      onChange={(e) => setProfileWebsite(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] uppercase font-bold text-white/60">Ссылка на логотип (прямой URL к картинке)</label>
                    <div className="flex gap-2.5 items-center">
                      <input
                        type="text"
                        className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-gold/60"
                        placeholder="https://images.unsplash.com/..."
                        value={profileLogo}
                        onChange={(e) => setProfileLogo(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setProfileLogo("https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=150&q=80")}
                        className="p-2 border border-white/10 text-[10px] rounded-lg bg-white/5 font-semibold text-white/60 hover:text-white shrink-0 cursor-pointer"
                        title="Сбросить на значение Сортавалы"
                      >
                        Сбросить
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] uppercase font-bold text-white/60">Детальное описание деятельности и миссии</label>
                    <textarea
                      rows={4}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-gold/60 font-light resize-none leading-relaxed"
                      placeholder="Опишите ваши ключевые преимущества, например: Качественные услуги катеров, гиды с лицензией, собственный парк..."
                      value={profileDesc}
                      onChange={(e) => setProfileDesc(e.target.value)}
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5 flex gap-2">
                  <button
                    type="submit"
                    id="save-business-profile-btn"
                    className="px-6 py-3 rounded-xl bg-brand-gold text-dark-bg font-bold text-xs hover:bg-white active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 shadow"
                  >
                    <Save className="h-4 w-4" />
                    <span>Сохранить реквизиты профиля</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {activeTab === "promocodes" && (
        <div className="space-y-6 animate-fade-in text-left" id="dash-panel-promocodes">
          <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl border border-white/10 bg-dark-card/50">
            <div>
              <h3 className="text-lg font-light text-white">Управление Промокодами</h3>
              <p className="text-xs text-white/45">Создавайте, удаляйте, замораживайте или импортируйте скидочные купоны в один клик.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                id="dash-add-promo-btn"
                onClick={() => {
                  setIsAddingPromo(!isAddingPromo);
                  setIsBulkImporting(false);
                }}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                  isAddingPromo 
                    ? "bg-white/15 text-white border border-white/20" 
                    : "bg-brand-gold hover:bg-brand-gold-hover text-dark-bg"
                }`}
              >
                <Plus className="h-3 w-3" />
                <span>Создать промокод</span>
              </button>

              <button
                id="dash-bulk-import-btn"
                onClick={() => {
                  setIsBulkImporting(!isBulkImporting);
                  setIsAddingPromo(false);
                }}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                  isBulkImporting 
                    ? "bg-white/15 text-white border border-white/20" 
                    : "bg-[#74d5a6] hover:bg-[#5fc093] text-dark-bg"
                }`}
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span>Импорт из CSV</span>
              </button>
            </div>
          </div>

          {/* CSV Bulk Import Form Component */}
          {isBulkImporting && (
            <form
              onSubmit={handleCSVImportSubmit}
              className="p-5 rounded-2xl border border-brand-green/30 bg-brand-green/[0.02] space-y-4 animate-fade-in text-left"
            >
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-[#74d5a6]" />
                Быстрый пакетный импорт промокодов (CSV)
              </h4>
              <p className="text-xs text-white/50 leading-relaxed font-light">
                Введите каждый промокод на новой строке в формате:<br />
                <code className="text-brand-gold font-mono text-[11px] bg-black/40 px-1.5 py-0.5 rounded font-semibold">КОД,СКИДКА,ТИП,МИН_СУММА_ЗАКАЗА</code><br />
                Допустимые типы: <code className="text-white font-mono text-[10px]">percent</code> (проценты, по умолчанию) или <code className="text-white font-mono text-[10px]">fixed</code> (фиксированная скидка в рублях).<br />
                Например:<br />
                <code className="block text-white/40 font-mono text-[11px] bg-black/40 p-2.5 rounded-xl mt-1 leading-relaxed">
                  KARELIA15,15,percent,1000<br />
                  WELCOME500,500,fixed,4000<br />
                  SUMMER30,30,percent
                </code>
              </p>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-white/60">Текстовый CSV-ввод</label>
                <textarea
                  id="csv-bulk-input"
                  required
                  rows={4}
                  placeholder="KARELIA15,15,percent,1000&#10;WELCOME500,500,fixed,4000&#10;SUMMER30,30,percent"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs font-mono text-[#74d5a6] placeholder-white/20 focus:outline-none focus:border-[#74d5a6]/60 leading-relaxed"
                  value={csvInput}
                  onChange={(e) => setCsvInput(e.target.value)}
                />
              </div>

              {csvError && (
                <div className="p-3 rounded-xl border border-red-500/20 bg-red-500/10 text-xs text-red-400 font-mono">
                  ⚠️ Ошибка: {csvError}
                </div>
              )}

              {csvSuccess && (
                <div className="p-3 rounded-xl border border-brand-green/20 bg-brand-green/10 text-xs text-brand-green font-mono">
                  ✓ Успех: {csvSuccess}
                </div>
              )}

              <div className="flex gap-2 justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setIsBulkImporting(false)}
                  className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-xs text-white transition-all cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  id="submit-csv-import-btn"
                  className="px-5 py-2 bg-[#74d5a6] hover:bg-[#5dbd8f] text-dark-bg font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                >
                  <Upload className="h-3 w-3" />
                  <span>Выполнить импорт</span>
                </button>
              </div>
            </form>
          )}

          {/* Add Brand New Promo Form */}
          {isAddingPromo && (
            <form
              onSubmit={handleAddPromoSubmit}
              className="p-5 rounded-2xl border border-brand-gold/30 bg-brand-gold/[0.02] space-y-4 animate-fade-in"
            >
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <Tag className="h-4 w-4 text-brand-gold" />
                Новая скидочная комбинация
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-white/60">Код (лат.символы)</label>
                  <input
                    type="text"
                    required
                    maxLength={15}
                    placeholder="Например, KARELIA10"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-white/30 uppercase focus:outline-none focus:border-brand-gold/60"
                    value={newPromoCode}
                    onChange={(e) => setNewPromoCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-white/60">Размер скидки</label>
                  <input
                    type="number"
                    required
                    min={1}
                    placeholder="10"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-brand-gold/60"
                    value={newPromoDiscount}
                    onChange={(e) => setNewPromoDiscount(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-white/60">Тип скидки</label>
                  <select
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-brand-gold/60 cursor-pointer"
                    value={newPromoType}
                    onChange={(e) => setNewPromoType(e.target.value as any)}
                  >
                    <option value="percent">Проценты (%)</option>
                    <option value="fixed">Фиксированная сумма (₽)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-white/60">Минимальный чек бронирования (₽)</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="0"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-brand-gold/60"
                    value={newPromoMinAmount}
                    onChange={(e) => setNewPromoMinAmount(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingPromo(false)}
                  className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-xs text-white transition-all cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-gold hover:bg-brand-gold-hover text-dark-bg font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Сохранить промокод
                </button>
              </div>
            </form>
          )}

          {/* List existing ones */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {promoCodes.length > 0 ? (
              promoCodes.map((promo) => (
                <div
                  key={promo.code}
                  className={`p-5 rounded-2xl border transition-all ${
                    promo.isActive
                      ? "bg-white/3 border-white/10 hover:border-brand-gold/30"
                      : "bg-black/40 border-white/5 opacity-60"
                  } flex flex-col justify-between space-y-4`}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase font-mono font-bold tracking-widest text-brand-gold bg-brand-gold/10 px-2 py-0.5 rounded-md">
                        {promo.type === "percent" ? "Процентный" : "Фикс. сумма"}
                      </span>
                      <h4 className="text-base font-bold text-white tracking-wider pt-1 uppercase">
                        {promo.code}
                      </h4>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleTogglePromoActive(promo.code)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                        promo.isActive
                          ? "bg-brand-green/10 border-brand-green/20 text-[#74d5a6]"
                          : "bg-red-500/10 border-red-500/20 text-red-400"
                      }`}
                      title="Кликните, чтобы сменить статус активности"
                    >
                      {promo.isActive ? "Активен" : "Отключен"}
                    </button>
                  </div>

                  <div className="p-3 bg-black/20 border border-white/5 rounded-xl space-y-1 font-mono text-xs">
                    <div className="flex justify-between">
                      <span className="text-white/40">Скидка:</span>
                      <span className="font-bold text-[#74d5a6]">
                        {promo.type === "percent" ? `${promo.discountValue}%` : `${promo.discountValue.toLocaleString("ru")} ₽`}
                      </span>
                    </div>
                    {promo.minBookingAmount ? (
                      <div className="flex justify-between">
                        <span className="text-white/40">Мин. заказ:</span>
                        <span className="font-bold text-white/80">
                          {promo.minBookingAmount.toLocaleString("ru")} ₽
                        </span>
                      </div>
                    ) : null}
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-white/30 pt-1 border-t border-white/5">
                    <span>Статус: {promo.isActive ? "Доступен на кассе" : "Заморожен"}</span>
                    <button
                      type="button"
                      onClick={() => handleDeletePromo(promo.code)}
                      className="p-1 px-2 rounded hover:bg-red-500/10 text-red-400/80 hover:text-red-400 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Удалить</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-1 md:col-span-3 py-12 rounded-2xl border border-dashed border-white/10 text-center text-white/40 space-y-1 text-xs">
                <Tag className="h-6 w-6 mx-auto text-white/20 mb-1" />
                <p>Вы пока не создали ни одного промокода.</p>
                <p className="text-[10px] text-white/35">Нажмите «Создать промокод», чтобы порадовать клиентов скидкой.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Absolute Toast Notification Container */}
      <div className="fixed bottom-6 right-6 z-50 space-y-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto px-5 py-4.5 rounded-2xl shadow-2xl border flex items-center gap-3 animate-slide-in max-w-sm text-left backdrop-blur-md ${
              toast.type === "error"
                ? "bg-red-950/90 text-red-100 border-red-500/30"
                : toast.type === "warning"
                ? "bg-yellow-950/90 text-yellow-105 border-yellow-500/30"
                : "bg-emerald-950/90 text-emerald-100 border-emerald-500/30"
            }`}
          >
            <span className="text-sm">
              {toast.type === "error" ? "🚨" : toast.type === "warning" ? "⚠️" : "✓"}
            </span>
            <div className="text-xs font-semibold leading-relaxed">
              {toast.message}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
