import { useState, FormEvent } from "react";
import { 
  Sparkles, 
  Mail, 
  Phone, 
  Heart, 
  Send, 
  MapPin, 
  ShieldCheck, 
  Globe, 
  BookmarkCheck,
  Compass,
  CheckCircle,
  HelpCircle
} from "lucide-react";

interface FooterProps {
  setActiveTab: (tab: string) => void;
  setSelectedCategory: (cat: string) => void;
}

export default function Footer({ setActiveTab, setSelectedCategory }: FooterProps) {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState("");

  const handleSubscribe = (e: FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes("@")) {
      setSubscriptionError("Введите корректный email адрес");
      return;
    }
    setSubscriptionError("");
    setIsSubscribed(true);
    // Simulate API registration lag
    setTimeout(() => {
      setNewsletterEmail("");
    }, 1500);
  };

  return (
    <footer className="border-t border-white/10 bg-dark-bg py-12 mt-16 px-4 sm:px-6 relative overflow-hidden z-10 transition-colors">
      
      {/* Decorative ambient footer light rays */}
      <div className="absolute bottom-0 left-10 w-48 h-48 bg-brand-gold/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 right-10 w-48 h-48 bg-brand-green/5 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 items-start">
          
          {/* Brand Info & Newsletter block */}
          <div className="lg:col-span-4 space-y-6 text-left">
            <button
              onClick={() => {
                setActiveTab("home");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="group flex items-center gap-2 text-left cursor-pointer outline-none focus:ring-1 focus:ring-brand-gold rounded-xl p-1"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gold text-dark-bg font-bold shadow-md shadow-brand-gold/10">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <span className="font-sans text-xs font-semibold tracking-widest uppercase text-white group-hover:text-brand-gold transition-colors block">
                  The One Point
                </span>
                <span className="text-[10px] text-white/35 font-light">Платформа для интеграции и автоматизации бизнеса</span>
              </div>
            </button>
            
            <p className="text-xs text-white/45 max-w-sm leading-relaxed font-light">
              Объединяем лучшие локальные предложения Северо-Запада РФ (Карелия, Ленинградская область, Сортавала, Рускеала) в красивый маркетплейс впечатлений с честными комиссиями.
            </p>

            {/* Newsletter widget simulated state */}
            <div className="space-y-2.5 p-4 rounded-2xl bg-white/2 border border-white/5">
              <span className="text-[10px] uppercase font-bold text-brand-gold tracking-widest block font-mono">
                Инсайды и Скидки Карелии
              </span>
              <p className="text-[11px] text-white/50 leading-relaxed font-light">
                Получайте рассылку с секретными скидками туроператоров и гайдами раз в неделю.
              </p>

              {isSubscribed ? (
                <div className="flex items-center gap-1.5 p-2 bg-brand-green/10 text-[#74d5a6] rounded-xl text-[11.5px] font-medium font-sans animate-fade-in">
                  <CheckCircle className="h-4 w-4 shrink-0 text-brand-green" />
                  <span>Вы успешно подписаны на инсайды!</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-1.5 mt-2">
                  <div className="relative flex-1">
                    <input
                      type="email"
                      required
                      placeholder="vladimir@karelia.ru"
                      className="w-full bg-black/40 border border-white/5 hover:border-white/10 focus:border-brand-gold text-white text-[11px] font-mono rounded-xl pl-3 pr-3 py-2 focus:ring-0 outline-none placeholder-white/35"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-3.5 py-2 bg-brand-gold hover:bg-brand-gold-hover text-dark-bg rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center justify-center"
                    title="Подписаться"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </form>
              )}
              {subscriptionError && (
                <span className="text-[10px] font-mono text-red-400 block">{subscriptionError}</span>
              )}
            </div>
          </div>

          {/* Quick Nav Col */}
          <div className="lg:col-span-2 space-y-3 text-left">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#74d5a6] border-b border-white/5 pb-1">
              Навигация
            </h4>
            <div className="flex flex-col gap-2.5">
              {[
                { id: "home", label: "Главная страница" },
                { id: "catalog", label: "Каталог впечатлений" },
                { id: "submit", label: "Конструктор услуг" },
                { id: "pricing", label: "Тарифы подписки" }
              ].map((link) => (
                <button
                  key={link.id}
                  onClick={() => {
                    setActiveTab(link.id);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  id={`footer-link-nav-${link.id}`}
                  className="text-left text-xs text-white/55 hover:text-brand-gold transition-colors cursor-pointer outline-none block"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          {/* Catalog shortcuts */}
          <div className="lg:col-span-3 space-y-3 text-left">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-gold border-b border-white/5 pb-1">
              Разделы Развлечений
            </h4>
            <div className="flex flex-col gap-2.5">
              {[
                { cat: "Все", label: "Общий маркетплейс" },
                { cat: "Мероприятия", label: "Эко-Фестивали & Йога" },
                { cat: "Услуги", label: "Сервисы гидов & Бани" },
                { cat: "Туры", label: "Водные каяк-маршруты" }
              ].map((item) => (
                <button
                  key={item.cat}
                  onClick={() => {
                    setSelectedCategory(item.cat);
                    setActiveTab("catalog");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  id={`footer-cat-shortcut-${item.cat}`}
                  className="text-left text-xs text-white/55 hover:text-brand-gold transition-colors cursor-pointer outline-none block"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Contact coordinates */}
          <div className="lg:col-span-3 space-y-3 text-left">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/35 border-b border-white/5 pb-1">
              Где нас найти
            </h4>
            <div className="flex flex-col gap-2.5 text-xs">
              <a href="tel:+79991234567" className="text-white/60 hover:text-brand-gold transition-colors font-mono flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-brand-gold" />
                <span>+7 (999) 123-45-67</span>
              </a>
              <a href="mailto:partner@theonepoint.ru" className="text-white/60 hover:text-brand-gold transition-colors font-mono flex items-center gap-2">
                <Mail className="absolute-icon h-3.5 w-3.5 text-brand-green" />
                <span>partner@theonepoint.ru</span>
              </a>
              <span className="text-white/40 block leading-relaxed font-light pl-5 relative">
                <MapPin className="h-3.5 w-3.5 text-white/20 absolute left-0 top-0.5" />
                Офис инкубации проектов:<br />
                Республика Карелия, г. Сортавала,<br />
                ул. Ленина, д. 22
              </span>
              <span className="text-[10.5px] text-[#74d5a6] font-medium leading-relaxed font-light mt-1 p-2 rounded-lg bg-brand-green/5 border border-brand-green/10 inline-block">
                Зарегистрировано в ТИЦ Карелиа Реджион
              </span>
            </div>
          </div>

        </div>

        {/* Quality certifications / trusted logos */}
        <div className="mt-10 pt-6 border-t border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left text-[11px] text-white/30 items-center">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <ShieldCheck className="h-4.5 w-4.5 text-[#74d5a6]" />
            <span>Шифрование платежей: 256-bit SSL</span>
          </div>
          <div className="flex items-center gap-2 justify-center">
            <Globe className="h-4.5 w-4.5 text-brand-gold" />
            <span>Экотуризм СЗФО аккредитация</span>
          </div>
          <div className="flex items-center gap-2 justify-center sm:justify-end">
            <BookmarkCheck className="h-4.5 w-4.5 text-indigo-400" />
            <span>При поддержке Ростуризма</span>
          </div>
        </div>

        {/* Legal copy and hearts */}
        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-white/35">
          <div className="space-y-1 text-center sm:text-left">
            <div>© {new Date().getFullYear()} The One Point. Все права защищены законом РФ.</div>
            <div className="font-light">Разработано по рекомендациям Комитета развития туризма Карелии. Использование бренда гарантировано публичной офертой.</div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 select-none">
            <span>Сделано с любовью к путешествиям</span>
            <Heart className="h-3.5 w-3.5 fill-red-400 text-red-400 animate-pulse" />
            <span>в СЗФО</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
