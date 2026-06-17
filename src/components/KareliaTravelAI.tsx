import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Compass, MapPin, Calendar, Clock, Smile, HelpCircle } from "lucide-react";

interface Message {
  role: "user" | "model";
  text: string;
}

// Custom simple parser to format bold text (**text**), line break bullet lists, and section titles elegantly
function FormatMarkdownText({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-2.5 text-xs text-white/95 font-light leading-relaxed">
      {lines.map((line, idx) => {
        let trimmed = line.trim();
        
        // Handle headers (Day titles, etc.)
        if (trimmed.startsWith("###") || trimmed.startsWith("##") || trimmed.startsWith("#")) {
          const headerText = trimmed.replace(/^#+\s*/, "");
          return (
            <h4 key={idx} className="text-sm font-semibold text-brand-gold mt-4 mb-2 flex items-center gap-1.5 border-b border-white/5 pb-1">
              <Compass className="h-4 w-4 text-brand-gold" />
              {headerText}
            </h4>
          );
        }

        // Handle list items
        if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
          const listText = trimmed.replace(/^[-*]\s*/, "");
          return (
            <div key={idx} className="flex items-start gap-2 pl-2 my-1">
              <span className="text-brand-gold mt-1.5 text-[8px]">●</span>
              <span className="flex-1">
                {parseBoldText(listText)}
              </span>
            </div>
          );
        }

        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }

        return (
          <p key={idx} className="leading-relaxed">
            {parseBoldText(line)}
          </p>
        );
      })}
    </div>
  );
}

// Parse **bold expressions** into solid tags
function parseBoldText(text: string) {
  const parts = text.split(/\*\*([^*]+)\*\*/g);
  return parts.map((part, i) => {
    if (i % 2 === 1) {
      return <strong key={i} className="font-bold text-brand-gold">{part}</strong>;
    }
    return part;
  });
}

export default function KareliaTravelAI() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      text: "👋 Привет! Я — ваш персональный ИИ-консьерж по Карелии. Буду рад составить для вас эксклюзивный авторский 3-дневный маршрут. Напишите свои пожелания, например, планируете ли вы активные сплавы, тихий семейный отдых с баней, поездку с детьми в питомник хаски, или хотите попробовать местную кухню — уху Лохикейтто и калитки!"
    }
  ]);
  
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const suggestionChips = [
    { label: "🌲 Каяки и Шхеры", prompt: "Я ищу активный 3-дневный тур с каяками по Ладожским шхерам, пешими восхождениями на скалы и ночевкой в купольном глэмпинге в лесу." },
    { label: "🧘 Спа и Релакс", prompt: "Помоги спланировать уединенные 3 дня в Карелии: премиум спа-отель с панорамной сауной, карельская баня на дровах, лесные прогулки и чай у костра." },
    { label: "🐺 Семья с детьми", prompt: "Мы едем семьей с детьми. Покажи оптимальный маршрут: питомник дружелюбных хаски, эко-тропы, оленья ферма и поездка на ретро-поезде." },
    { label: "🍳 Вкусы Карелии", prompt: "Составь гастрономический 3-дневный тур по Карелии: дегустация карельских калиток, запеченной форели, ухи на сливках и посещение Рускеалы." }
  ];

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSubmit = async (text: string) => {
    if (!text.trim() || isLoading) return;
    
    // Add User message
    const userMsg: Message = { role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Pack chat history in the format: { message: text, history: [{ role: "user" | "model", text }] }
      const historyPayload = messages.map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        text: msg.text
      }));

      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: historyPayload
        })
      });

      if (!res.ok) {
        throw new Error("Не удалось получить ответ от ИИ.");
      }

      const data = await res.json();
      const answer = data.text || "Ошибка получения ответа. Пожалуйста, попробуйте еще раз.";
      
      setMessages((prev) => [...prev, { role: "model", text: answer }]);
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: "⚠️ Произошла ошибка при связи с сервером ИИ. Проверьте запуск сервера или наличие ключа GEMINI_API_KEY в панели Settings > Secrets."
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="rounded-3xl border border-white/10 bg-dark-card/50 p-6 md:p-8 space-y-6 text-left relative overflow-hidden" id="karelia-ai-assistant">
      <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
        <Sparkles className="h-32 w-32 text-brand-gold animate-pulse" />
      </div>

      <div className="flex items-center gap-3 pb-3 border-b border-white/5">
        <div className="p-2.5 rounded-2xl bg-brand-gold/10 text-brand-gold">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#74d5a6] block">
            Ваш локальный ИИ Гид
          </span>
          <h3 className="text-lg font-light text-white flex items-center gap-1.5 mt-0.5">
            Генератор туров по Карелии <span className="text-[11px] px-2 py-0.5 rounded-full bg-brand-gold/15 text-brand-gold font-bold font-mono">Gemini 3.5</span>
          </h3>
        </div>
      </div>

      {/* Suggestion Chips */}
      <div className="space-y-2">
        <span className="text-[10px] uppercase font-bold text-white/30 block tracking-wider">
          Популярные пожелания (нажмите готовый вариант):
        </span>
        <div className="flex flex-wrap gap-2">
          {suggestionChips.map((chip, idx) => (
            <button
              key={idx}
              id={`ai-chip-${idx}`}
              onClick={() => handleSubmit(chip.prompt)}
              className="text-xs bg-white/4 border border-white/5 px-3 py-2 rounded-xl text-white/80 hover:text-white hover:bg-brand-gold/10 hover:border-brand-gold/30 transition-all cursor-pointer font-medium"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conversations Window Panel */}
      <div className="rounded-2xl border border-white/5 bg-black/40 overflow-hidden">
        <div className="max-h-[350px] overflow-y-auto p-4 md:p-5 space-y-4 flex flex-col scrollbar-thin">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex flex-col max-w-[85%] ${
                msg.role === "user" ? "self-end items-end" : "self-start items-start"
              }`}
            >
              <span className="text-[8px] font-bold uppercase tracking-widest text-white/30 mb-1 px-1">
                {msg.role === "user" ? "Вы" : "ИИ-Консьерж"}
              </span>
              <div
                className={`p-3.5 rounded-2xl ${
                  msg.role === "user"
                    ? "bg-brand-gold text-[#07101a] font-medium rounded-tr-none text-xs"
                    : "bg-white/5 border border-white/10 rounded-tl-none font-light"
                }`}
              >
                {msg.role === "user" ? (
                  <p className="text-xs">{msg.text}</p>
                ) : (
                  <FormatMarkdownText text={msg.text} />
                )}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="self-start flex flex-col items-start max-w-[85%]">
              <span className="text-[8px] font-bold uppercase tracking-widest text-white/30 mb-1 px-1">ИИ Думает...</span>
              <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-bounce delay-75" />
                <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-bounce delay-150" />
                <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-bounce delay-300" />
              </div>
            </div>
          )}

          <div ref={scrollRef} />
        </div>

        {/* Input Bar Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(inputValue);
          }}
          className="border-t border-white/5 bg-white/2 p-3 flex gap-2 items-center"
        >
          <input
            type="text"
            id="ai-travel-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Опишите ваши планы (например: Едем втроем, хотим увидеть водопады и Рускеалу)..."
            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-brand-gold/60"
            disabled={isLoading}
          />
          <button
            type="submit"
            id="ai-travel-send-btn"
            disabled={isLoading || !inputValue.trim()}
            className="p-3 bg-brand-gold hover:bg-brand-gold-hover text-[#07101a] rounded-xl hover:scale-105 active:scale-95 disabled:opacity-40 disabled:scale-100 transition-all cursor-pointer flex items-center justify-center"
            title="Отправить ИИ"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>

      <div className="flex items-center gap-2 text-[10px] text-white/40">
        <HelpCircle className="h-3.5 w-3.5 text-brand-gold" />
        <span>ИИ сгенерирует детальный 3-дневный авторский план на основе ваших конкретных предпочтений.</span>
      </div>
    </section>
  );
}
