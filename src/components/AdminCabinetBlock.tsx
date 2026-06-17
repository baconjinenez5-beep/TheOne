import React, { useState, useMemo } from "react";
import { 
  AreaChart as RechartsAreaChart, 
  Area as RechartsArea, 
  XAxis as RechartsXAxis, 
  YAxis as RechartsYAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend as RechartsLegend, 
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar as RechartsBar,
  PieChart as RechartsPieChart,
  Pie as RechartsPie,
  Cell as RechartsCell
} from "recharts";
import { 
  Users, 
  Compass, 
  MessageSquare, 
  Activity, 
  Save, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  Search, 
  ShieldAlert, 
  Sparkles, 
  Clock, 
  ArrowUpRight,
  TrendingUp,
  MapPin,
  Tag,
  AlertCircle,
  Bell,
  EyeOff,
  Eye,
  CheckSquare,
  Square,
  Flame,
  Database,
  Wrench,
  RefreshCw,
  Power,
  HeartPulse,
  Sliders
} from "lucide-react";
import { CatalogCard } from "../types";
import { motion } from "motion/react";

interface AdminCabinetBlockProps {
  cards: CatalogCard[];
  setCards: React.Dispatch<React.SetStateAction<CatalogCard[]>>;
  reviews: any[];
  setReviews: React.Dispatch<React.SetStateAction<any[]>>;
  activityLog: any[];
  setActivityLog: React.Dispatch<React.SetStateAction<any[]>>;
  addActivityEvent: (text: string, type: "booking" | "user" | "partner" | "tour" | "system", severity: "info" | "success" | "warning") => void;
  leadsList?: any[];
  setLeadsList?: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function AdminCabinetBlock({
  cards,
  setCards,
  reviews,
  setReviews,
  activityLog,
  setActivityLog,
  addActivityEvent,
  leadsList,
  setLeadsList
}: AdminCabinetBlockProps) {
  const [activeSubTab, setActiveSubTab] = useState<"registrations" | "monitors" | "moderation" | "activity" | "integrity">("registrations");
  
  // States for Heatmap & Health
  const [heatmapCategoryFilter, setHeatmapCategoryFilter] = useState("Все");
  const [isSystemHealthToggled, setIsSystemHealthToggled] = useState(false);
  const [fixingHealth, setFixingHealth] = useState(false);
  const [healthIssues, setHealthIssues] = useState<Array<{
    id: string;
    type: "orphan_booking" | "missing_profile" | "dangling_review" | "index_cache";
    title: string;
    desc: string;
    severity: "critical" | "warning";
  }>>([
    { id: "hi-1", type: "orphan_booking", title: "Осиротевшее бронирование #49821", desc: "Бронирование оформлено на несуществующую услугу 'Рыбалка на карельских озерах' (Тур был удален гидом).", severity: "critical" },
    { id: "hi-2", type: "missing_profile", title: "Отсутствует профиль туриста 'baconjinenez5@gmail.com'", desc: "Для брони #4514 не обнаружена учетная запись туриста в центральной таблице Auth-клиентов.", severity: "warning" },
    { id: "hi-3", type: "dangling_review", title: "Непривязанный отзыв от 'Ольга'", desc: "Анонимный отзыв c ID 49 не ссылается ни на один зарегистрированный ID тура.", severity: "warning" },
    { id: "hi-4", type: "index_cache", title: "Устаревший кеш поискового индекса каталога", desc: "Контрольная сумма индекса ElasticSearch расходится с объемом активных карточек на 18%.", severity: "warning" }
  ]);
  
  // Search state for card manager
  const [cardSearch, setCardSearch] = useState("");
  // Selection state for card manager editing
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  
  // Buffering fields for editing cards
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editPrice, setEditPrice] = useState(0);
  const [editType, setEditType] = useState<"Мероприятия" | "Услуги" | "Туры" | "Инструкции">("Туры");
  const [editLocation, setEditLocation] = useState("");

  // Confirmation Dialogue State
  const [confirmModal, setConfirmModal] = useState<{
    message: string;
    actionType: "delete_tour" | "delete_review";
    onConfirm: () => void;
  } | null>(null);

  // Filter states for Telemetry Activity Logs
  const [activityTypeFilter, setActivityTypeFilter] = useState<string>("all");
  const [activityTimeFilter, setActivityTimeFilter] = useState<string>("all");

  // System Integrity Simulation States
  const [diagnosticMode, setDiagnosticMode] = useState<"idle" | "running" | "ready">("idle");
  const [diagnosticProgress, setDiagnosticProgress] = useState(0);
  const [diagnosticLogs, setDiagnosticLogs] = useState<string[]>([]);
  const [diagnosticStep, setDiagnosticStep] = useState(0);

  // Selected IDs for batch actions
  const [selectedLogIds, setSelectedLogIds] = useState<string[]>([]);
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);

  // System of active critical user complaints / emergency alerts
  const [adminAlerts, setAdminAlerts] = useState<Array<{
    id: string;
    text: string;
    severity: "critical" | "warning";
    time: string;
    resolved: boolean;
  }>>([
    { id: "alert-1", text: "Критическая жалоба от misha94@mail.ru: Задержка возврата средств по отмененной брони №4514", severity: "critical", time: "10:12", resolved: false },
    { id: "alert-2", text: "Форс-мажор у Karelia Outdoor: Подтопление снаряжения, требуется согласовать отмену тура 'Kanoe Trip'", severity: "warning", time: "09:45", resolved: false },
    { id: "alert-3", text: "Жалоба на отзыв гида от 'andrey_klimov': Зафиксированы некорректные выражения", severity: "warning", time: "08:30", resolved: false }
  ]);

  // Handle resolving an alert
  const handleResolveAlert = (id: string, text: string) => {
    setAdminAlerts(prev => prev.map(a => a.id === id ? { ...a, resolved: true } : a));
    addActivityEvent(
      `Администратор урегулировал инцидент: "${text}"`,
      "system",
      "success"
    );
  };

  const handleFixAllHealthIssues = () => {
    setFixingHealth(true);
    setTimeout(() => {
      setHealthIssues([]);
      setFixingHealth(false);
      addActivityEvent(
        "Администратор пакетно исправил все выявленные несоответствия БД (индексирование, осиротевшие ссылки, связность профилей)",
        "system",
        "success"
      );
    }, 1500);
  };

  const runSystemDiagnostics = () => {
    setDiagnosticMode("running");
    setDiagnosticProgress(0);
    setDiagnosticLogs(["[SYSTEM INIT] Инициализация глубокого сканирования экосистемы...", "[SECURITY] Проверка JWT ролей и привилегий..."]);
    setDiagnosticStep(0);

    const steps = [
      { prg: 20, log: "[DATABASE] Подключение к пулу Firestore: Стабильно (100% пинг 4ms)" },
      { prg: 40, log: "[SSL CERT] Проверка Let's Encrypt цепочки шифрования: Сертификат действителен еще 88 дней" },
      { prg: 65, log: "[GEMINI AI] Верификация маршрута API модели 'gemini-3.5-flash': Токены авторизованы, отклик 120ms [OK]" },
      { prg: 85, log: "[CRM SYNC] Буферизация лидов партнерского дашборда: Синхронизировано" },
      { prg: 100, log: "[SUCCESS] АНАЛИЗ ЗАВЕРШЕН. Претензий к целостности системы нет. Все процессы работают на 100%." }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        const nextPrg = steps[currentStep].prg;
        const nextLog = steps[currentStep].log;
        setDiagnosticProgress(nextPrg);
        setDiagnosticLogs(prev => [...prev, nextLog]);
        currentStep++;
        setDiagnosticStep(currentStep + 1);
      } else {
        clearInterval(interval);
        setDiagnosticMode("ready");
        addActivityEvent(
          "Администратор успешно выполнил полную проверку целостности системы. Сбоев не обнаружено.",
          "system",
          "success"
        );
      }
    }, 600);
  };

  // Simulated registrations dataset over the last 30 days
  const registrationsData = useMemo(() => {
    const data = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const label = date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
      
      // Seed values with growth curves
      const dayFactor = 30 - i;
      const baseUsers = Math.round(12 + Math.sin(dayFactor / 2.5) * 6 + dayFactor * 0.4);
      const basePartners = Math.round(1 + Math.cos(dayFactor / 4) * 1 + dayFactor * 0.08);
      
      data.push({
        name: label,
        "Новые пользователи": baseUsers,
        "Новые партнеры": basePartners,
        "Всего регистраций": baseUsers + basePartners
      });
    }
    return data;
  }, []);

  const totalUsersInPeriod = useMemo(() => {
    return registrationsData.reduce((sum, item) => sum + item["Новые пользователи"], 0);
  }, [registrationsData]);

  const totalPartnersInPeriod = useMemo(() => {
    return registrationsData.reduce((sum, item) => sum + item["Новые партнеры"], 0);
  }, [registrationsData]);

  // Card list filtered
  const filteredCards = cards.filter(c => 
    c.title.toLowerCase().includes(cardSearch.toLowerCase()) ||
    c.location.toLowerCase().includes(cardSearch.toLowerCase()) ||
    c.type.toLowerCase().includes(cardSearch.toLowerCase())
  );

  // Memoized filtered log lists
  const filteredEventLogs = useMemo(() => {
    return activityLog.filter(act => {
      // 1. Filter by event type
      if (activityTypeFilter !== "all" && act.type !== activityTypeFilter) {
        return false;
      }
      // 2. Filter by time window
      if (activityTimeFilter !== "all") {
        const spanMs = {
          "1h": 60 * 60 * 1000,
          "24h": 24 * 60 * 60 * 1000,
          "7d": 7 * 24 * 60 * 60 * 1000
        }[activityTimeFilter as "1h" | "24h" | "7d"] || Infinity;

        const eventTime = act.timestamp || Date.now();
        if (Date.now() - eventTime > spanMs) {
          return false;
        }
      }
      return true;
    });
  }, [activityLog, activityTypeFilter, activityTimeFilter]);

  // Edit card toggle
  const startEditingCard = (card: CatalogCard) => {
    setEditingCardId(card.id);
    setEditTitle(card.title);
    setEditDesc(card.desc);
    setEditPrice(card.basePrice);
    setEditType(card.type);
    setEditLocation(card.location);
  };

  const handleSaveCard = (e: React.FormEvent, cardId: string) => {
    e.preventDefault();
    if (!editTitle.trim()) return;

    setCards(prev => prev.map(c => {
      if (c.id === cardId) {
        return {
          ...c,
          title: editTitle,
          desc: editDesc,
          basePrice: editPrice,
          priceLabel: `от ${editPrice.toLocaleString("ru")} ₽`,
          type: editType,
          location: editLocation
        };
      }
      return c;
    }));

    addActivityEvent(
      `Администратор отредактировал карточку: "${editTitle}" (Новая цена: ${editPrice.toLocaleString("ru")} ₽)`,
      "tour",
      "warning"
    );

    setEditingCardId(null);
  };

  // Card listing deletion action
  const handleDeleteCard = (cardId: string) => {
    const cardToDelete = cards.find(c => c.id === cardId);
    if (!cardToDelete) return;

    setCards(prev => prev.filter(c => c.id !== cardId));
    addActivityEvent(
      `Администратор удалил тур и деинсталлировал предложение из каталога: "${cardToDelete.title}"`,
      "tour",
      "warning"
    );
  };

  // Safe wrapper utilities for showing confirm dialogue
  const triggerDeleteCardConfirm = (cardId: string, title: string) => {
    setConfirmModal({
      message: `Вы действительно хотите навсегда УДАЛИТЬ тур "${title}" из активного каталога предложений?`,
      actionType: "delete_tour",
      onConfirm: () => {
        handleDeleteCard(cardId);
        setConfirmModal(null);
      }
    });
  };

  const triggerDeleteReviewConfirm = (reviewId: number, author: string) => {
    setConfirmModal({
      message: `Вы действительно хотите навсегда отклонить и УДАЛИТЬ отзыв от пользователя ${author}?`,
      actionType: "delete_review",
      onConfirm: () => {
        handleDeleteReview(reviewId, author);
        setConfirmModal(null);
      }
    });
  };

  // Review moderation action
  const handleApproveReview = (reviewId: number, author: string) => {
    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, approved: true } : r));
    addActivityEvent(
      `Отзыв от пользователя ${author} успешно одобрен и опубликован на главной`,
      "system",
      "success"
    );
  };

  const handleDeleteReview = (reviewId: number, author: string) => {
    setReviews(prev => prev.filter(r => r.id !== reviewId));
    addActivityEvent(
      `Отзыв от пользователя ${author} отклонен и безвозвратно удален`,
      "system",
      "warning"
    );
  };

  return (
    <div className="space-y-6 text-left animate-fade-in" id="admin-workspace-container">
      {/* Admin Title Block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl border border-white/10 bg-dark-card/50 backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 bg-red-500/10 rounded-bl-3xl border-l border-b border-red-500/20 text-[9px] font-mono tracking-widest text-red-400 uppercase font-black">
          Сектор безопасности и модерации
        </div>
        
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
            <ShieldAlert className="h-6 w-6 stroke-[2]" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white font-sans flex items-center gap-2">
              Кабинет Главного Администратора
              <span className="text-[10px] bg-red-500/20 text-red-300 font-mono tracking-widest px-2.5 py-1 rounded-full uppercase border border-red-500/35 animate-pulse">
                Root Access
              </span>
            </h2>
            <p className="text-xs text-white/55 mt-1">
              Центральный пульт управления платформой The One Point. Мониторинг метрик, аудит логов и модерация предложений.
            </p>
          </div>
        </div>
      </div>

      {/* Real-time Emergency Radar & Active Incident Tracker */}
      {adminAlerts.some(a => !a.resolved) && (
        <div className="p-5 rounded-3xl border border-red-500/25 bg-red-500/5 backdrop-blur-sm space-y-4 relative overflow-hidden" id="admin-realtime-alerts-radar">
          {/* Subtle background glow */}
          <div className="absolute -top-12 -right-12 h-24 w-24 rounded-full bg-red-500/10 blur-xl pointer-events-none" />
          
          <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500"></span>
              </span>
              <div>
                <h3 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-1.5 font-sans">
                  Монитор критических инцидентов и жалоб
                  <span className="px-1.5 py-0.5 rounded text-[8.5px] bg-red-500 text-white font-mono leading-none animate-pulse">
                    LIVE
                  </span>
                </h3>
                <p className="text-[10px] text-white/50 mt-0.5">Новые приоритетные тикеты, жалобы туристов и форс-мажоры партнеров:</p>
              </div>
            </div>
            
            <span className="text-[10px] font-mono text-red-400 font-bold bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-full uppercase">
              Активно: {adminAlerts.filter(a => !a.resolved).length}
            </span>
          </div>

          <div className="space-y-2.5">
            {adminAlerts.filter(a => !a.resolved).map(alert => (
              <div key={alert.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl transition-all hover:bg-red-500/15">
                <div className="flex items-center gap-3 text-left">
                  <div className="h-2 w-2 rounded-full bg-red-400 shrink-0 animate-ping" />
                  <div className="space-y-0.5">
                    <p className="text-xs text-white/90 font-medium leading-relaxed select-text font-sans">
                      {alert.text}
                    </p>
                    <span className="text-[9px] text-white/40 block font-mono">Зарегистрировано: {alert.time} (UTC+3) • Статус: На рассмотрении</span>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => handleResolveAlert(alert.id, alert.text)}
                  className="px-3.5 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/35 border border-emerald-500/30 text-[#71f0bc] hover:text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer shrink-0"
                >
                  Урегулировано ✓
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Admin SubNavigation Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-1 border-b border-white/10 select-none scrollbar-none">
        {[
          { id: "registrations", label: "Динамика роста", icon: Users, color: "hover:text-[#74d5a6]" },
          { id: "monitors", label: "Каталог предложений", icon: Compass, color: "hover:text-brand-gold" },
          { id: "moderation", label: "Модерация отзывов", icon: MessageSquare, color: "hover:text-blue-400" },
          { id: "activity", label: "Журнал активности", icon: Activity, color: "hover:text-purple-400" },
          { id: "integrity", label: "Целостность и Тесты", icon: ShieldAlert, color: "hover:text-red-400" }
        ].map(tab => {
          const SubIcon = tab.icon;
          const isActive = activeSubTab === tab.id;
          const pendingCount = tab.id === "moderation" ? reviews.filter(r => !r.approved).length : 0;
          const hasEmergencyAlerts = tab.id === "registrations" && adminAlerts.some(a => !a.resolved);

          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                isActive
                  ? "bg-red-500 text-white font-extrabold shadow-md shadow-red-500/20"
                  : `bg-white/3 border border-white/5 text-white/60 ${tab.color}`
              }`}
            >
              <SubIcon className="h-4 w-4" />
              <span>{tab.label}</span>
              {pendingCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-yellow-500 text-[10px] font-bold text-dark-bg px-1.5 animate-pulse">
                  {pendingCount}
                </span>
              )}
              {hasEmergencyAlerts && (
                <span className="relative flex h-2 w-2 ml-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Sub-Panels Output */}
      {activeSubTab === "registrations" && (
        <div className="space-y-6 animate-fade-in" id="admin-panel-regs">
          {/* Summary metrics header */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white/2 border border-white/5 space-y-1">
              <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider block">Регистрации (30 дн)</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white font-mono">{totalUsersInPeriod + totalPartnersInPeriod}</span>
                <span className="text-[10px] text-[#74d5a6] flex items-center gap-0.5">
                  <TrendingUp className="h-3 w-3" /> +14.2%
                </span>
              </div>
              <p className="text-[11px] text-white/50">Совокупный приток целевой аудитории</p>
            </div>

            <div className="p-5 rounded-2xl bg-white/2 border border-white/5 space-y-1">
              <span className="text-[10px] text-[#74d5a6] uppercase font-bold tracking-wider block font-sans">Новые Пользователи</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-[#74d5a6] font-mono">{totalUsersInPeriod}</span>
                <span className="text-xs text-white/40 font-light">туристов зарегистрировано</span>
              </div>
              <p className="text-[11px] text-white/50">Гостевые билеты и поисковая активность</p>
            </div>

            <div className="p-5 rounded-2xl bg-brand-gold/5 border border-brand-gold/15 space-y-1">
              <span className="text-[10px] text-brand-gold uppercase font-bold tracking-wider block font-sans">Новые Организаторы</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-brand-gold font-mono">{totalPartnersInPeriod}</span>
                <span className="text-xs text-white/40 font-light">b2b аккаунтов партнеров</span>
              </div>
              <p className="text-[11px] text-white/50">Размещение гидов и прокатных сервисов</p>
            </div>
          </div>

          {/* Dual Data Graphic Recharts and PieChart Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Account growth trend */}
            <div className="lg:col-span-2 p-6 rounded-3xl border border-white/10 bg-dark-card space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white">График прироста аккаунтов</h4>
                  <p className="text-xs text-white/40 mt-0.5">Ежедневная динамика регистрации пользователей и партнеров на платформе</p>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-mono text-white/40 border border-white/5 bg-white/2 px-2.5 py-1 rounded-lg">
                  <Clock className="h-3.5 w-3.5 text-brand-gold" />
                  Расчет в реальном времени (UTC)
                </span>
              </div>

              {/* Recharts responsive layout */}
              <div className="h-80 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsAreaChart data={registrationsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#74d5a6" stopOpacity={0.35}/>
                        <stop offset="95%" stopColor="#74d5a6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorPartners" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#d6b36a" stopOpacity={0.35}/>
                        <stop offset="95%" stopColor="#d6b36a" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" strokeOpacity={0.05} />
                    <RechartsXAxis 
                      dataKey="name" 
                      stroke="#ffffff" 
                      strokeOpacity={0.3} 
                      style={{ fontSize: "10px", fontFamily: "var(--font-mono)" }}
                    />
                    <RechartsYAxis 
                      stroke="#ffffff" 
                      strokeOpacity={0.3} 
                      style={{ fontSize: "10px", fontFamily: "var(--font-mono)" }}
                    />
                    <RechartsTooltip 
                      contentStyle={{ 
                        backgroundColor: "#0d1e33", 
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        borderRadius: "16px",
                        color: "#ffffff",
                        fontSize: "12.2px",
                        boxShadow: "0 10px 25px -5px rgba(0,0,0,0.4)"
                      }}
                    />
                    <RechartsLegend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: "11px" }} />
                    <RechartsArea 
                      name="Новые пользователи" 
                      type="monotone" 
                      dataKey="Новые пользователи" 
                      stroke="#74d5a6" 
                      fillOpacity={1} 
                      fill="url(#colorUsers)" 
                      strokeWidth={2}
                    />
                    <RechartsArea 
                      name="Новые партнеры" 
                      type="monotone" 
                      dataKey="Новые партнеры" 
                      stroke="#d6b36a" 
                      fillOpacity={1} 
                      fill="url(#colorPartners)" 
                      strokeWidth={2}
                    />
                  </RechartsAreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Tour categories distribution PieChart */}
            <div className="p-6 rounded-3xl border border-white/10 bg-dark-card space-y-4 flex flex-col justify-between" id="admin-category-piechart">
              <div>
                <h4 className="text-sm font-semibold text-white">Структура предложений</h4>
                <p className="text-xs text-white/40 mt-0.5">Распределение туров, мероприятий и услуг по категориям каталога</p>
              </div>

              {/* Pie container */}
              <div className="h-60 w-full flex items-center justify-center relative my-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <RechartsPie
                      data={(() => {
                        const rawCounts = cards.reduce((acc, card) => {
                          const type = card.type || "Другое";
                          acc[type] = (acc[type] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>);
                        return Object.entries(rawCounts).map(([name, value]) => ({ name, value }));
                      })()}
                      cx="50%"
                      cy="50%"
                      innerRadius={62}
                      outerRadius={82}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {(() => {
                        const rawCounts = cards.reduce((acc, card) => {
                          const type = card.type || "Другое";
                          acc[type] = (acc[type] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>);
                        return Object.keys(rawCounts);
                      })().map((_, index) => {
                        const COLORS = ["#d6b36a", "#74d5a6", "#60a5fa", "#c084fc", "#f43f5e"];
                        return (
                          <RechartsCell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        );
                      })}
                    </RechartsPie>
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "#0d1e33",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        borderRadius: "16px",
                        color: "#ffffff",
                        fontSize: "11px",
                        boxShadow: "0 10px 25px -5px rgba(0,0,0,0.4)"
                      }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>

                {/* Central donut total text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                  <span className="text-2xl font-black text-white font-mono leading-none">{cards.length}</span>
                  <span className="text-[9px] uppercase tracking-wider text-white/40 mt-1 font-bold">Активных</span>
                </div>
              </div>

              {/* Slices legend */}
              <div className="grid grid-cols-2 gap-2 text-[10.5px] border-t border-white/5 pt-4">
                {(() => {
                  const rawCounts = cards.reduce((acc, card) => {
                    const type = card.type || "Другое";
                    acc[type] = (acc[type] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>);
                  return Object.entries(rawCounts);
                })().map(([name, value], index) => {
                  const COLORS = ["#d6b36a", "#74d5a6", "#60a5fa", "#c084fc", "#f43f5e"];
                  const color = COLORS[index % COLORS.length];
                  return (
                    <div key={name} className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                      <span className="text-white/60 truncate" title={name}>
                        {name}: <strong className="text-white font-mono">{value}</strong>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Heatmap Visualization Card representing Peak Scheduling Times */}
          <div className="p-6 rounded-3xl border border-white/10 bg-[#0d1e33]/50 space-y-4 text-left" id="admin-heatmap-bookings">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
              <div>
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Flame className="h-4 w-4 text-orange-500 animate-pulse" />
                  Тепловая карта активности (Плотность бронирований)
                </h4>
                <p className="text-xs text-white/40 mt-1">
                  Анализ распределения частоты заказов по дням недели и часам суток для прогнозирования пиковых нагрузок.
                </p>
              </div>

              {/* Dynamic Heatmap Filters */}
              <div className="flex items-center gap-2 text-xs bg-white/5 border border-white/10 rounded-xl px-3.5 py-1.5 shrink-0">
                <span className="text-white/50">Фильтр:</span>
                <select 
                  className="bg-transparent border-none text-brand-gold font-bold focus:outline-none cursor-pointer"
                  value={heatmapCategoryFilter}
                  onChange={(e) => setHeatmapCategoryFilter(e.target.value)}
                >
                  <option value="Все" className="bg-[#0f243a] text-white">Все услуги</option>
                  <option value="Туры" className="bg-[#0f243a] text-white">Только Туры</option>
                  <option value="Услуги" className="bg-[#0f243a] text-white">Только Услуги</option>
                  <option value="Мероприятия" className="bg-[#0f243a] text-white">Мероприятия</option>
                </select>
              </div>
            </div>

            {/* Generated grid representation of 7 days x 24 hourly columns */}
            <div className="overflow-x-auto pb-2 scrollbar-thin select-none">
              <div className="min-w-[840px] space-y-1">
                {/* Hours row (Header) */}
                <div className="flex items-center">
                  {/* Left spacer for Day labels */}
                  <div className="w-10 text-[10px] text-white/45 font-mono text-center shrink-0 mr-1"></div>
                  {/* Hours 00 to 23 */}
                  <div className="flex-1" style={{ display: "grid", gridTemplateColumns: "repeat(24, minmax(0, 1fr))", gap: "4px" }}>
                    {Array.from({ length: 24 }).map((_, h) => (
                      <div key={h} className="text-[9px] text-white/40 font-mono text-center truncate">
                        {String(h).padStart(2, "0")}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Day rows */}
                {(() => {
                  const days = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
                  
                  return days.map((day, dIndex) => {
                    return (
                      <div key={day} className="flex items-center">
                        {/* Day label */}
                        <div className="w-10 text-xs text-white/60 font-semibold text-center shrink-0 mr-1">
                          {day}
                        </div>

                        {/* 24 hour cells */}
                        <div className="flex-1" style={{ display: "grid", gridTemplateColumns: "repeat(24, minmax(0, 1fr))", gap: "4px" }}>
                          {Array.from({ length: 24 }).map((_, hour) => {
                            // Seed pseudo-random reproducible base activity
                            let baseActivity = 4;
                            
                            // Peak weekend behavior
                            if (dIndex >= 4) {
                              baseActivity += 18; // Weekends
                            }
                            
                            // Peak daytime/evening behavior
                            if (hour >= 10 && hour <= 15) {
                              baseActivity += 12; // Daytime
                            } else if (hour >= 18 && hour <= 21) {
                              baseActivity += 25; // Evening peak
                            } else if (hour >= 1 && hour <= 5) {
                              baseActivity -= 3; // Night lull
                            }

                            // Filter change multipliers
                            if (heatmapCategoryFilter === "Туры") {
                              baseActivity = Math.round(baseActivity * 0.75 + (hour % 3 === 0 ? 5 : 0));
                            } else if (heatmapCategoryFilter === "Услуги") {
                              baseActivity = Math.round(baseActivity * 0.5 + (hour % 2 === 0 ? 3 : 0));
                            } else if (heatmapCategoryFilter === "Мероприятия") {
                              baseActivity = Math.round(baseActivity * 0.4 + (hour % 4 === 0 ? 4 : 0));
                            }

                            const val = Math.max(1, Math.round(baseActivity + Math.sin(dIndex + hour) * 3));

                            // Color scale generator
                            let bgClass = "bg-white/5 border border-white/5 hover:border-white/20";
                            let glowClass = "";
                            let desc = "Низкая активность";

                            if (val >= 35) {
                              bgClass = "bg-red-500/80 text-white font-extrabold shadow shadow-red-500/10 hover:bg-red-500 border border-red-400/30";
                              glowClass = "animate-pulse";
                              desc = "Критический ПИК трафика";
                            } else if (val >= 25) {
                              bgClass = "bg-orange-500/60 text-orange-50 hover:bg-orange-500 border border-orange-400/10";
                              desc = "Высокая загруженность";
                            } else if (val >= 15) {
                              bgClass = "bg-[#4f46e5]/50 text-indigo-100 hover:bg-[#4f46e5]/75 border border-[#4f46e5]/10";
                              desc = "Умеренная активность";
                            } else if (val >= 8) {
                              bgClass = "bg-[#1e40af]/30 text-blue-300 hover:bg-[#1e40af]/50 border border-blue-500/5";
                              desc = "Минимальная загруженность";
                            }

                            return (
                              <div
                                key={hour}
                                className={`h-8 rounded flex items-center justify-center text-[10px] font-mono cursor-pointer transition-all duration-150 relative group ${bgClass} ${glowClass}`}
                              >
                                {val}

                                {/* Exquisite dynamic tooltip */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 hidden group-hover:block bg-[#091524] border border-white/15 p-2 rounded-xl shadow-2xl pointer-events-none z-50 text-left font-sans text-[11px] space-y-1">
                                  <div className="flex items-center justify-between text-white font-bold border-b border-white/5 pb-1">
                                    <span>{day}, {String(hour).padStart(2, "0")}:00</span>
                                    <span className="text-brand-gold font-mono">{val} запр/ч</span>
                                  </div>
                                  <p className="text-[10px] text-white/50">{desc}</p>
                                  <p className="text-[9px] text-[#71f0bc] font-mono">Доля от пика: {Math.round((val / 45) * 100)}%</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            {/* Heatmap Legend */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-[10.5px] border-t border-white/5">
              <div className="flex items-center gap-4">
                <span className="text-white/40 block font-light">Доля запросов в секунду (RPS)</span>
                <div className="flex items-center gap-1.5 font-mono text-[9.5px]">
                  <span className="h-3 w-3 rounded bg-white/5 border border-white/5 shrink-0" />
                  <span className="text-white/40">1-7</span>
                  <span className="h-3 w-3 rounded bg-[#1e40af]/30 border border-blue-500/5 shrink-0" />
                  <span className="text-white/45">8-14</span>
                  <span className="h-3 w-3 rounded bg-[#4f46e5]/50 border border-indigo-500/10 shrink-0" />
                  <span className="text-white/50">15-24</span>
                  <span className="h-3 w-3 rounded bg-orange-500/60 border border-orange-400/10 shrink-0" />
                  <span className="text-white/60">25-34</span>
                  <span className="h-3 w-3 rounded bg-red-500/80 border border-red-400/30 shrink-0 animate-pulse" />
                  <span className="text-red-400 font-bold">35+ (Пик)</span>
                </div>
              </div>

              <div className="text-white/35 font-mono text-[10px] bg-white/2 px-2.5 py-1 rounded-lg border border-white/5">
                Автообновление: каждые 15 сек.
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "monitors" && (
        <div className="space-y-4 animate-fade-in" id="admin-panel-cards">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#0d1e33]/50 border border-white/5 select-none">
            <div className="flex flex-wrap flex-1 items-center gap-4 w-full text-left">
              <button
                type="button"
                onClick={() => {
                  const filteredIds = filteredCards.map(c => c.id);
                  const isAllSelected = filteredIds.every(id => selectedCardIds.includes(id));
                  if (filteredIds.length === 0) return;
                  if (isAllSelected) {
                    setSelectedCardIds(prev => prev.filter(id => !filteredIds.includes(id)));
                  } else {
                    setSelectedCardIds(prev => {
                      const newOnes = filteredIds.filter(id => !prev.includes(id));
                      return [...prev, ...newOnes];
                    });
                  }
                }}
                className="p-1.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/25 text-white/70 hover:text-white transition-colors cursor-pointer flex items-center gap-2 text-[11px] font-semibold shrink-0"
              >
                {filteredCards.length > 0 && filteredCards.map(c => c.id).every(id => selectedCardIds.includes(id)) ? (
                  <CheckSquare className="h-3.5 w-3.5 text-red-400" />
                ) : (
                  <Square className="h-3.5 w-3.5" />
                )}
                Выбрать все
              </button>

              <div className="relative w-full sm:max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/45" />
                <input
                  type="text"
                  className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-500/60"
                  placeholder="Поиск по названию, локации, типу предложения..."
                  value={cardSearch}
                  onChange={(e) => {
                    setCardSearch(e.target.value);
                    setSelectedCardIds([]); // clear selection if search query changed to prevent unexpected deletions
                  }}
                />
              </div>
            </div>
            <span className="text-xs text-white/50 block font-mono shrink-0">
              Всего в базе: {cards.length} предложений
            </span>
          </div>

          {/* Master bulk select action panel */}
          {selectedCardIds.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl animate-fade-in text-left">
              <span className="text-xs text-white/80">
                Выбрано предложений: <strong className="text-red-400 text-sm font-mono">{selectedCardIds.length}</strong>
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    // Bulk hide (Draft status)
                    setCards(prev => prev.map(c => selectedCardIds.includes(c.id) ? { ...c, hidden: true } : c));
                    addActivityEvent(
                      `Администратор перевел ${selectedCardIds.length} предложений в статус Черновик (Draft) и скрыл их из каталога.`,
                      "tour",
                      "warning"
                    );
                    setSelectedCardIds([]);
                  }}
                  className="px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-[10.5px] rounded-xl transition duration-150 cursor-pointer flex items-center gap-1.5"
                  title="Сделать выбранные туры черновиками"
                >
                  <EyeOff className="h-3.5 w-3.5 text-red-450" />
                  В черновики (Draft)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    // Bulk show (Published status)
                    setCards(prev => prev.map(c => selectedCardIds.includes(c.id) ? { ...c, hidden: false } : c));
                    addActivityEvent(
                      `Администратор опубликовал ${selectedCardIds.length} предложений в каталоге (Published).`,
                      "tour",
                      "success"
                    );
                    setSelectedCardIds([]);
                  }}
                  className="px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-[10.5px] rounded-xl transition duration-150 cursor-pointer flex items-center gap-1.5"
                  title="Опубликовать выбранные предложения для всех"
                >
                  <Eye className="h-3.5 w-3.5 text-brand-green" />
                  Опубликовать (Publish)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    // Bulk toggle toggles between Draft and Published status
                    setCards(prev => prev.map(c => selectedCardIds.includes(c.id) ? { ...c, hidden: !c.hidden } : c));
                    addActivityEvent(
                      `Администратор переключил статус видимости (Черновик ↔ Опубликован) для ${selectedCardIds.length} предложений.`,
                      "tour",
                      "info"
                    );
                    setSelectedCardIds([]);
                  }}
                  className="px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-[10.5px] rounded-xl transition duration-150 cursor-pointer flex items-center gap-1.5"
                  title="Инвертировать статус видимости (Draft ↔ Published) выбранных элементов"
                >
                  <Sliders className="h-3.5 w-3.5 text-brand-gold animate-spin" style={{ animationDuration: "10s" }} />
                  Переключить статус (Toggle Draft/Publish)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    // Bulk delete with single confirmation popup
                    setConfirmModal({
                      message: `Вы действительно хотите безвозвратно удалить выбранные предложения (${selectedCardIds.length} шт.) из базы данных платформы?`,
                      actionType: "delete_tour",
                      onConfirm: () => {
                        setCards(prev => prev.filter(c => !selectedCardIds.includes(c.id)));
                        addActivityEvent(
                          `Пакетно деинсталлировано ${selectedCardIds.length} предложений из базы данных.`,
                          "tour",
                          "warning"
                        );
                        setSelectedCardIds([]);
                        setConfirmModal(null);
                      }
                    });
                  }}
                  className="px-4 py-1.5 bg-red-500 hover:bg-red-650 text-white font-black text-[10.5px] uppercase rounded-xl transition duration-150 cursor-pointer flex items-center gap-1.5 shadow"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Удалить выбранные
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedCardIds([])}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/60 font-semibold text-[10.5px] rounded-xl"
                >
                  Снять выбор
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {filteredCards.map(card => {
              const isEditing = editingCardId === card.id;
              const isSelected = selectedCardIds.includes(card.id);

              return (
                <div 
                  key={card.id} 
                  className={`p-5 rounded-2xl border transition-all ${
                    isEditing 
                      ? "border-red-500 bg-red-500/2 shadow-xl shadow-red-500/5 pb-6" 
                      : isSelected
                        ? "border-red-500/40 bg-red-500/2 hover:border-red-500/50"
                        : "border-white/10 bg-dark-card hover:border-white/20"
                  }`}
                >
                  {!isEditing ? (
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex gap-4 items-start text-left flex-1 min-w-0">
                        {/* Checkbox selector */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCardIds(prev => 
                              prev.includes(card.id) ? prev.filter(id => id !== card.id) : [...prev, card.id]
                            );
                          }}
                          className="mt-6 text-white/35 hover:text-red-400 transition-colors cursor-pointer shrink-0"
                          title="Выбрать это предложение"
                        >
                          {isSelected ? (
                            <CheckSquare className="h-5 w-5 text-red-400" />
                          ) : (
                            <Square className="h-5 w-5" />
                          )}
                        </button>

                        <div className="h-16 w-16 rounded-xl overflow-hidden shrink-0 border border-white/15 relative">
                          <img 
                            src={card.img} 
                            alt={card.title} 
                            className="h-full w-full object-cover" 
                            referrerPolicy="no-referrer"
                          />
                          {card.hidden && (
                            <div className="absolute inset-0 bg-black/75 flex items-center justify-center">
                              <EyeOff className="h-5 w-5 text-red-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[9.5px] font-mono text-white/50 uppercase leading-none font-bold">
                              {card.type}
                            </span>
                            <span className="text-[10.5px] text-white/40 flex items-center gap-1 font-mono">
                              <MapPin className="h-3 w-3 text-brand-gold shrink-0" />
                              {card.location}
                            </span>
                            {card.hidden ? (
                              <span className="px-2 py-0.5 rounded bg-yellow-500/10 border border-yellow-500/25 text-[9px] font-bold text-yellow-500 uppercase leading-none tracking-wider font-sans">
                                Черновик (Draft)
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-[#71f0bc]/10 border border-[#71f0bc]/25 text-[9px] font-bold text-[#71f0bc] uppercase leading-none tracking-wider font-sans">
                                Опубликован (Published)
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-semibold text-white mt-1.5">{card.title}</h4>
                          <p className="text-xs text-white/55 font-light line-clamp-1 mt-0.5">{card.desc}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4.5 justify-between md:justify-end shrink-0 pl-12 md:pl-0">
                        <div className="text-right font-mono">
                          <div className="text-[10px] text-white/35 font-sans">Базовая цена</div>
                          <div className="text-sm font-black text-brand-gold">{card.basePrice.toLocaleString("ru")} ₽</div>
                        </div>

                        <button
                          type="button"
                          onClick={() => startEditingCard(card)}
                          className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/25 text-white/80 hover:text-white transition-colors cursor-pointer"
                          title="Редактировать цену, категорию и описание"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => triggerDeleteCardConfirm(card.id, card.title)}
                          className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 hover:border-red-500/40 text-red-400 hover:text-red-350 transition-colors cursor-pointer"
                          title="Удалить предложение из каталога"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={(e) => handleSaveCard(e, card.id)} className="space-y-4">
                      <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                        <Edit2 className="h-4 w-4 text-red-400 shrink-0" />
                        <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Редактирование параметров</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-[10px] text-white/45 uppercase font-mono block font-bold">Название карточки</label>
                          <input 
                            type="text" 
                            className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white font-semibold focus:outline-none focus:border-red-500/50" 
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-white/45 uppercase font-mono block font-bold">Базовая стоимость (₽)</label>
                          <input 
                            type="number" 
                            className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-brand-gold font-bold font-mono focus:outline-none focus:border-red-500/50" 
                            value={editPrice}
                            onChange={(e) => setEditPrice(Number(e.target.value))}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-white/45 uppercase font-mono block font-bold">Категория предложения</label>
                          <select 
                            className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-red-500/50" 
                            value={editType}
                            onChange={(e) => setEditType(e.target.value as any)}
                          >
                            <option value="Мероприятия">Мероприятия</option>
                            <option value="Услуги">Услуги</option>
                            <option value="Туры">Туры</option>
                            <option value="Инструкции">Инструкции</option>
                          </select>
                        </div>

                        <div className="space-y-1 md:col-span-2">
                          <label className="text-[10px] text-white/45 uppercase font-mono block font-bold">Гео-локация</label>
                          <input 
                            type="text" 
                            className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-red-500/50" 
                            value={editLocation}
                            onChange={(e) => setEditLocation(e.target.value)}
                          />
                        </div>

                        <div className="space-y-1 md:col-span-3">
                          <label className="text-[10px] text-white/45 uppercase font-mono block font-bold">Краткое описание на карточке</label>
                          <textarea 
                            rows={3}
                            className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white/90 leading-relaxed resize-none focus:outline-none focus:border-red-500/50" 
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          type="submit"
                          className="px-4.5 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <Save className="h-3 w-3" />
                          <span>Сохранить параметры</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingCardId(null)}
                          className="px-4.5 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold text-xs"
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
        </div>
      )}

      {activeSubTab === "moderation" && (
        <div className="space-y-4 animate-fade-in" id="admin-panel-reviews">
          <div className="p-4 rounded-2xl bg-white/2 border border-white/5 text-xs text-white/50 leading-relaxed text-left">
            💡 Одобренные отзывы выводятся в публичном блоке «Отзывы клиентов» на главной странице. Отклоненные отзывы безвозвратно деинсталлируются из базы данных.
          </div>

          <div className="space-y-3">
            {reviews.map(rev => (
              <div 
                key={rev.id} 
                className={`p-5 rounded-2xl border ${
                  rev.approved 
                    ? "border-white/5 bg-dark-card/50" 
                    : "border-yellow-500/25 bg-yellow-500/2 animate-pulse"
                } space-y-3.5`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-white">{rev.author}</span>
                      <span className="text-[10px] text-white/40 block font-mono">{rev.date || "Только что"}</span>
                      {rev.service && (
                        <span className="px-2 py-0.5 rounded bg-white/5 text-[9.5px] text-brand-gold font-mono uppercase">
                          по туру: {rev.service}
                        </span>
                      )}
                    </div>
                    {/* Stars render */}
                    <div className="flex items-center gap-0.5 text-[#ffc107] mt-1 text-xs">
                      {Array.from({ length: 5 }).map((_, sIdx) => (
                        <svg key={sIdx} className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                      ))}
                      <span className="text-white/60 ml-1 font-semibold font-mono text-[11px]">({rev.rating}/5)</span>
                    </div>
                  </div>

                  <span className={`self-start sm:self-auto text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full border ${
                    rev.approved 
                      ? "bg-brand-green/10 border-brand-green/20 text-[#71f0bc]" 
                      : "bg-yellow-500/10 border-yellow-500/30 text-yellow-300"
                  }`}>
                    {rev.approved ? "Опубликован" : "Ожидает модерации"}
                  </span>
                </div>

                <div className="p-3.5 bg-black/40 border border-white/5 rounded-xl text-left">
                  <p className="text-xs text-white/80 leading-relaxed font-light select-text italic">
                    "{rev.text}"
                  </p>
                </div>

                <div className="flex gap-2 pt-1">
                  {!rev.approved && (
                    <button
                      onClick={() => handleApproveReview(rev.id, rev.author)}
                      className="px-4 py-2 bg-[#71f0bc]/10 hover:bg-[#71f0bc]/20 border border-[#71f0bc]/30 text-[#71f0bc] font-bold text-xs uppercase rounded-xl transition duration-200 cursor-pointer flex items-center gap-1"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Одобрить отзыв
                    </button>
                  )}
                  
                  <button
                    type="button"
                    onClick={() => triggerDeleteReviewConfirm(rev.id, rev.author)}
                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/35 text-red-400 font-bold text-xs uppercase rounded-xl transition duration-200 cursor-pointer flex items-center gap-1 shadow-sm"
                  >
                    <X className="h-3.5 w-3.5" />
                    Удалить
                  </button>
                </div>
              </div>
            ))}

            {reviews.length === 0 && (
              <div className="text-center py-12 rounded-2xl border border-dashed border-white/10">
                <p className="text-sm text-white/40">Отзывы на модерации и публикации отсутствуют</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeSubTab === "activity" && (
        <div className="space-y-4 animate-fade-in" id="admin-panel-activity">
          <div className="p-4 rounded-2xl bg-white/2 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs select-none">
            <div className="flex flex-wrap items-center gap-4 text-left">
              <button
                type="button"
                onClick={() => {
                  const allFilteredIds = filteredEventLogs.map(l => l.id);
                  const isAllSelected = allFilteredIds.every(id => selectedLogIds.includes(id));
                  if (allFilteredIds.length === 0) return;
                  if (isAllSelected) {
                    setSelectedLogIds(prev => prev.filter(id => !allFilteredIds.includes(id)));
                  } else {
                    setSelectedLogIds(prev => {
                      const newOnes = allFilteredIds.filter(id => !prev.includes(id));
                      return [...prev, ...newOnes];
                    });
                  }
                }}
                className="p-1.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/25 text-white/70 hover:text-white transition-colors cursor-pointer flex items-center gap-2 text-[11px] font-semibold"
              >
                {filteredEventLogs.length > 0 && filteredEventLogs.map(l => l.id).every(id => selectedLogIds.includes(id)) ? (
                  <CheckSquare className="h-3.5 w-3.5 text-red-400" />
                ) : (
                  <Square className="h-3.5 w-3.5" />
                )}
                Выбрать все на странице
              </button>

              <div>
                <span className="font-semibold text-white/80">Поток системных триггеров: <strong className="text-red-400">Live</strong></span>
                <p className="text-[10px] text-white/45 mt-0.5 font-mono uppercase">Карелия • System-wide telemetry</p>
              </div>
            </div>
            <div className="text-[10.5px] text-white/50 font-mono bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
              Показано записей: <strong className="text-brand-gold">{filteredEventLogs.length}</strong> / {activityLog.length}
            </div>
          </div>

          {/* Activity Logs Filter Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 rounded-2xl bg-[#081524]/75 border border-white/10">
            <div className="space-y-1 text-left">
              <label className="text-[10px] text-white/45 uppercase font-mono block font-bold">Тип события лога</label>
              <select
                value={activityTypeFilter}
                onChange={(e) => {
                  setActivityTypeFilter(e.target.value);
                  setSelectedLogIds([]); // clear selection when filters change
                }}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-red-500/50 cursor-pointer"
              >
                <option value="all">Все события (All logs)</option>
                <option value="booking">Бронирования (Booking events)</option>
                <option value="user">Пользователи (User actions)</option>
                <option value="tour">Предложения / Туры (Catalog tours)</option>
                <option value="partner">Партнеры (Partners operations)</option>
                <option value="system">Система (System triggers)</option>
              </select>
            </div>

            <div className="space-y-1 text-left">
              <label className="text-[10px] text-white/45 uppercase font-mono block font-bold">Временной промежуток</label>
              <select
                value={activityTimeFilter}
                onChange={(e) => {
                  setActivityTimeFilter(e.target.value);
                  setSelectedLogIds([]); // clear selection when filters change
                }}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-red-500/50 cursor-pointer"
              >
                <option value="all">Всё время (All time)</option>
                <option value="1h">Последний час (Last 1 hour)</option>
                <option value="24h">Последние 24 часа (Last 24 hours)</option>
                <option value="7d">Последние 7 дней (Last 7 days)</option>
              </select>
            </div>
          </div>

          {/* Bulk logs actions banner */}
          {selectedLogIds.length > 0 && (
            <div className="flex items-center justify-between p-3.5 bg-red-500/10 border border-red-500/20 rounded-2xl animate-fade-in text-left">
              <span className="text-xs text-white/80">
                Выбрано лог-записей: <strong className="text-red-400 text-sm font-mono">{selectedLogIds.length}</strong>
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActivityLog(prev => prev.filter(act => !selectedLogIds.includes(act.id)));
                    addActivityEvent(
                      `Администратор пакетно удалил ${selectedLogIds.length} лог-записей из системного журнала.`,
                      "system",
                      "warning"
                    );
                    setSelectedLogIds([]);
                  }}
                  className="px-4 py-2 bg-red-500 hover:bg-red-650 text-white font-extrabold text-xs uppercase transition-all rounded-xl cursor-pointer flex items-center gap-1.5 shadow"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Очистить выбранное
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLogIds([])}
                  className="px-3 py-2 bg-white/5 hover:bg-white/10 text-white/70 font-semibold text-[11px] rounded-xl"
                >
                  Снять выбор
                </button>
              </div>
            </div>
          )}

          <div className="p-5 bg-black/60 rounded-3xl border border-white/10 font-mono text-[11px] leading-relaxed max-h-[480px] overflow-y-auto space-y-2.5 shadow-2xl scrollbar-thin">
            {filteredEventLogs.map((act) => {
              let badgeColor = "bg-white/15 text-white";
              let textColor = "text-white/85";

              if (act.severity === "success") {
                badgeColor = "bg-brand-green/20 text-[#71f0bc] border border-brand-green/30";
              } else if (act.severity === "warning") {
                badgeColor = "bg-yellow-500/15 text-yellow-300 border border-yellow-500/25";
                textColor = "text-yellow-100/90";
              } else {
                badgeColor = "bg-blue-500/10 text-blue-300 border border-blue-500/20";
              }

              const isSelected = selectedLogIds.includes(act.id);

              return (
                <div 
                  key={act.id} 
                  className={`p-3 border rounded-xl hover:bg-white/4 transition-all duration-150 flex items-start gap-3 ${
                    isSelected ? "bg-red-500/5 border-red-500/25 shadow-sm" : "bg-white/2 border-white/5"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedLogIds(prev => 
                        prev.includes(act.id) ? prev.filter(id => id !== act.id) : [...prev, act.id]
                      );
                    }}
                    className="mt-0.5 text-white/35 hover:text-red-400 transition-colors shrink-0"
                    title="Выбрать эту запись"
                  >
                    {isSelected ? (
                      <CheckSquare className="h-4 w-4 text-red-400" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </button>

                  <span className="text-white/35 shrink-0 text-[10px] select-none font-bold align-middle mt-1">
                    {act.time}
                  </span>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-left flex-1 min-w-0">
                    <span className={`text-[8.5px] uppercase font-black px-1.5 py-0.5 rounded leading-none text-center select-none font-mono tracking-wider ${badgeColor}`}>
                      {act.type}
                    </span>
                    <p className={`truncate font-mono ${textColor}`}>
                      {act.text}
                    </p>
                  </div>

                  <span className="hidden md:inline-flex items-center gap-1 text-[9px] text-white/20 select-none">
                    <Check className="h-3 w-3 stroke-[2.5]" /> OK
                  </span>
                </div>
              );
            })}

            {filteredEventLogs.length === 0 && (
              <div className="text-center py-12 text-white/35 font-sans">
                События по выбранным фильтрам отсутствуют
              </div>
            )}
          </div>
        </div>
      )}

      {activeSubTab === "integrity" && (
        <div className="space-y-6 animate-fade-in" id="admin-panel-integrity">
          {/* KPI indicators element header */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white/2 border border-white/5 font-sans space-y-1">
              <span className="text-[10px] text-white/40 uppercase font-mono block font-bold">Аптайм Системы</span>
              <div className="text-xl font-bold text-white font-mono flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                99.98%
              </div>
              <p className="text-[10px] text-white/40 font-light">Доступен 42 дня без перезапуска</p>
            </div>

            <div className="p-5 rounded-2xl bg-white/2 border border-white/5 font-sans space-y-1">
              <span className="text-[10px] text-white/40 uppercase font-mono block font-bold font-mono">Latency API</span>
              <div className="text-xl font-bold text-[#71f0bc] font-mono">12 ms</div>
              <p className="text-[10px] text-white/40 font-light">Сверхнизкая задержка edge-CDN</p>
            </div>

            <div className="p-5 rounded-2xl bg-white/2 border border-white/5 font-sans space-y-1">
              <span className="text-[10px] text-white/40 uppercase font-mono block font-bold">Базы Данных</span>
              <div className="text-xl font-bold text-brand-gold font-mono">100% OK</div>
              <p className="text-[10px] text-white/40 font-light">Firestore реестры синхронизированы</p>
            </div>

            <div className="p-5 rounded-2xl bg-white/2 border border-white/5 font-sans space-y-1">
              <span className="text-[10px] text-white/40 uppercase font-mono block font-bold">Ресурсная Емкость</span>
              <div className="text-xl font-bold text-purple-400 font-mono">18 / 42%</div>
              <p className="text-[10px] text-white/40 font-light">CPU: 18% | RAM: 42% нагрузки</p>
            </div>
          </div>

          <div className="p-6 rounded-3xl border border-white/10 bg-dark-card text-left space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-semibold text-white">Монитор целостности и здоровья платформы</h4>
                <p className="text-xs text-white/50 mt-1">Запустите диагностическое сканирование инфраструктуры для верификации баз данных, сертификатов шифрования HTTPS и токенов API.</p>
              </div>

              <button
                type="button"
                disabled={diagnosticMode === "running"}
                onClick={runSystemDiagnostics}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shrink-0 transition-all active:scale-95 duration-150 cursor-pointer ${
                  diagnosticMode === "running"
                    ? "bg-white/10 text-white/40 border border-white/5 cursor-not-allowed"
                    : "bg-red-500 hover:bg-red-650 text-white shadow-lg shadow-red-500/15"
                }`}
              >
                {diagnosticMode === "running" ? "Сканирование..." : "Запустить тест целостности"}
              </button>
            </div>

            {/* Diagnostic console */}
            {diagnosticMode !== "idle" && (
              <div className="p-4 bg-black/80 rounded-2xl border border-white/10 font-mono text-[11px] text-left space-y-2.5 shadow-inner">
                <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2 select-none">
                  <span className="text-[10px] text-white/45 tracking-wider uppercase font-bold flex items-center gap-1.5 font-mono">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
                    Интерактивная диагностическая консоль
                  </span>
                  
                  {diagnosticMode === "running" && (
                    <span className="text-[10px] text-red-400 animate-pulse font-bold">{diagnosticProgress}%</span>
                  )}
                </div>

                {/* Progress bar */}
                {diagnosticMode === "running" && (
                  <div className="w-full bg-white/5 rounded-full h-1 relative overflow-hidden">
                    <div 
                      className="bg-red-400 h-full rounded-full transition-all duration-350" 
                      style={{ width: `${diagnosticProgress}%` }}
                    />
                  </div>
                )}

                <div className="space-y-1.5 pt-1 text-white/90">
                  {diagnosticLogs.map((log, lIdx) => (
                    <p key={lIdx} className="leading-relaxed select-text">
                      <span className="text-white/35 mr-1.5 font-mono">[{lIdx + 1}]</span>
                      {log}
                    </p>
                  ))}
                </div>

                {diagnosticMode === "ready" && (
                  <div className="mt-4 p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[#71f0bc] text-xs font-semibold flex items-center gap-2">
                    <Check className="h-4 w-4 stroke-[2.5]" />
                    <span>Проверка завершена успешно. Платформа полностью стабильна, сбоев на портах и сокетах не зафиксировано!</span>
                  </div>
                )}
              </div>
            )}

            {/* Default Status block */}
            {diagnosticMode === "idle" && (
              <div className="relative p-8 rounded-2xl border border-white/5 bg-white/2 text-center space-y-2.5 overflow-hidden">
                <div className="h-10 w-10 mx-auto rounded-full bg-white/5 flex items-center justify-center text-white/40">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <h5 className="text-xs font-semibold text-white">Сканирование систем еще не запущено</h5>
                  <p className="text-[11px] text-white/40 max-w-sm mx-auto mt-0.5">В последний раз диагностика проводилась 4 часа назад. Рекомендуется запускать проверку перед пиковыми периодами продаж.</p>
                </div>
              </div>
            )}
          </div>

          {/* Database Consistency / System Health Card */}
          <div className="p-6 rounded-3xl border border-white/10 bg-dark-card text-left space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2.5">
                <Database className="h-5 w-5 text-red-400" />
                <div>
                  <h4 className="text-sm font-semibold text-white">Статус согласованности таблиц (System Health)</h4>
                  <p className="text-[11px] text-white/40 mt-0.5">Внутренний аудит целостности реляционной структуры БД.</p>
                </div>
              </div>

              {/* System Health Toggle switch */}
              <button
                type="button"
                onClick={() => setIsSystemHealthToggled(!isSystemHealthToggled)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isSystemHealthToggled ? "bg-red-500" : "bg-white/10"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isSystemHealthToggled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {isSystemHealthToggled ? (
              <div className="space-y-4 animate-fade-in">
                {healthIssues.length > 0 ? (
                  <>
                    <div className="p-4 bg-red-500/5 rounded-2xl border border-red-500/25 space-y-3">
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <span className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                          <CheckSquare className="h-4 w-4 text-red-500" />
                          Выявлено несоответствий в БД ({healthIssues.length})
                        </span>
                        
                        <button
                          type="button"
                          disabled={fixingHealth}
                          onClick={handleFixAllHealthIssues}
                          className="px-3.5 py-1.5 bg-red-500 hover:bg-red-650 disabled:bg-white/10 text-white font-black text-[10.5px] uppercase rounded-xl transition duration-150 cursor-pointer flex items-center gap-1.5 shadow"
                        >
                          {fixingHealth ? (
                            <>
                              <RefreshCw className="h-3 w-3 animate-spin" />
                              Исправление...
                            </>
                          ) : (
                            <>
                              <Wrench className="h-3 w-3" />
                              Исправить все (Fix All)
                            </>
                          )}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-1">
                        {healthIssues.map((issue) => {
                          return (
                            <div key={issue.id} className="p-3 bg-black/40 border border-white/5 rounded-xl flex items-start gap-2.5 font-mono">
                              <div className="mt-0.5 shrink-0">
                                {issue.severity === "critical" ? (
                                  <span className="h-2 w-2 rounded-full bg-red-400 block animate-pulse" />
                                ) : (
                                  <span className="h-2 w-2 rounded-full bg-amber-400 block" />
                                )}
                              </div>
                              <div className="space-y-1">
                                <p className="text-[11px] font-bold text-white leading-tight">{issue.title}</p>
                                <p className="text-[9.5px] text-white/45 leading-relaxed font-sans">{issue.desc}</p>
                                <span className={`text-[8px] font-bold px-1 py-0.2 rounded leading-none uppercase tracking-wider ${
                                  issue.severity === "critical" ? "bg-red-500/10 text-red-400" : "bg-amber-500/10 text-amber-400"
                                }`}>
                                  {issue.severity === "critical" ? "Критическая ошибка" : "Мягкое предупреждение"}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-8 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex flex-col items-center justify-center text-center space-y-2 animate-fade-in">
                    <div className="h-10 w-10 rounded-full bg-emerald-500/15 flex items-center justify-center text-[#71f0bc] shadow-inner">
                      <Check className="h-5 w-5 stroke-[2.5]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">База данных в идеальном порядке</h4>
                      <p className="text-[11px] text-white/45 mt-0.5">Все проверки связей реляционных ключей (Referential Integrity checks) пройдены успешно!</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-5 rounded-2xl border border-white/5 bg-white/2 text-center text-white/35 text-xs select-none">
                Включите переключатель "Database Health Monitor" для фонового анализа сущностей и выявления скрытых аномалий в реальном времени.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Central safety confirm dialogue modal popup overlay */}
      {confirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in pointer-events-auto">
          <div className="w-full max-w-md p-6 bg-[#091524] border border-white/10 rounded-3xl text-left space-y-4 shadow-2xl relative overflow-hidden">
            {/* Background heat accent line */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-[2px] bg-red-500 blur-[2px] opacity-60" />
            
            <div className="flex items-center gap-3 text-red-400 text-left">
              <div className="h-10 w-10 rounded-xl bg-red-400/10 border border-red-500/20 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Подтверждение удаления</h4>
                <p className="text-[9px] font-mono text-red-400 uppercase tracking-widest leading-none mt-0.5">Административный Контроль</p>
              </div>
            </div>
            
            <div className="p-4 bg-white/2 border border-white/5 rounded-2xl">
              <p className="text-xs text-white/90 leading-relaxed font-semibold">
                {confirmModal.message}
              </p>
              <p className="text-[10px] text-white/45 mt-2.5 leading-relaxed">
                Внимание: Данное действие является необратимым. Запись сотрется с внутренних реестров в реальном времени.
              </p>
            </div>
            
            <div className="flex gap-2 pt-2.5">
              <button
                type="button"
                onClick={confirmModal.onConfirm}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-650 active:scale-95 text-white font-bold text-xs uppercase tracking-wider transition-all duration-150 cursor-pointer text-center"
              >
                Удалить запись
              </button>
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 font-bold text-xs uppercase tracking-wider text-center"
              >
                Отменить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
