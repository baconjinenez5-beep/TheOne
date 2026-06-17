import { useState } from "react";
import { HelpCircle, ChevronDown, ChevronUp, MessageSquare } from "lucide-react";
import { faqList } from "../data";

export default function FAQBlock() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [selectedCategory, setSelectedCategory] = useState<"все" | "интеграция" | "сроки" | "безопасность" | "оплата">("все");

  const filteredFaq = faqList.filter((item) => {
    if (selectedCategory === "все") return true;
    return item.category === selectedCategory;
  });

  return (
    <section className="mb-8 rounded-[32px] border border-white/10 bg-dark-card/40 p-6 sm:p-10 backdrop-blur-md">
      <div className="max-w-3xl mb-10">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest text-brand-gold uppercase">
          <HelpCircle className="h-4 w-4 text-brand-gold" />
          <span>F.A.Q.</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-light text-white mt-3">
          Часто задаваемые <span className="font-semibold text-brand-gold">вопросы по работе</span>
        </h2>
        <p className="text-sm text-white/60 mt-2 font-light">
          Вся информация о комиссиях, безопасности данных и интеграции с вашими текущими CRM-системами.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Col: Categories switchers */}
        <div className="lg:col-span-3 space-y-2 select-none shrink-0 text-left">
          {[
            { id: "все", label: "Все разделы" },
            { id: "интеграция", label: "Интеграция" },
            { id: "сроки", label: "Сроки публикации" },
            { id: "безопасность", label: "Безопасность" },
            { id: "оплата", label: "Комиссии и оплаты" }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id as any);
                setOpenIdx(null); // Reset accordion
              }}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-brand-gold/10 text-brand-gold font-bold"
                  : "bg-white/3 text-white/65 hover:text-white"
              }`}
            >
              • {cat.label}
            </button>
          ))}
        </div>

        {/* Right Col: Smart Accordion list */}
        <div className="lg:col-span-9 space-y-3">
          {filteredFaq.map((item, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-white/5 bg-white/2 overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between text-left p-5 transition-colors duration-200 hover:bg-white/3 cursor-pointer outline-none"
                >
                  <span className="text-sm font-semibold text-white/90">
                    {item.question}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-brand-gold" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-white/40" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-[13px] text-white/55 leading-relaxed font-light border-t border-white/5 pt-3 bg-black/10">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
