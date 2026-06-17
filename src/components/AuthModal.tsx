import { useState, FormEvent } from "react";
import { X, User, Briefcase, Mail, ShieldCheck, Sparkles, MessageSquare, Key, ArrowRight } from "lucide-react";

interface AuthModalProps {
  onClose: () => void;
  onLoginUser: (userData: { name: string; email: string; phone: string; isPremium: boolean }) => void;
  onLoginPartner: (partnerData: { company: string; email: string; level: string }) => void;
  initialTab?: "user" | "partner";
}

export default function AuthModal({ onClose, onLoginUser, onLoginPartner, initialTab = "user" }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<"user" | "partner">(initialTab);
  
  // Form values
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Quick Demo logins
  const handleQuickLogin = (role: "user" | "partner") => {
    setIsSuccess(true);
    setTimeout(() => {
      if (role === "user") {
        onLoginUser({
          name: "Александр Григорьев",
          email: "alex.karelia@mail.ru",
          phone: "+7 (911) 400-12-34",
          isPremium: true
        });
      } else {
        onLoginPartner({
          company: "Karelia Outdoor",
          email: "partner@karelia-outdoor.ru",
          level: "Стандарт плюс"
        });
      }
      onClose();
    }, 800);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg("Пожалуйста, заполните поле Email");
      return;
    }
    
    // Email Syntax Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg("Некорректный синтаксис Email адреса (шаблон: user@domain.ru)");
      return;
    }

    // Phone Syntax Validation for user role
    if (activeTab === "user") {
      if (!phone) {
        setErrorMsg("Пожалуйста, введите номер телефона");
        return;
      }
      const cleanPhone = phone.replace(/\D/g, "");
      if (cleanPhone.length < 10 || cleanPhone.length > 15) {
        setErrorMsg("Номер телефона должен содержать от 10 до 15 цифр (например: +7 999 123-45-67)");
        return;
      }
    }
    
    setIsSuccess(true);
    setErrorMsg("");

    setTimeout(() => {
      if (activeTab === "user") {
        onLoginUser({
          name: name || "Удачливый Гость",
          email: email,
          phone: phone || "+7 (999) 555-44-33",
          isPremium: false
        });
      } else {
        onLoginPartner({
          company: name || "Мой Бизнес Плюс",
          email: email,
          level: "Регистрация через API"
        });
      }
      onClose();
    }, 850);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark Blur Overlay */}
      <div onClick={onClose} className="absolute inset-0 bg-black/70 backdrop-blur-md" />

      {/* Modal Container */}
      <div className="relative w-full max-w-md overflow-hidden rounded-[32px] border border-white/10 bg-dark-card/95 p-6 sm:p-8 text-left shadow-2xl backdrop-blur-xl animate-fade-in z-10">
        
        {/* Glow Element */}
        <div className="absolute -top-12 -left-12 h-32 w-32 rounded-full bg-brand-gold/10 blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <span className="text-[10px] font-bold text-brand-gold uppercase tracking-widest block font-mono">
              The One Point // Авторизация
            </span>
            <h3 className="text-lg font-light text-white mt-1">
              Добро пожаловать в систему
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-white/5 text-white/40 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Selection Switches (User / Partner) */}
        <div className="grid grid-cols-2 gap-2 mt-6 p-1 bg-black/40 border border-white/5 rounded-2xl select-none">
          <button
            onClick={() => {
              setActiveTab("user");
              setErrorMsg("");
            }}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "user"
                ? "bg-brand-green text-dark-bg shadow-sm"
                : "text-white/60 hover:text-white"
            }`}
          >
            <User className="h-3.5 w-3.5" />
            Русстуристо (Клиент)
          </button>
          <button
            onClick={() => {
              setActiveTab("partner");
              setErrorMsg("");
            }}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "partner"
                ? "bg-brand-gold text-dark-bg shadow-sm"
                : "text-white/60 hover:text-white"
            }`}
          >
            <Briefcase className="h-3.5 w-3.5" />
            Организатор (Партнёр B2B)
          </button>
        </div>

        {/* Dynamic description info */}
        <div className="mt-4 p-4 rounded-xl bg-white/2 border border-white/5">
          {activeTab === "user" ? (
            <p className="text-xs text-white/60 font-light leading-relaxed">
              <span className="font-semibold text-brand-green block mb-1">Кабинет «Русстуристо» (B2C Путешественник):</span>
              Это позволит просматривать интерактивные билеты на забронированные туры, проверять даты экскурсий в реальном времени, оставлять отзывы и получать СМС/Push-оповещения.
            </p>
          ) : (
            <p className="text-xs text-white/60 font-light leading-relaxed">
              <span className="font-semibold text-brand-gold block mb-1">Кабинет «Партнёра» (B2B Турбизнес):</span>
              Управляйте поступившими заявками и лидами в CRM Карелии, анализируйте просмотры и CTR карточек услуг, собирайте отзывы и размещайте новые экскурсии.
            </p>
          )}
        </div>

        {isSuccess ? (
          <div className="py-12 text-center space-y-3 animate-fade-in text-white">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-green/20 text-brand-green">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h4 className="text-base font-semibold">Успешная авторизация!</h4>
            <p className="text-xs text-white/45">Загружаем ваш интерактивный профиль...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            
            {/* Conditional input fields */}
            {activeTab === "user" ? (
              <>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-white/45 mb-1.5">Ваше Имя</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-black/40 border border-white/5 hover:border-white/15 focus:border-brand-gold rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-gold"
                    placeholder="Александр"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-white/45 mb-1.5">Номер Телефона</label>
                  <input
                    type="tel"
                    required
                    className="w-full bg-black/40 border border-white/5 hover:border-white/15 focus:border-brand-gold rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-gold"
                    placeholder="+7 (911) 400-00-11"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="block text-[10px] uppercase font-bold text-white/45 mb-1.5">Название Организации / бренда</label>
                <input
                  type="text"
                  required
                  className="w-full bg-black/40 border border-white/5 hover:border-white/15 focus:border-brand-gold rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-gold"
                  placeholder="Karelia Outdoor"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}

            <div>
              <label className="block text-[10px] uppercase font-bold text-white/45 mb-1.5">Электронная Почта (Email)</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  className="w-full bg-black/40 border border-white/5 hover:border-white/15 focus:border-brand-gold rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none"
                  placeholder="your-email@example.ru"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-white/45 mb-1.5">Пароль / Пин-код доступа</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  className="w-full bg-black/40 border border-white/5 hover:border-white/15 focus:border-brand-gold rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
              </div>
            </div>

            {errorMsg && (
              <p className="text-xs text-red-400 bg-red-400/10 p-2.5 rounded-lg text-center font-mono">
                ⚠ {errorMsg}
              </p>
            )}

            {/* Standard manual login buttons */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider bg-brand-gold text-dark-bg hover:bg-brand-gold-hover active:scale-95 transition-all text-center cursor-pointer shadow-lg shadow-brand-gold/15"
            >
              <span>Подтвердить вход</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            {/* QUICK ONE-CLICK CREDENTIALS FOR EXCELLENT DEMO UX */}
            <div className="pt-4 border-t border-white/5">
              <span className="block text-[9px] text-center uppercase font-mono tracking-widest text-white/30 mb-2.5">
                Или войти мгновенно в 1 клик (режим демо)
              </span>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin("user")}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-[10px] font-bold bg-[#74d5a6]/10 hover:bg-[#74d5a6]/20 border border-[#74d5a6]/20 text-[#74d5a6] transition-colors cursor-pointer"
                >
                  <Sparkles className="h-3 w-3" />
                  Русстуристо Александр
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin("partner")}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-[10px] font-bold bg-brand-gold/10 hover:bg-brand-gold/20 border border-brand-gold/20 text-brand-gold transition-colors cursor-pointer"
                >
                  <Briefcase className="h-3.5 w-3.5" />
                  Бренд Outdoor LLC
                </button>
              </div>
            </div>
            
          </form>
        )}
      </div>
    </div>
  );
}
