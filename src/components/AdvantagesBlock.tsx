import { Zap, BarChart3, Maximize2, ShieldQuestion, Award } from "lucide-react";
import { advantagesList } from "../data";

export default function AdvantagesBlock() {
  const iconMap = [Zap, BarChart3, Maximize2, ShieldQuestion];

  return (
    <section className="mb-8 rounded-[32px] border border-white/10 bg-dark-card/30 p-6 sm:p-10 backdrop-blur-md">
      <div className="max-w-3xl mb-10">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest text-brand-gold uppercase">
          <Award className="h-4 w-4 text-brand-gold" />
          <span>Ключевые преимущества</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-light text-white mt-3">
          Почему выбирают <span className="font-semibold text-brand-gold">The One Point</span>
        </h2>
        <p className="text-sm text-white/60 mt-2">
          Полная маркетинговая и техническая инфраструктура, разработанная специально под запросы регионального туризма.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {advantagesList.map((adv, idx) => {
          const IconComp = iconMap[idx];
          return (
            <div
              key={idx}
              className="relative p-7 rounded-2xl border border-white/10 bg-dark-card hover:border-brand-gold/40 hover:bg-white/3 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gold/10 text-brand-gold">
                    <IconComp className="h-5 w-5" />
                  </div>
                  <span className="text-[11px] font-mono uppercase text-brand-gold font-bold">
                    {adv.tag}
                  </span>
                </div>

                <h3 className="text-base font-semibold text-white tracking-wide">
                  {adv.title}
                </h3>
                <p className="text-xs sm:text-[13px] text-white/50 leading-relaxed mt-2.5">
                  {adv.desc}
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-[11px] text-white/40">Показатель</span>
                <span className="text-xs font-mono font-bold text-white bg-white/5 px-2.5 py-1 rounded-md">
                  {adv.metric}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
