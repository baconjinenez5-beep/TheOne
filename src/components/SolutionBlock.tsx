import { ShieldCheck, ArrowRight, Layers, Cpu, CheckCircle } from "lucide-react";
import { solutionSteps } from "../data";

export default function SolutionBlock() {
  const iconMap = [Layers, Cpu, CheckCircle];

  return (
    <section className="mb-8 rounded-[32px] border border-white/10 bg-gradient-to-br from-dark-card to-dark-bg/60 p-6 sm:p-10">
      <div className="max-w-3xl mb-12">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest text-brand-green uppercase">
          <ShieldCheck className="h-4 w-4 text-brand-green" />
          <span>Наше решение</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-light text-white mt-3">
          The One Point: <span className="font-semibold text-brand-green">Бизнес-синергия</span> за несколько минут
        </h2>
        <p className="text-sm text-white/60 mt-2">
          Мы преобразили сложную цепочку дистрибуции на три простых автоматизированных шага.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
        {solutionSteps.map((step, idx) => {
          const StepIcon = iconMap[idx];
          return (
            <div key={idx} className="relative flex flex-col justify-between p-6 sm:p-8 rounded-2xl border border-white/5 bg-white/2 hover:border-brand-green/30 hover:bg-white/4 transition-all duration-300">
              {/* Connector Arrow for larger screens */}
              {idx < 2 && (
                <div className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 z-20 bg-dark-bg p-1 border border-white/10 rounded-full">
                  <ArrowRight className="h-4 w-4 text-brand-green" />
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold tracking-wide text-white/40 uppercase">
                    Шаг 0{idx + 1} • {step.phase}
                  </span>
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ backgroundColor: step.color, color: step.textColor }}
                  >
                    <StepIcon className="h-5 w-5" />
                  </div>
                </div>

                <h3 className="text-lg font-medium text-white mt-1">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-[13px] text-white/50 leading-relaxed mt-2.5">
                  {step.desc}
                </p>
              </div>

              <div className="mt-8">
                <span
                  className="inline-block text-[11px] font-bold tracking-wider uppercase px-3 py-1 rounded-full"
                  style={{ backgroundColor: step.color, color: step.textColor }}
                >
                  {step.badge}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
