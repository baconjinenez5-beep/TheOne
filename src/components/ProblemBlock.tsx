import { Coins, Users, Clock, Target, ShieldAlert } from "lucide-react";
import { problemList } from "../data";

export default function ProblemBlock() {
  const iconMap: Record<string, any> = {
    Coins: Coins,
    UsersRound: Users,
    Clock: Clock,
    Target: Target,
  };

  return (
    <section className="mb-8 rounded-[32px] border border-white/10 bg-dark-card/50 p-6 sm:p-10 backdrop-blur-md">
      <div className="max-w-3xl mb-10">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest text-brand-gold uppercase">
          <ShieldAlert className="h-4 w-4 text-brand-gold" />
          <span>Текущие боли рынка</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-light text-white mt-3">
          Почему старые методы привлечения туристов <span className="font-semibold text-brand-gold">выжигают прибыль</span>?
        </h2>
        <p className="text-sm text-white/60 mt-2">
          Локальные организаторы часто сталкиваются со скрытыми потерями, пытаясь самостоятельно автоматизировать продажи.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {problemList.map((item, idx) => {
          const IconComponent = iconMap[item.icon] || Coins;
          return (
            <div
              key={idx}
              className="relative group flex flex-col justify-between p-6 rounded-2xl border border-white/5 bg-white/3 hover:border-red-500/30 hover:bg-red-500/2 transition-all duration-300"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-400 group-hover:scale-105 transition-transform">
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-mono text-white/20">#0{idx + 1}</span>
                </div>
                <h3 className="text-base font-semibold text-white group-hover:text-red-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-[13px] text-white/50 leading-relaxed mt-2">
                  {item.desc}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-white/5 flex items-center gap-2">
                <span className="text-xs font-mono font-medium text-red-400 bg-red-400/10 px-2.5 py-1 rounded-full">
                  {item.loss}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
