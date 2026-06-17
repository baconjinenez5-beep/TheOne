import { useState, useMemo, FormEvent } from "react";
import { 
  CircleDollarSign, 
  Check, 
  X, 
  Sparkles, 
  Info, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  CreditCard, 
  ArrowRight, 
  QrCode, 
  Copy, 
  TrendingUp, 
  Percent, 
  ChevronRight,
  Calculator
} from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

interface PricingBlockProps {
  partnerSession?: { company: string; email: string; level: string } | null;
  setPartnerSession?: (session: any) => void;
  setActiveTab?: (tab: string) => void;
}

export default function PricingBlock({ partnerSession, setPartnerSession, setActiveTab }: PricingBlockProps = {}) {
  const [billing, setBilling] = useState<"month" | "quarter" | "year">("month");
  const [monthlySales, setMonthlySales] = useState(250000); // dynamic sales slider
  const [showComparison, setShowComparison] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  
  // Custom modal for tariff purchase simulation to avoid window.alert
  const [selectedTierForCheckout, setSelectedTierForCheckout] = useState<any | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<"form" | "success">("form");
  const [checkoutBrand, setCheckoutBrand] = useState("");
  const [checkoutPhone, setCheckoutPhone] = useState("");
  const [checkoutEmail, setCheckoutEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"sbp" | "card" | "invoice">("sbp");
  const [copiedLink, setCopiedLink] = useState(false);

  const billingMultipliers = {
    month: 1,
    quarter: 0.9,  // 10% discount
    year: 0.8,     // 20% discount
  };

  const getPrice = (base: number) => {
    if (base === 0) return 0;
    return Math.round(base * billingMultipliers[billing]);
  };

  const tiers = [
    {
      name: "Free",
      price: 0,
      badge: "Старт бизнеса",
      commissionRate: 0.12, // 12%
      desc: "Для начинающих гидов Карелии и частных экстремалов. Попробуйте без обязательств и рисков.",
      features: [
        "1 активное объявление в каталоге",
        "Базовая карточка без калькулятора опций",
        "Приём звонков и лидов на почту",
        "Комиссия на сделки: 12%",
        "Базовая статистика (просмотры)",
        "Ручная верификация экскурсий"
      ],
      color: "border-white/10 text-white",
      darkBg: "bg-dark-card/40 backdrop-blur-md"
    },
    {
      name: "Pro",
      price: 4900,
      badge: "Рекомендуем",
      commissionRate: 0.05, // 5%
      featured: true,
      desc: "Для регулярных агентств, организаторов туров, яхт и баз отдыха. Сниженная комиссия и CRM-кабинет.",
      features: [
        "До 10 активных объявлений",
        "Интерактивный калькулятор опций и броней",
        "Полноценный CRM-кабинет лидов",
        "Комиссия со сделок снижена до 5%",
        "Аналитика просмотров и CTR в реальном времени",
        "Приоритетный показ в каталоге Сортавала и СПб",
        "Поддержка импорта Excel/XML",
        "СМС-оповещения владельца при новых заявках"
      ],
      color: "border-brand-gold bg-brand-gold/5 shadow-brand-gold/10 text-white",
      darkBg: "bg-brand-gold/[0.03] backdrop-blur-md"
    },
    {
      name: "Premium",
      price: 12900,
      badge: "Максимальный рост",
      commissionRate: 0.02, // 2%
      desc: "Для профессиональных туроператоров, глэмпингов и сетей отелей. Абсолютное лидерство в каталоге.",
      features: [
        "Безлимитное количество объявлений в каталоге",
        "Комиссия со сделок всего 2% (минимальная ставка)",
        "SEO-оптимизация описаний экспертом платформы",
        "Личный менеджер 24/7 по интеграции",
        "Брендирование страницы под цвета вашей компании",
        "Подключение своего домена для броней (например, tours.yourdomain.ru)",
        "Доступ к закрытому клубу организаторов Карелии",
        "Сквозная API-интеграция с вашей CRM (Amo, Битрикс24)"
      ],
      color: "border-white/10 text-white",
      darkBg: "bg-dark-card/40 backdrop-blur-md"
    }
  ];

  // Calculations of commission vs monthly volume
  const calculateCommissionForTier = (rate: number) => Math.round(monthlySales * rate);
  
  const calculateTotalExpensesForTier = (rate: number, fee: number) => {
    const discountedFee = Math.round(fee * billingMultipliers[billing]);
    return calculateCommissionForTier(rate) + (fee === 0 ? 0 : discountedFee);
  };

  // Compare and calculate pure savings for Pro and Premium compared to Free
  const activeCalculations = useMemo(() => {
    const freeExp = calculateTotalExpensesForTier(0.12, 0);
    const proExp = calculateTotalExpensesForTier(0.05, 4900);
    const premExp = calculateTotalExpensesForTier(0.02, 12900);

    const isProProfitable = freeExp > proExp;
    const isPremProfitable = freeExp > premExp;

    return {
      freeExp,
      proExp,
      premExp,
      proSavings: freeExp - proExp,
      premSavings: freeExp - premExp,
      isProProfitable,
      isPremProfitable,
      breakEvenPro: 4900 / (0.12 - 0.05), // ~70,000 руб
      breakEvenPrem: 12900 / (0.12 - 0.02) // ~129,000 руб
    };
  }, [monthlySales, billing]);

  const toggleFaq = (idx: number) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  const handleOpenCheckout = (tier: any) => {
    setSelectedTierForCheckout(tier);
    setCheckoutBrand("");
    setCheckoutPhone("");
    setCheckoutEmail("");
    setCheckoutStep("form");
  };

  const handleConfirmCheckoutSubmit = (e: FormEvent) => {
    e.preventDefault();
    setCheckoutStep("success");
  };

  const handleCopyCredentials = () => {
    navigator.clipboard.writeText("ТЕЛЕФОН: +7 (999) 123-45-67 / Счёт 40702810900000012345");
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const comparisonMatrix = [
    { feature: "Максимальное число объявлений", free: "1 шт", pro: "До 10 шт", premium: "Безлимитно" },
    { feature: "Комиссия с успешных броней", free: "12%", pro: "5%", premium: "2%" },
    { feature: "СМС-уведомления о гидах", free: "✕ Нет", pro: "✓ Да", premium: "✓ Мгновенно" },
    { feature: "Калькулятор цен в карточке", free: "✕ Нет (Статично)", pro: "✓ Интерактивный", premium: "✓ Кастомный калькулятор" },
    { feature: "Аналитика просмотров и CTR", free: "Базовая статистика", pro: "CRM дашборд", premium: "Глубокая сквозная аналитика" },
    { feature: "Приоритет в поисковой выдаче", free: "Обычный", pro: "Высокий (Рекомендуемые)", premium: "Максимальный (Топ закрепы)" },
    { feature: "Поддержка собственного домена", free: "✕ Нет", freeVal: false, pro: "✕ Нет", premium: "✓ Да (SSL бесплатно)" },
    { feature: "Выгрузка XML/YML фидов услуг", free: "✕ Нет", pro: "✓ Да", premium: "✓ Да + API" },
    { feature: "Профессиональный копирайтинг", free: "✕ Нет", pro: "✕ Нет", premium: "✓ 3 промо-текста в подарок" },
    { feature: "Персональный менеджер Карелии", free: "Email поддержка", pro: "Чат поддержки", premium: "Персональный куратор 24/7" },
  ];

  const faqs: FAQItem[] = [
    {
      question: "Как рассчитывается экономия комиссии на тарифе Pro и Premium?",
      answer: "На бесплатном тарифе вы не платите абонентский сбор, но отдаёте 12% с каждого проданного места. На тарифе Pro вы платите фиксированный сбор (4 900 ₽ в месяц) взамен на пятикратное снижение комиссии до 5%. С помощью калькулятора вы можете наглядно увидеть, что при продажах всего от 70 тыс. рублей в месяц фиксированный сбор полностью окупается, сохраняя вам больше чистой маржи."
    },
    {
      question: "Могу ли я в любой момент поменять или отменить подписку?",
      answer: "Да, никаких долгоиграющих контрактов. Обновление тарифа происходит моментально, а при понижении тарифа неиспользованные дни переводятся на внутренний баланс личного кабинета, который можно тратить на разовые опции продвижения карточек."
    },
    {
      question: "Как происходит интеграция с местными кассами и эквайрингом?",
      answer: "The One Point поддерживает фискализацию всех чеков в соответствии с 54-ФЗ РФ. Мы работаем через шлюз быстрых платежей СБП, ЮKassa и СберБизнес. На тарифах Pro и Premium вы можете подключить собственные мерчант-аккаунты, чтобы деньги поступали сразу напрямую на ваш расчетный счет юрлица/ИП на следующий день."
    },
    {
      question: "Подходит ли тариф Free для тестирования спроса?",
      answer: "Безусловно! Вы можете выложить 1 основное событие (например, сплав на рафтах по реке Шуя или аренду квадроциклов), настроить форму сбора контактов и оценить входящий трафик абсолютно бесплатно. Вы перейдете на платный тариф только тогда, когда сами захотите масштабировать бизнес."
    },
    {
      question: "Предоставляются ли закрывающие документы для бухгалтерии?",
      answer: "Да, для ИП и ООО на тарифах Pro и Premium мы ежемесячно отправляем оригиналы закрывающих актов через систему ЭДО Диадок или Почтой России, упрощая учет расходов на маркетинг."
    }
  ];

  return (
    <div className="space-y-12 relative">
      
      {/* Glow decorative background elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-gold/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-brand-green/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header text container */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest text-brand-gold uppercase bg-brand-gold/5 px-4 py-1.5 rounded-full border border-brand-gold/10">
          <CircleDollarSign className="h-4 w-4 text-brand-gold" />
          <span>Тарифные пакеты для бизнеса</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-light text-white leading-tight">
          Прозрачные условия без{` `}
          <span className="font-semibold text-brand-gold">скрытых наценок</span>
        </h2>
        <p className="text-sm text-white/60 leading-relaxed font-light">
          Масштабируйте ваши продажи туристических услуг, аренды техники и глэмпингов в Карелии и СЗФО. Выберите удобный формат и получите скидку до 20%.
        </p>

        {/* Dynamic Billing Switcher */}
        <div className="inline-flex p-1 bg-black/40 border border-white/10 rounded-full select-none mt-4">
          {[
            { id: "month", label: "Помесячно" },
            { id: "quarter", label: "Квартал (−10%)" },
            { id: "year", label: "Год (−20%)" }
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => setBilling(opt.id as any)}
              id={`billing-toggle-enhanced-${opt.id}`}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                billing === opt.id
                  ? "bg-brand-gold text-dark-bg font-bold shadow-md shadow-brand-gold/10"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid displaying 3 Tiers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {tiers.map((t, idx) => {
          const basePrice = t.price;
          const discountedMonthPrice = getPrice(basePrice);
          const totalBillingCyclePrice = discountedMonthPrice * (billing === "month" ? 1 : billing === "quarter" ? 3 : 12);
          
          return (
            <div
              key={t.name}
              id={`pricing-tier-${idx}`}
              className={`relative rounded-3xl p-6 sm:p-8 border flex flex-col justify-between transition-all duration-350 ${t.color} ${t.darkBg} ${partnerSession?.level === t.name ? "border-brand-green scale-101 shadow-md shadow-brand-green/5" : t.featured ? "scale-101 border-brand-gold/40 shadow-xl" : "hover:border-white/15"}`}
            >
              {partnerSession?.level === t.name ? (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-green text-dark-bg text-[10px] font-extrabold tracking-widest uppercase px-4 py-1.5 rounded-full shadow-lg shadow-brand-green/25 flex items-center gap-1">
                  ✓ ВАШ ТЕКУЩИЙ ТАРИФ
                </span>
              ) : t.featured ? (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-gold text-dark-bg text-[10px] font-extrabold tracking-widest uppercase px-4 py-1.5 rounded-full shadow-lg shadow-brand-gold/25 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 animate-pulse" />
                  ТОП ВЫБОР ОРГАНИЗАТОРОВ
                </span>
              ) : null}
              
              <div className="space-y-6 text-left">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">{t.name}</h3>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-brand-gold bg-brand-gold/10 px-2 py-0.5 rounded-md inline-block mt-1">
                      {t.badge}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl sm:text-3xl font-light font-mono text-brand-gold flex items-baseline justify-end">
                      {discountedMonthPrice.toLocaleString("ru")}
                      <span className="text-xs text-white/50 font-sans ml-1">₽/мес</span>
                    </div>
                    {billing !== "month" && basePrice > 0 && (
                      <span className="text-[10px] text-white/40 block mt-0.5 font-mono line-through">
                        {basePrice.toLocaleString("ru")} ₽
                      </span>
                    )}
                    <span className="text-[10.5px] text-[#74d5a6] font-mono block mt-1">
                      Комиссия: {t.commissionRate * 100}%
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-[13px] text-white/60 leading-relaxed font-light min-h-[50px]">
                  {t.desc}
                </p>

                {/* Total Payment Details info box */}
                {basePrice > 0 && (
                  <div className="bg-white/2 border border-white/5 rounded-xl p-3 text-[11px] text-white/50 font-light flex justify-between items-center font-mono">
                    <span>Платёж за цикл ({billing === "quarter" ? "3 мес." : "12 мес."}):</span>
                    <span className="text-white font-bold">{totalBillingCyclePrice.toLocaleString("ru")} ₽</span>
                  </div>
                )}

                {/* Features list checkmark display */}
                <div className="pt-4 border-t border-white/5 space-y-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-white/40 block">В тариф включено:</span>
                  <div className="space-y-2.5">
                    {t.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2.5 text-xs text-white/80">
                        <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-brand-green/20 text-[#74d5a6] font-bold text-[10px] mt-0.5">
                          ✓
                        </span>
                        <span className="leading-tight">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action purchase simulate trigger */}
              <div className="mt-8 pt-4 border-t border-white/5">
                <button
                  id={`btn-select-tier-enhanced-${t.name}`}
                  disabled={partnerSession?.level === t.name}
                  onClick={() => handleOpenCheckout(t)}
                  className={`w-full py-3.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                    partnerSession?.level === t.name
                      ? "bg-brand-green/10 text-brand-green border border-brand-green/30 cursor-default"
                      : t.featured
                        ? "bg-brand-gold hover:bg-brand-gold-hover text-dark-bg shadow-lg shadow-brand-gold/15 active:scale-98"
                        : "bg-white/5 hover:bg-white/10 text-white/95 border border-white/10 hover:border-white/15 active:scale-98"
                  }`}
                >
                  {partnerSession?.level === t.name 
                    ? "✓ Пользуетесь сейчас" 
                    : partnerSession 
                      ? `Перейти на ${t.name}` 
                      : t.price === 0 
                        ? "Начать бесплатно" 
                        : `Выбрать тариф ${t.name}`}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dynamic Cost Savings Interactive Simulator */}
      <div className="rounded-3xl border border-white/10 bg-dark-card p-6 sm:p-8 space-y-6 relative overflow-hidden text-left">
        <div className="absolute top-0 right-0 w-48 h-48 bg-brand-gold/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#74d5a6] bg-[#74d5a6]/10 px-3.5 py-1 rounded-full inline-flex items-center gap-1">
              <Calculator className="h-3 w-3" />
              Интерактивный выгодомер комиссии
            </span>
            <h3 className="text-xl font-light text-white mt-3">
              Рассчитайте маржинальность и чистую прибыль
            </h3>
            <p className="text-xs text-white/50 font-light mt-1">
              Двигайте слайдер ежемесячного дохода с туров, чтобы увидеть, при каком пороге платный тариф окупается на 300%+
            </p>
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Частный гид", value: 80000 },
              { label: "Кэмп-клуб", value: 350000 },
              { label: "Туроператор", value: 1200000 }
            ].map((preset) => (
              <button
                key={preset.label}
                onClick={() => setMonthlySales(preset.value)}
                className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-white/5 border border-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
              >
                {preset.label}: {preset.value.toLocaleString("ru")} ₽
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-t border-b border-white/5 py-6">
          {/* Input side with Slider */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex justify-between items-center bg-black/40 p-4 rounded-2xl border border-white/5">
              <span className="text-xs text-white/50">Месячный оборот продаж:</span>
              <span className="text-xl font-mono font-bold text-brand-gold">
                {monthlySales.toLocaleString("ru")} ₽
              </span>
            </div>

            <div className="relative pt-2">
              <input
                id="sales-slider-input-enhanced"
                type="range"
                min="30000"
                max="2500000"
                step="20000"
                className="w-full h-1.5 accent-brand-gold rounded-lg cursor-pointer bg-white/10 appearance-none"
                value={monthlySales}
                onChange={(e) => setMonthlySales(Number(e.target.value))}
              />
              <div className="flex justify-between text-[10px] text-white/30 pt-1 font-mono">
                <span>30 тыс. ₽</span>
                <span>500 тыс. ₽</span>
                <span>1.2 млн. ₽</span>
                <span>2.5 млн. ₽</span>
              </div>
            </div>

            {/* Payback logic tips widget */}
            <div className="p-3 bg-white/2 rounded-xl border border-white/5 text-[11px] text-white/50 leading-relaxed space-y-1">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-brand-green" />
                <span className="text-white font-medium">Почему это выгодно?</span>
              </div>
              <p>
                Порог окупаемости тарифа <span className="text-brand-gold font-semibold">Pro</span> составляет всего <b>70 000 ₽</b> в месяц. Продавая свыше этой суммы, комиссия 5% бережет ваши деньги в сравнении с 12%-ной ставкой Free.
              </p>
            </div>
          </div>

          {/* Result cards comparisons side */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Free widget list */}
            <div className="p-4 rounded-2xl border border-white/5 bg-black/25 flex flex-col justify-between space-y-3">
              <div>
                <span className="text-[10px] text-red-400 font-bold uppercase tracking-widest block font-mono">
                  Тариф FREE
                </span>
                <span className="text-xs text-white/40 block mt-1">
                  Ставка комиссии: 12%
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-white/30 block uppercase font-mono">Расходы</span>
                <span className="text-base font-mono font-bold text-white/80">
                  {activeCalculations.freeExp.toLocaleString("ru")} ₽
                </span>
              </div>
              <div className="text-[10px] text-white/35 font-light leading-tight pt-2 border-t border-white/5">
                Абонентская плата: 0 ₽. Идеально для первых 1-2 запусков туров.
              </div>
            </div>

            {/* Pro widget list with live savings estimation */}
            <div className="p-4 rounded-2xl border border-brand-gold/30 bg-brand-gold/5 flex flex-col justify-between space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 h-10 w-10 bg-brand-gold/10 rounded-full blur-md pointer-events-none" />
              <div>
                <span className="text-[10px] text-brand-gold font-bold uppercase tracking-widest block font-mono">
                  Тариф PRO
                </span>
                <span className="text-xs text-white/40 block mt-1">
                  Ставка: 5% + абон. плата
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-white/30 block uppercase font-mono">Расходы</span>
                <span className="text-base font-mono font-bold text-white">
                  {activeCalculations.proExp.toLocaleString("ru")} ₽
                </span>
              </div>
              <div className="pt-2 border-t border-white/5">
                {activeCalculations.proSavings > 0 ? (
                  <div className="bg-brand-green/10 text-brand-green font-bold text-[10px] px-2 py-0.5 rounded-md inline-block font-mono animate-pulse">
                     Сбережено: +{activeCalculations.proSavings.toLocaleString("ru")} ₽
                  </div>
                ) : (
                  <span className="text-[10px] text-white/45 block leading-tight font-light">
                    Пока не окупается. Рекомендуется от 70 тыс. обора.
                  </span>
                )}
              </div>
            </div>

            {/* Premium widget list with live savings estimation */}
            <div className="p-4 rounded-2xl border border-[#74d5a6]/30 bg-[#74d5a6]/3 flex flex-col justify-between space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 h-10 w-10 bg-[#74d5a6]/10 rounded-full blur-md pointer-events-none" />
              <div>
                <span className="text-[10px] text-brand-green font-bold uppercase tracking-widest block font-mono">
                  Тариф PREMIUM
                </span>
                <span className="text-xs text-white/40 block mt-1">
                  Ставка: 2% + абон. плата
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-white/30 block uppercase font-mono">Расходы</span>
                <span className="text-base font-mono font-bold text-white">
                  {activeCalculations.premExp.toLocaleString("ru")} ₽
                </span>
              </div>
              <div className="pt-2 border-t border-white/5">
                {activeCalculations.premSavings > 0 ? (
                  <div className="bg-brand-green/20 text-[#74d5a6] font-bold text-[10px] px-2 py-0.5 rounded-md inline-block font-mono">
                    Сбережено: +{activeCalculations.premSavings.toLocaleString("ru")} ₽
                  </div>
                ) : (
                  <span className="text-[10px] text-white/45 block leading-tight font-light">
                    Выгодно при продажах от 130 тыс. руб/мес.
                  </span>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Action helper footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-light text-white/60">
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-brand-gold shrink-0 animate-bounce" />
            <p>
              Все комиссии рассчитываются исключительно с успешных покупок туристов. The One Point никогда не берет процент с незавершенных заказов!
            </p>
          </div>
          {activeCalculations.proSavings > 0 && (
            <div className="font-mono text-[11px] font-bold text-white uppercase tracking-widest bg-brand-gold/15 border border-brand-gold/20 px-3 py-1.5 rounded-lg">
               Ваш выбор сегодня: ТАРИФ PRO
            </div>
          )}
        </div>
      </div>

      {/* Comparison Matrix Expandable Control Toggle */}
      <div className="text-center">
        <button
          onClick={() => setShowComparison(!showComparison)}
          id="toggle-comparison-matrix-btn"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-white/10 bg-white/2 hover:bg-white/5 hover:border-white/20 text-white font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer select-none"
        >
          <span>{showComparison ? "Скрыть таблицу сравнения" : "Показать детальную таблицу сравнения тарифов"}</span>
          {showComparison ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Comparison Matrix Block */}
      {showComparison && (
        <div className="rounded-3xl border border-white/10 bg-dark-card/60 p-5 md:p-8 animate-fade-in space-y-6 overflow-hidden">
          <div className="text-left py-2 border-b border-white/5 mb-2">
            <h4 className="text-base font-semibold text-white">Полное сравнение возможностей платформы</h4>
            <p className="text-xs text-white/45 font-light">Выберите идеальную конфигурацию для автоматизации ваших экскурсий</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-white border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-white/10 font-mono text-[10px] uppercase text-white/40 tracking-wider">
                  <th className="py-3 px-4">Функциональные возможности</th>
                  <th className="py-3 px-4 text-center">Free</th>
                  <th className="py-3 px-4 text-center text-brand-gold">Pro</th>
                  <th className="py-3 px-4 text-center text-brand-green">Premium</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {comparisonMatrix.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-white/2 transition-colors">
                    <td className="py-4 px-4 font-light text-white/80">{row.feature}</td>
                    <td className="py-4 px-4 text-center font-mono text-white/50">{row.free}</td>
                    <td className="py-4 px-4 text-center font-mono font-semibold text-brand-gold">{row.pro}</td>
                    <td className="py-4 px-4 text-center font-mono font-semibold text-brand-green">{row.premium}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Direct FAQ Accordion block */}
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-brand-gold font-mono">
            FAQ // Вопросы об оплате
          </span>
          <h3 className="text-xl sm:text-2xl font-light text-white">Частые вопросы организаторов</h3>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, fIdx) => {
            const isOpen = activeFaq === fIdx;
            return (
              <div 
                key={fIdx}
                className="rounded-2xl border border-white/5 bg-dark-card/30 hover:border-white/10 transition-colors overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(fIdx)}
                  id={`pricing-faq-toggle-${fIdx}`}
                  className="w-full p-5 flex items-center justify-between text-left gap-4 font-semibold text-xs sm:text-sm text-white focus:outline-none select-none cursor-pointer"
                >
                  <span className="text-white/85 hover:text-white leading-relaxed">{faq.question}</span>
                  <span className="shrink-0 flex h-6 w-6 items-center justify-center rounded-lg bg-white/5 text-white/50">
                    {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </span>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-white/60 leading-relaxed font-light border-t border-white/5 bg-black/10 animate-fade-in text-left">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL SIMULATION FOR CHECKOUT/ACTIVATION */}
      {selectedTierForCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Black backdrop block */}
          <div 
            onClick={() => setSelectedTierForCheckout(null)} 
            className="absolute inset-0 bg-black/80 backdrop-blur-md" 
          />

          <div className="relative w-full max-w-lg overflow-hidden rounded-[32px] border border-white/10 bg-dark-card/95 p-6 sm:p-8 text-left shadow-2xl backdrop-blur-xl z-10 animate-fade-in">
            {/* Ambient decorative glow */}
            <div className="absolute -top-12 -left-12 h-32 w-32 rounded-full bg-brand-gold/10 blur-2xl pointer-events-none" />

            {/* Modal layout */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div>
                <span className="text-[10px] font-bold text-brand-gold uppercase tracking-widest font-mono block">
                  The One Point / Оформление подписки
                </span>
                <h3 className="text-lg font-light text-white mt-1">
                  Подключение тарифа <span className="font-semibold text-brand-gold">{selectedTierForCheckout.name}</span>
                </h3>
              </div>
              <button
                onClick={() => setSelectedTierForCheckout(null)}
                className="rounded-full p-2 hover:bg-white/5 text-white/40 hover:text-white transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {checkoutStep === "form" ? (
              partnerSession ? (
                /* Partner special instant transition */
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-brand-gold/5 border border-brand-gold/10 space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-brand-gold font-mono tracking-wider block">Детали выбранной опции:</span>
                    <div className="flex justify-between text-xs text-white font-medium">
                      <span>Новый тариф ({billing === "month" ? "Помесячно" : billing === "quarter" ? "Квартальный" : "Годовой"}):</span>
                      <span className="font-mono">{selectedTierForCheckout.name}</span>
                    </div>
                    <div className="flex justify-between text-xs text-white/60">
                      <span>Стоимость обслуживания:</span>
                      <span className="font-mono text-brand-gold">{getPrice(selectedTierForCheckout.price).toLocaleString("ru")} ₽/мес</span>
                    </div>
                    <div className="flex justify-between text-xs text-white/60">
                      <span>Комиссия за брони и эквайринг:</span>
                      <span className="font-mono text-[#74d5a6]">{selectedTierForCheckout.commissionRate * 100}% со сделок</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/3 border border-white/5 space-y-2">
                    <h4 className="text-xs uppercase font-bold tracking-wider text-white">Вы авторизованы как партнёр:</h4>
                    <div className="text-xs space-y-1 text-white/70">
                      <p>Компания: <span className="font-bold text-white font-mono">{partnerSession.company}</span></p>
                      <p>Email куратора: <span className="font-bold text-white font-mono">{partnerSession.email}</span></p>
                      <p>Текущий тариф: <span className="font-bold text-brand-gold font-mono">{partnerSession.level || "Free"}</span></p>
                    </div>
                    <p className="text-[11px] text-[#74d5a6] leading-relaxed font-light mt-1.5">
                      ✓ Платформа обновит лимиты объявлений и CRM фичи мгновенно. Счёт за обслуживание будет выставлен по Диадок.
                    </p>
                  </div>

                  <div className="space-y-2 pt-1">
                    <label className="block text-[10px] uppercase font-bold text-white/45">Выберите способ доплаты/активации</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: "sbp", label: "СБП QR-код", details: "Мгновенно" },
                        { id: "invoice", label: "Счёт для ООО/ИП", details: "По Диадок" }
                      ].map((m) => (
                        <button
                          type="button"
                          key={m.id}
                          onClick={() => setPaymentMethod(m.id as any)}
                          className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col justify-between items-center ${
                            paymentMethod === m.id
                              ? "bg-brand-gold/10 border-brand-gold text-brand-gold font-bold"
                              : "bg-black/20 border-white/5 hover:border-white/15 text-white/60 shrink-0"
                          }`}
                        >
                          <span className="text-[11px] leading-tight block">{m.label}</span>
                          <span className="text-[8px] font-mono text-white/35 font-light block mt-1 uppercase">{m.details}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (setPartnerSession && partnerSession) {
                        setPartnerSession({
                          ...partnerSession,
                          level: selectedTierForCheckout.name
                        });
                      }
                      setCheckoutStep("success");
                    }}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-xs font-bold uppercase tracking-wider bg-brand-gold text-dark-bg hover:bg-brand-gold-hover shadow-lg shadow-brand-gold/15 active:scale-95 transition-all text-center cursor-pointer mt-2"
                  >
                    <span>Активировать новый тариф мгновенно</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                /* Regular checkout form for guests and non-logged-in views */
                <form onSubmit={handleConfirmCheckoutSubmit} className="space-y-4">
                  
                  <div className="p-4 rounded-xl bg-brand-gold/5 border border-brand-gold/10 space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-brand-gold font-mono tracking-wider block">Детали выбранной опции:</span>
                    <div className="flex justify-between text-xs text-white font-medium">
                      <span>Тарифный план ({billing === "month" ? "Помесячно" : billing === "quarter" ? "Квартальный" : "Годовой"}):</span>
                      <span className="font-mono">{selectedTierForCheckout.name}</span>
                    </div>
                    <div className="flex justify-between text-xs text-white/60">
                      <span>Стоимость обслуживания в мес.:</span>
                      <span className="font-mono text-brand-gold">{getPrice(selectedTierForCheckout.price).toLocaleString("ru")} ₽</span>
                    </div>
                    <div className="flex justify-between text-xs text-white/60">
                      <span>Комиссия за эквайринг и брони:</span>
                      <span className="font-mono text-[#74d5a6]">{selectedTierForCheckout.commissionRate * 100}% со сделок</span>
                    </div>
                  </div>

                  {/* Form fields */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-white/45 mb-1.5">Название Организации / бренда</label>
                      <input
                        type="text"
                        required
                        placeholder="Например: Сортавала Тур Экстрим, Индивидуальный Гид"
                        className="w-full bg-black/40 border border-white/5 hover:border-white/15 focus:border-brand-gold text-white text-xs rounded-xl px-4 py-3 focus:ring-1 focus:ring-brand-gold outline-none"
                        value={checkoutBrand}
                        onChange={(e) => setCheckoutBrand(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-white/45 mb-1.5">Контактный телефон</label>
                        <input
                          type="tel"
                          required
                          placeholder="+7 (___) ___-__-__"
                          className="w-full bg-black/40 border border-white/5 hover:border-white/15 focus:border-brand-gold text-white text-xs rounded-xl px-4 py-3 focus:ring-1 focus:ring-brand-gold outline-none"
                          value={checkoutPhone}
                          onChange={(e) => setCheckoutPhone(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-white/45 mb-1.5">Email для отправки счетов</label>
                        <input
                          type="email"
                          required
                          placeholder="bill@company.ru"
                          className="w-full bg-black/40 border border-white/5 hover:border-white/15 focus:border-brand-gold text-white text-xs rounded-xl px-4 py-3 focus:ring-1 focus:ring-brand-gold outline-none"
                          value={checkoutEmail}
                          onChange={(e) => setCheckoutEmail(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Payment option selector */}
                  <div className="space-y-2 pt-2">
                    <label className="block text-[10px] uppercase font-bold text-white/45">Выберите метод оплаты</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "sbp", label: "СБП QR-код", details: "Мгновенно" },
                        { id: "card", label: "Банк. карты РФ", details: "ЮKassa 1.5%" },
                        { id: "invoice", label: "Счёт для юрлиц", details: "Для ООО/ИП" }
                      ].map((m) => (
                        <button
                          type="button"
                          key={m.id}
                          onClick={() => setPaymentMethod(m.id as any)}
                          className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col justify-between items-center ${
                            paymentMethod === m.id
                              ? "bg-brand-gold/10 border-brand-gold text-brand-gold font-bold"
                              : "bg-black/20 border-white/5 hover:border-white/15 text-white/60 shrink-0"
                          }`}
                        >
                          <span className="text-[11px] leading-tight block">{m.label}</span>
                          <span className="text-[8px] font-mono text-white/35 font-light block mt-1 uppercase">{m.details}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <p className="text-[10px] text-white/35 font-light leading-relaxed">
                    Нажимая кнопку «Подтвердить подписку», вы соглашаетесь с Офертой подключения платформы и условиями обработки данных партнеров.
                  </p>

                  {/* Submit button */}
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-xs font-bold uppercase tracking-wider bg-brand-gold text-dark-bg hover:bg-brand-gold-hover shadow-lg shadow-brand-gold/15 active:scale-95 transition-all text-center cursor-pointer"
                  >
                    <span>Подтвердить и выставить счет</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
              )
            ) : (
              // Success checkout step state
              <div className="space-y-6 py-4 text-center animate-fade-in text-white font-sans">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-green/20 text-brand-green">
                  <ShieldCheck className="h-8 w-8 animate-pulse" />
                </div>

                {partnerSession ? (
                  <div className="space-y-2">
                    <h4 className="text-lg font-bold text-white">Вы перешли на тариф {selectedTierForCheckout.name}!</h4>
                    <p className="text-xs text-white/60 leading-relaxed max-w-sm mx-auto">
                      Поздравляем! Модификации тарифного пакета для компании <span className="text-white font-bold font-mono bg-white/5 px-2 py-0.5 rounded">{partnerSession.company}</span> применились мгновенно. Вашему кабинету открыты новые лимиты и приоритеты.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <h4 className="text-lg font-bold text-white">Заявка на тариф {selectedTierForCheckout.name} создана!</h4>
                    <p className="text-xs text-white/60 leading-relaxed max-w-sm mx-auto">
                      Счет успешно сгенерирован и отправлен на почту <span className="text-white font-bold font-mono bg-white/5 px-2 py-0.5 rounded">{checkoutEmail || "partner@company.ru"}</span>. С вами свяжется куратор в течение 10 минут.
                    </p>
                  </div>
                )}

                {paymentMethod === "sbp" && (
                  <div className="bg-white/5 border border-white/5 p-5 rounded-2xl max-w-xs mx-auto space-y-3 flex flex-col items-center">
                    <span className="text-[9px] uppercase font-bold tracking-widest text-brand-gold font-mono block">Быстрый платеж по СБП</span>
                    <div className="bg-white p-2 rounded-xl">
                      <QrCode className="h-32 w-32 text-dark-bg" />
                    </div>
                    <span className="text-[10px] text-white/40 leading-relaxed text-center font-light">
                      Для оплаты отсканируйте этот QR-код камерой банковского приложения на вашем смартфоне.
                    </span>
                  </div>
                )}

                {paymentMethod === "invoice" && (
                  <div className="bg-white/5 border border-white/5 p-4 rounded-xl text-left max-w-sm mx-auto space-y-2">
                    <div className="flex justify-between items-center text-[10px] text-white/40 uppercase font-bold border-b border-white/5 pb-1">
                      <span>Реквизиты для перевода</span>
                      <button 
                        onClick={handleCopyCredentials}
                        className="text-brand-gold hover:underline flex items-center gap-1 cursor-pointer font-sans"
                      >
                        <Copy className="h-3 w-3" />
                        {copiedLink ? "Скопировано!" : "Копировать"}
                      </button>
                    </div>
                    <p className="text-[11px] text-white/70 font-mono leading-relaxed font-light">
                      Получатель: ООО "Ван Поинт Медиа"<br />
                      ИНН: 7810987654 / КПП: 781001001<br />
                      Р/С: 40702810900000012345 в АО "Т-Банк"<br />
                      БИК: 044525974 / Назначение: Оплата подписки за тариф {selectedTierForCheckout.name}
                    </p>
                  </div>
                )}

                <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row gap-2">
                  {partnerSession && setActiveTab && (
                    <button
                      onClick={() => {
                        setSelectedTierForCheckout(null);
                        setActiveTab("dashboard");
                      }}
                      className="flex-1 py-3 text-xs font-bold uppercase tracking-wider bg-brand-gold text-dark-bg hover:bg-brand-gold-hover rounded-xl shadow transition-colors cursor-pointer text-center flex items-center justify-center gap-1"
                    >
                      🚀 Открыть Кабинет CRM
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedTierForCheckout(null)}
                    className="flex-1 py-3 text-xs font-bold uppercase tracking-wider bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-colors cursor-pointer"
                  >
                    Вернуться к тарифам
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
