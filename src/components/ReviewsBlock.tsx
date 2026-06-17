import { Award, Star, TrendingUp, Sparkles } from "lucide-react";
import { testimonials } from "../data";

export default function ReviewsBlock() {
  return (
    <section className="mb-8 space-y-8 rounded-[32px] border border-white/10 bg-dark-card/50 p-6 sm:p-10 backdrop-blur-md">
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest text-[#74d5a6] uppercase">
          <TrendingUp className="h-4 w-4 text-[#74d5a6]" />
          <span>Кейсы и доказательства</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-light text-white mt-3">
          Истории успеха наших партнёров: <span className="font-semibold text-brand-gold">Было / Стало</span>
        </h2>
        <p className="text-sm text-white/60 mt-2">
          Посмотрите на реальное влияние нашей платформы на продажи и автоматизацию рутинных процессов.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {testimonials.map((test, idx) => (
          <div
            key={idx}
            className="p-6 sm:p-8 rounded-2xl border border-white/5 bg-white/2 hover:border-brand-gold/20 transition-colors flex flex-col justify-between space-y-6"
          >
            {/* Header: Author logo/avatar & details */}
            <div className="flex items-center gap-4">
              <img
                className="h-12 w-12 rounded-full object-cover border border-white/10"
                src={test.avatar}
                alt={test.author}
              />
              <div>
                <span className="font-semibold text-white block text-sm sm:text-base">
                  {test.author}
                </span>
                <span className="text-[11px] text-white/45 block">
                  {test.company}
                </span>
              </div>
            </div>

            {/* Middle: Before vs After metrics */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-black/40 border border-white/5">
              <div className="space-y-1">
                <span className="text-[10px] block uppercase text-white/30 tracking-widest font-mono">До платформы</span>
                <span className="text-xs text-red-400 font-medium font-sans">
                  {test.metricBefore}
                </span>
              </div>
              <div className="space-y-1 border-l border-white/5 pl-4">
                <span className="text-[10px] block uppercase text-brand-green tracking-widest font-mono">После интеграции</span>
                <span className="text-xs sm:text-sm text-brand-green font-bold flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 shrink-0" />
                  {test.metricAfter}
                </span>
              </div>
            </div>

            {/* Body Quote comment */}
            <p className="text-xs sm:text-[13px] text-white/60 leading-relaxed italic font-light">
              « {test.feedback} »
            </p>

            <div className="flex gap-1 text-brand-gold text-xs">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-brand-gold text-brand-gold" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
