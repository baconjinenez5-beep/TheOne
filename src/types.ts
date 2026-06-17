export interface ExtraOption {
  name: string;
  price: number;
}

export interface CatalogCard {
  id: string;
  title: string;
  type: "Мероприятия" | "Услуги" | "Туры" | "Инструкции";
  location: string;
  lat?: number;
  lng?: number;
  date: string;
  basePrice: number;
  priceLabel: string;
  author: string;
  rating: number;
  response: string;
  size: "small" | "medium" | "large";
  img: string;
  desc: string;
  pricePerPerson: number;
  extras: ExtraOption[];
  featured?: boolean;
  maxGuests?: number;
  discountThreshold?: number;
  discountPercent?: number;
  videoUrl?: string; // Optional URL for MP4 video or YouTube clip
  viewsCount?: number; // Views stats
  bookingsCount?: number; // Bookings stats
  hidden?: boolean; // Hides the card from public catalog view
}

export interface PromoCode {
  code: string;
  discountValue: number; // e.g. 10 for percentage, 500 for absolute rubles
  type: "percent" | "fixed";
  isActive: boolean;
  minBookingAmount?: number;
}

export interface LeadComment {
  text: string;
  time: string;
  author: "Клиент" | "Партнёр" | "Система";
}

export interface PartnerLead {
  id: number;
  name: string;
  phone: string;
  email: string;
  service: string;
  date: string;
  status: "new" | "progress" | "done" | "cancelled";
  guests: number;
  amount: number;
  source: string;
  comments: LeadComment[];
}

export interface ServiceStats {
  views: number;
  leads: number;
  conversion: string;
  avgCheck: number;
  favorites: number;
  ctr: string;
  responseTime: string;
  rating: number;
  repeat: string;
  bounceRate: string;
  geoTop: string;
  peakDay: string;
  growthWeek: string;
  trend: number[];
}

export interface CategoryInfo {
  name: string;
  icon: string; // Dynamic path or identifier, we will use lucide-react dynamically
  desc: string;
  color: string;
}

export interface FaqItem {
  question: string;
  answer: string;
  category: "интеграция" | "сроки" | "безопасность" | "оплата";
}

export interface TestimonialItem {
  author: string;
  company: string;
  metricBefore: string;
  metricAfter: string;
  feedback: string;
  avatar: string;
}
