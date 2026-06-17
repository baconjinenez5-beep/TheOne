import { useState } from "react";
import { HelpCircle, ChevronRight, PenTool, ClipboardCheck, Network, Sparkles, Trophy } from "lucide-react";
import { workflowSteps } from "../data";

export default function HowItWorksBlock() {
  const [activeStep, setActiveStep] = useState(0);

  const visualPreviews = [
    {
      title: "Создание карточки в CMS",
      type: "Ввод информации",
      tip: "Умные подсказки подскажут, какой размер фото нужен и какую цену лучше выставить на основе аналитики конкурентов.",
      visual: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=85",
    },
    {
      title: "Проверка качества и SEO-оптимизация",
      type: "Модерация за 2 часа",
      tip: "Редакционная служба адаптирует ваши заголовки под поисковые роботы Яндекса и Google для бесплатного органического охвата.",
      visual: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=85",
    },
    {
      title: "Поток целевого трафика",
      type: "Привлечение",
      tip: "Карточка публикуется во всех тематических дайджестах, региональных блогах, и попадает в умную ленту рекомендаций.",
      visual: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=85",
    },
    {
      title: "Автоматический калькулятор и бронь",
      type: "Конверсия в оплату",
      tip: "Гости сами выбирают нужные даты, указывают количество человек и активируют доп. услуги. CRM мгновенно считает чек.",
      visual: "https://images.unsplash.com/photo-1556742044-3c52d6e88c62?auto=format&fit=crop&w=600&q=85",
    },
  ];

  return (
    <section className="mb-8 rounded-[32px] border border-white/10 bg-dark-card/60 p-6 sm:p-10 backdrop-blur-md">
      <div className="max-w-3xl mb-10">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest text-brand-gold uppercase">
          <HelpCircle className="h-4 w-4 text-brand-gold" />
          <span>Как это работает</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-light text-white mt-3">
          Пошаговый сценарий от запуска до первого <span className="font-semibold text-brand-gold">живого лида</span>
        </h2>
        <p className="text-sm text-white/60 mt-2 font-light">
          Простой, прозрачный и прогнозируемый процесс интеграции вашего дела в единый хаб впечатлений.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left side steps list */}
        <div className="lg:col-span-6 space-y-3.5">
          {workflowSteps.map((item, idx) => {
            const isSelected = idx === activeStep;
            return (
              <button
                key={idx}
                id={`how-step-btn-${idx}`}
                onClick={() => setActiveStep(idx)}
                className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 flex items-center gap-4 cursor-pointer outline-none ${
                  isSelected
                    ? "bg-brand-gold/10 border-brand-gold shadow-md shadow-brand-gold/5"
                    : "bg-white/3 border-white/5 hover:border-white/15"
                }`}
              >
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-mono text-base font-bold transition-colors duration-300 ${
                    isSelected ? "bg-brand-gold text-dark-bg" : "bg-white/5 text-white/50"
                  }`}
                >
                  {item.step}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold tracking-wider uppercase text-brand-gold">
                      Инструмент: {item.tool}
                    </span>
                    {isSelected && <ChevronRight className="h-4 w-4 text-brand-gold animate-bounce-right" />}
                  </div>
                  <h3 className="text-sm font-semibold text-white mt-1">
                    {item.action}
                  </h3>
                  <p className="text-xs text-white/45 mt-1 truncate">
                    {item.outcome}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right side interactive visualization */}
        <div className="lg:col-span-6">
          <div className="rounded-3xl border border-white/10 bg-dark-card p-6 flex flex-col justify-between h-full min-h-[380px] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-36 h-36 bg-brand-gold/5 rounded-full blur-2xl"></div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold tracking-widest text-[#74d5a6] bg-[#74d5a6]/10 px-3 py-1 rounded-full">
                  {visualPreviews[activeStep].type}
                </span>
                <span className="text-xs font-mono text-white/30">Визуальный мокап</span>
              </div>

              <h3 className="text-lg font-medium text-white">
                {visualPreviews[activeStep].title}
              </h3>

              <div className="relative rounded-2xl overflow-hidden border border-white/5 h-44">
                <img
                  className="w-full h-full object-cover opacity-80"
                  src={visualPreviews[activeStep].visual}
                  alt={visualPreviews[activeStep].title}
                />
              </div>

              <p className="text-xs sm:text-[13px] text-white/60 leading-relaxed font-light bg-white/3 p-4 rounded-xl border border-white/5">
                <strong className="text-brand-gold">Рекомендация: </strong>
                {visualPreviews[activeStep].tip}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-white/40">
              <span className="flex items-center gap-1">
                <Trophy className="h-3.5 w-3.5 text-brand-gold" />
                Итог шага
              </span>
              <span className="font-semibold text-white">
                {workflowSteps[activeStep].outcome}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
