export interface Video {
  id: string;
  title: string;
  thumbnail: string;
  channel: {
    id: string;
    name: string;
    avatar: string;
    subscribers: number;
    verified: boolean;
  };
  views: number;
  likes: number;
  comments: number;
  duration: string;
  uploadedAt: string;
  category: string;
  earnings?: number;
}

export interface Channel {
  id: string;
  name: string;
  avatar: string;
  subscribers: number;
  verified: boolean;
  totalViews: number;
  monthlyEarnings: number;
  videos: number;
  description: string;
  subscribed?: boolean;
}

const THUMB1 = "https://cdn.poehali.dev/projects/235f6088-686e-4093-aff6-69312af5dc7c/files/d8eac05c-58a9-432f-8c41-4d4b62ac251e.jpg";
const THUMB2 = "https://cdn.poehali.dev/projects/235f6088-686e-4093-aff6-69312af5dc7c/files/9c0f9712-4201-4d44-95b9-812846ad1dce.jpg";
const THUMB3 = "https://cdn.poehali.dev/projects/235f6088-686e-4093-aff6-69312af5dc7c/files/1ff203fd-caed-4014-a2d4-1512ef57231c.jpg";
const AVATAR = "https://cdn.poehali.dev/projects/235f6088-686e-4093-aff6-69312af5dc7c/files/94662616-f8d3-47fa-bb68-d4224aeb763d.jpg";

export const videos: Video[] = [
  {
    id: "1",
    title: "Как я заработал 500.000₽ на создании контента за 3 месяца",
    thumbnail: THUMB1,
    channel: { id: "ch1", name: "Максим Про", avatar: AVATAR, subscribers: 1240000, verified: true },
    views: 2340000,
    likes: 87400,
    comments: 3241,
    duration: "18:42",
    uploadedAt: "2 дня назад",
    category: "Финансы",
    earnings: 42000,
  },
  {
    id: "2",
    title: "Путешествие по горам Алтая — самые красивые места России",
    thumbnail: THUMB2,
    channel: { id: "ch2", name: "Дикая Природа", avatar: AVATAR, subscribers: 890000, verified: true },
    views: 1100000,
    likes: 54200,
    comments: 1870,
    duration: "24:15",
    uploadedAt: "5 дней назад",
    category: "Путешествия",
  },
  {
    id: "3",
    title: "Рецепт идеального Бургера — готовлю дома за 20 минут",
    thumbnail: THUMB3,
    channel: { id: "ch3", name: "Вкусно и Быстро", avatar: AVATAR, subscribers: 540000, verified: false },
    views: 780000,
    likes: 31500,
    comments: 892,
    duration: "12:30",
    uploadedAt: "1 неделю назад",
    category: "Кулинария",
  },
  {
    id: "4",
    title: "Топ-10 гаджетов 2025 года которые изменят твою жизнь",
    thumbnail: THUMB1,
    channel: { id: "ch4", name: "TechReview RU", avatar: AVATAR, subscribers: 2100000, verified: true },
    views: 4500000,
    likes: 134000,
    comments: 7800,
    duration: "22:08",
    uploadedAt: "3 дня назад",
    category: "Технологии",
    earnings: 89000,
  },
  {
    id: "5",
    title: "Психология богатых: что отличает успешных людей",
    thumbnail: THUMB2,
    channel: { id: "ch5", name: "МозгоШтурм", avatar: AVATAR, subscribers: 670000, verified: true },
    views: 920000,
    likes: 44300,
    comments: 2100,
    duration: "15:55",
    uploadedAt: "4 дня назад",
    category: "Саморазвитие",
  },
  {
    id: "6",
    title: "Как приготовить суши дома — полный гайд для новичков",
    thumbnail: THUMB3,
    channel: { id: "ch3", name: "Вкусно и Быстро", avatar: AVATAR, subscribers: 540000, verified: false },
    views: 430000,
    likes: 18900,
    comments: 540,
    duration: "28:40",
    uploadedAt: "2 недели назад",
    category: "Кулинария",
  },
  {
    id: "7",
    title: "Настройка MacBook Pro для максимальной продуктивности",
    thumbnail: THUMB1,
    channel: { id: "ch4", name: "TechReview RU", avatar: AVATAR, subscribers: 2100000, verified: true },
    views: 1870000,
    likes: 72100,
    comments: 4300,
    duration: "19:22",
    uploadedAt: "1 неделю назад",
    category: "Технологии",
    earnings: 37000,
  },
  {
    id: "8",
    title: "Зимний поход в Карпаты — выжить при -20°C",
    thumbnail: THUMB2,
    channel: { id: "ch2", name: "Дикая Природа", avatar: AVATAR, subscribers: 890000, verified: true },
    views: 670000,
    likes: 28400,
    comments: 1200,
    duration: "33:10",
    uploadedAt: "3 недели назад",
    category: "Путешествия",
  },
];

export const subscribedChannels: Channel[] = [
  {
    id: "ch1",
    name: "Максим Про",
    avatar: AVATAR,
    subscribers: 1240000,
    verified: true,
    totalViews: 45000000,
    monthlyEarnings: 84000,
    videos: 234,
    description: "Бизнес, финансы и личный рост",
    subscribed: true,
  },
  {
    id: "ch4",
    name: "TechReview RU",
    avatar: AVATAR,
    subscribers: 2100000,
    verified: true,
    totalViews: 120000000,
    monthlyEarnings: 230000,
    videos: 512,
    description: "Обзоры техники и гаджетов",
    subscribed: true,
  },
  {
    id: "ch2",
    name: "Дикая Природа",
    avatar: AVATAR,
    subscribers: 890000,
    verified: true,
    totalViews: 30000000,
    monthlyEarnings: 56000,
    videos: 178,
    description: "Путешествия и приключения",
    subscribed: true,
  },
  {
    id: "ch5",
    name: "МозгоШтурм",
    avatar: AVATAR,
    subscribers: 670000,
    verified: true,
    totalViews: 22000000,
    monthlyEarnings: 38000,
    videos: 143,
    description: "Психология, саморазвитие, мотивация",
    subscribed: true,
  },
];

export const categories = [
  "Все", "Технологии", "Путешествия", "Кулинария",
  "Финансы", "Саморазвитие", "Игры", "Музыка", "Спорт", "Юмор",
];

export function formatViews(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M просм.";
  if (n >= 1000) return (n / 1000).toFixed(0) + "K просм.";
  return n + " просм.";
}

export function formatSubscribers(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(0) + "K";
  return String(n);
}

export function formatMoney(n: number): string {
  return n.toLocaleString("ru-RU") + " ₽";
}
