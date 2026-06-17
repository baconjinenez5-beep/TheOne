import { useState, useEffect, useRef } from "react";
import { PlusCircle, Compass, Smile, Info, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";

export default function SubmitBlock() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isDone, setIsDone] = useState(false);

  // Form Fields State
  const [listingType, setListingType] = useState("Услуги");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [format, setFormat] = useState("");
  const [region, setRegion] = useState("Карелия");
  const [dateInfo, setDateInfo] = useState("");
  const [duration, setDuration] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [description, setDescription] = useState("");

  // Validation state
  const [titleError, setTitleError] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [priceError, setPriceError] = useState("");

  const titleInputRef = useRef<HTMLInputElement>(null);

  // Load draft data on initialization
  useEffect(() => {
    const savedForm = localStorage.getItem("onepoint-submit-form-data");
    if (savedForm) {
      try {
        const data = JSON.parse(savedForm);
        if (data.listingType) setListingType(data.listingType);
        if (data.title) setTitle(data.title);
        if (data.category) setCategory(data.category);
        if (data.format) setFormat(data.format);
        if (data.region) setRegion(data.region);
        if (data.dateInfo) setDateInfo(data.dateInfo);
        if (data.duration) setDuration(data.duration);
        if (data.basePrice) setBasePrice(data.basePrice);
        if (data.description) setDescription(data.description);
        if (typeof data.currentStep === "number") setCurrentStep(data.currentStep);
      } catch (err) {
        console.error("Error restoring form draft data: ", err);
      }
    }
  }, []);

  // Save draft data to localStorage triggers
  useEffect(() => {
    const formData = {
      listingType,
      title,
      category,
      format,
      region,
      dateInfo,
      duration,
      basePrice,
      description,
      currentStep
    };
    localStorage.setItem("onepoint-submit-form-data", JSON.stringify(formData));
  }, [listingType, title, category, format, region, dateInfo, duration, basePrice, description, currentStep]);

  // Focus the 'Название объявления' input field automatically on step 0
  useEffect(() => {
    if (currentStep === 0 && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [currentStep]);

  const categoriesMap: Record<string, string[]> = {
    "Услуги": ["Фотосъёмка", "Трансфер", "Аренда лодок", "Гиды и проводники", "Обучающие сессии", "Банные комплексы"],
    "Туры": ["Водные туры", "Пешие треккинги", "Авторские экскурсии", "Многодневные походы", "Гастро-круизы"],
    "Мероприятия": ["Фестивали", "Йога-ретриты", "Мастер-классы", "Пленэры", "Локальные маркеты"]
  };

  const handleNext = () => {
    // Validation Logic
    if (currentStep === 0) {
      let valid = true;
      if (!title.trim()) {
        setTitleError("Пожалуйста, укажите уникальное название вашего предложения");
        valid = false;
      } else {
        setTitleError("");
      }

      if (!category) {
        setCategoryError("Выберите подкатегорию услуги для каталога");
        valid = false;
      } else {
        setCategoryError("");
      }

      if (!valid) return;
    }

    if (currentStep === 1) {
      // Step 2 has optional location details
    }

    if (currentStep === 2) {
      // Step 3 validation
      if (!basePrice.trim() || isNaN(Number(basePrice))) {
        setPriceError("Введите корректную базовую стоимость цифрами (₽)");
        return;
      }
      setPriceError("");
      
      // Submit success trigger
      localStorage.removeItem("onepoint-submit-form-data");
      setIsDone(true);
      return;
    }

    setCurrentStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleClearAllFields = () => {
    setTitle("");
    setCategory("");
    setFormat("");
    setDateInfo("");
    setDuration("");
    setBasePrice("");
    setDescription("");
    setTitleError("");
    setCategoryError("");
    setPriceError("");
    localStorage.removeItem("onepoint-submit-form-data");
  };

  const handleResetForm = () => {
    handleClearAllFields();
    setCurrentStep(0);
    setIsDone(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="rounded-3xl border border-white/10 bg-dark-card p-6 sm:p-10 shadow-2xl space-y-8">
        {!isDone ? (
          <>
            {/* Headers and steps index dots */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest text-brand-gold uppercase">
                  <PlusCircle className="h-4 w-4" />
                  <span>Подача нового объявления</span>
                </div>
                <div className="text-xs font-mono text-white/40">
                  Шаг <span className="text-brand-gold font-bold">{currentStep + 1}</span> из 3
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-light text-white">
                Добавьте ваше впечатление в {` `}
                <span className="font-semibold text-brand-gold">The One Point</span>
              </h2>

              {/* Step indicator sequence bars */}
              <div className="grid grid-cols-3 gap-2 pt-2 select-none">
                {[
                  "Основное описание",
                  "Регион и Длительность",
                  "Условия и Цена"
                ].map((stepName, stepIdx) => {
                  const isActive = stepIdx === currentStep;
                  const isCompleted = stepIdx < currentStep;
                  return (
                    <div key={stepIdx} className="space-y-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          isActive
                            ? "bg-brand-gold"
                            : isCompleted
                            ? "bg-brand-gold/45"
                            : "bg-white/10"
                        }`}
                      ></div>
                      <span
                        className={`text-[10px] hidden sm:block font-bold tracking-wide transition-colors ${
                          isActive ? "text-white" : isCompleted ? "text-brand-gold/60" : "text-white/30"
                        }`}
                      >
                        {stepName}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Steps Forms Blocks */}
            <div className="space-y-5">
              {currentStep === 0 && (
                <div className="space-y-4 animate-fade-in">
                  {/* Select listing section type */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-white/50">Раздел размещения в каталоге</label>
                    <div className="flex gap-2">
                      {["Услуги", "Туры", "Мероприятия"].map((t) => (
                        <button
                          key={t}
                          type="button"
                          id={`submit-type-btn-${t}`}
                          onClick={() => {
                            setListingType(t);
                            setCategory(""); // reset
                          }}
                          className={`flex-1 py-3.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            listingType === t
                              ? "bg-brand-gold/15 border-brand-gold text-brand-gold"
                              : "bg-black/20 border-white/5 hover:border-white/15 text-white/60"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Input title */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-white/50 block">Название объявления <span className="text-red-400">*</span></label>
                    <input
                      id="submit-field-title"
                      ref={titleInputRef}
                      type="text"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-gold/60"
                      placeholder="Например: Сап-серфинг у шхер на закате"
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        if (e.target.value) setTitleError("");
                      }}
                    />
                    {titleError && <span className="text-[10px] text-red-400 block mt-1">{titleError}</span>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Categories select dropdown */}
                    <div className="space-y-1.5">
                      <label className="text-xs text-white/50 block">Подкатегория <span className="text-red-400">*</span></label>
                      <div className="relative">
                        <select
                          id="submit-field-category"
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-gold/60 cursor-pointer appearance-none"
                          value={category}
                          onChange={(e) => {
                            setCategory(e.target.value);
                            if (e.target.value) setCategoryError("");
                          }}
                        >
                          <option value="">Выберите категорию...</option>
                          {categoriesMap[listingType].map((catOpt) => (
                            <option key={catOpt} value={catOpt} className="bg-dark-card text-white">
                              {catOpt}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none text-xs">▼</div>
                      </div>
                      {categoryError && <span className="text-[10px] text-red-400 block mt-1">{categoryError}</span>}
                    </div>

                    {/* Format / Tag info */}
                    <div className="space-y-1.5">
                      <label className="text-xs text-white/50 block">Режим проведения / Формат</label>
                      <input
                        id="submit-field-format"
                        type="text"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-gold/60"
                        placeholder="Например: инд. группа, каждый день"
                        value={format}
                        onChange={(e) => setFormat(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Location Region selector */}
                    <div className="space-y-1.5">
                      <label className="text-xs text-white/50 block">Регион проведения</label>
                      <div className="relative">
                        <select
                          id="submit-field-region"
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-gold/60 cursor-pointer appearance-none"
                          value={region}
                          onChange={(e) => setRegion(e.target.value)}
                        >
                          <option value="Карелия" className="bg-dark-card text-white">Карелия (Ладога, Сейдму...)</option>
                          <option value="Ленобласть" className="bg-dark-card text-white">Ленинградская область</option>
                          <option value="Онлайн" className="bg-dark-card text-white">Дистанционно / Онлайн</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none text-xs">▼</div>
                      </div>
                    </div>

                    {/* Location detail text */}
                    <div className="space-y-1.5">
                      <label className="text-xs text-white/50 block">Фиксированная дата <span className="text-red-400">*</span></label>
                      <input
                        id="submit-field-date"
                        type="text"
                        required
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-gold/60"
                        placeholder="Например: 18 июля 2026"
                        value={dateInfo}
                        onChange={(e) => setDateInfo(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Duration Text */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-white/50 block">Длительность процесса</label>
                    <input
                      id="submit-field-dur"
                      type="text"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-gold/60"
                      placeholder="Например: 3 часа, 2 дня"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4 animate-fade-in">
                  {/* Dynamic Pricing settings */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-white/50 block">Базовая цена от (в рублях) <span className="text-red-400">*</span></label>
                    <input
                      id="submit-field-price"
                      type="text"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-gold/60 font-mono"
                      placeholder="Например: 3500"
                      value={basePrice}
                      onChange={(e) => {
                        setBasePrice(e.target.value);
                        if (e.target.value) setPriceError("");
                      }}
                    />
                    {priceError && <span className="text-[10px] text-red-400 block mt-1">{priceError}</span>}
                  </div>

                  {/* Description long textarea */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-white/50 block">Полное подробное описание услуги</label>
                    <textarea
                      id="submit-field-desc"
                      rows={4}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-gold/60 resize-none font-light"
                      placeholder="Опишите ваше приключение, что ждет участников, какое нужно снаряжение..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Steps Button Navs footer */}
            <div className="flex items-center justify-between pt-6 border-t border-white/5">
              <button
                type="button"
                id="submit-prev-btn"
                disabled={currentStep === 0}
                onClick={handlePrev}
                className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold border transition-colors ${
                  currentStep === 0
                    ? "opacity-30 pointer-events-none border-white/5 text-white/30"
                    : "bg-white/5 border-white/10 text-white hover:bg-white/10 cursor-pointer"
                }`}
              >
                <ArrowLeft className="h-4 w-4" />
                Назад
              </button>

              <button
                type="button"
                id="submit-clear-fields-btn"
                onClick={handleClearAllFields}
                className="px-4 py-2.5 rounded-xl text-[10px] font-bold border border-red-500/25 bg-red-500/5 hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors cursor-pointer uppercase tracking-wider"
              >
                Очистить черновик
              </button>

              <button
                type="button"
                id="submit-next-btn"
                onClick={handleNext}
                className="flex items-center gap-1.5 px-6 py-3 rounded-xl text-xs font-bold bg-brand-gold hover:bg-brand-gold-hover text-dark-bg transition-colors cursor-pointer shadow-lg shadow-brand-gold/10"
              >
                {currentStep === 2 ? "Запустить модерацию" : "Продолжить"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-12 space-y-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-green/10 text-brand-green mx-auto">
              <CheckCircle2 className="h-8 w-8 text-brand-green" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-white">Объявление отправлено на модерацию!</h3>
              <p className="text-sm text-white/60 max-w-md mx-auto leading-relaxed font-light">
                Прекрасная работа, карточка <strong className="text-white">«{title}»</strong> со стоимостью <strong className="text-brand-gold font-mono">{Number(basePrice).toLocaleString("ru")} ₽</strong> успешно упакована.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/3 border border-white/5 text-xs text-white/50 max-w-sm mx-auto leading-relaxed">
              <Info className="h-4 w-4 text-brand-gold inline mr-1.5" />
              Редакционная служба The One Point закрепила за вами персональный тикет модерации. Наш специалист осуществит аудит и опубликует карточку в течение <strong className="text-white">2 часов</strong>.
            </div>

            <div className="flex justify-center gap-3 pt-4">
              <button
                id="btn-sub-reset-restart"
                onClick={handleResetForm}
                className="px-5 py-2.5 rounded-xl bg-black/30 hover:bg-black/50 border border-white/10 text-xs text-white transition-colors cursor-pointer"
              >
                Подать другое объявление
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
