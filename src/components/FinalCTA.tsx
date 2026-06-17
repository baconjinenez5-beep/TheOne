import { Sparkles, MessageSquare, Mail, Award } from "lucide-react";

interface FinalCTAProps {
  onStartClick: () => void;
  onPricingClick: () => void;
}

export default function FinalCTA({ onStartClick, onPricingClick }: FinalCTAProps) {
  return (
    <section className="relative rounded-[40px] overflow-hidden border border-white/10 bg-dark-card py-16 px-6 sm:px-12 text-center shadow-xl mb-8">
      {/* Dynamic graphic glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-brand-gold/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 max-w-2xl mx-auto space-y-6">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-gold/10 text-brand-gold mx-auto">
          <Award className="h-6 w-6" />
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-white leading-tight">
          Готовы запустить свои продажи на <span className="font-semibold text-brand-gold">максимум</span>?
        </h2>

        <p className="text-sm sm:text-base text-white/70 max-w-lg mx-auto leading-relaxed">
          The One Point убирает посредников между вашей услугой и гостями. Начните собирать лиды прямо сегодня без затрат на дорогой софт.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <button
            id="final-cta-start-btn"
            onClick={onStartClick}
            className="flex items-center gap-2 px-8 py-4 rounded-2xl text-xs font-bold bg-brand-gold hover:bg-brand-gold-hover text-dark-bg transition-colors cursor-pointer shadow-lg shadow-brand-gold/25 uppercase tracking-wider"
          >
            <Sparkles className="h-4.5 w-4.5" />
            Запустить демо бесплатно
          </button>
          <button
            id="final-cta-pricing-btn"
            onClick={onPricingClick}
            className="flex items-center gap-2 px-8 py-4 rounded-2xl text-xs font-bold bg-white/5 hover:bg-white/10 border border-white/15 text-white transition-colors cursor-pointer"
          >
            Изучить тарифы
          </button>
        </div>

        {/* Support contacts row */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-8 text-xs text-white/45">
          <a
            href="mailto:partner@theonepoint.ru"
            className="flex items-center gap-2 hover:text-brand-gold transition-colors font-mono"
          >
            <Mail className="h-4 w-4 text-brand-gold" />
            partner@theonepoint.ru
          </a>
          <a
            href="https://t.me/theonepoint"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-brand-gold transition-colors font-mono"
          >
            <MessageSquare className="h-4 w-4 text-brand-gold" />
            Telegram: @theonepoint_support
          </a>
        </div>
      </div>
    </section>
  );
}
