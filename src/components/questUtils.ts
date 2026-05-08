export interface Quest {
  id: number;
  title: string;
  category: string;
  difficulty: 'Easy' | 'Normal' | 'Hard';
  description: string;
  parent_guide: string;
  photo_criteria: string;
  growth_point: string;
}

export interface CategoryConfig {
  badge: string;
  badgeText: string;
  stripe: string;
  cardFrom: string;
  iconBg: string;
  iconColor: string;
  borderColor: string;
  glowShadow: string;
  ringColor: string;
  sectionBg: string;
  sectionBorder: string;
  sectionText: string;
}

export const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  '自然・生存': {
    badge: 'bg-emerald-100',
    badgeText: 'text-emerald-800',
    stripe: 'from-emerald-400 via-emerald-500 to-teal-500',
    cardFrom: 'from-emerald-50/60',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    borderColor: 'border-emerald-200',
    glowShadow: 'shadow-emerald-400/50',
    ringColor: 'ring-emerald-300',
    sectionBg: 'bg-emerald-50',
    sectionBorder: 'border-emerald-200',
    sectionText: 'text-emerald-800',
  },
  '社会・多様性': {
    badge: 'bg-sky-100',
    badgeText: 'text-sky-800',
    stripe: 'from-sky-400 via-sky-500 to-blue-500',
    cardFrom: 'from-sky-50/60',
    iconBg: 'bg-sky-100',
    iconColor: 'text-sky-600',
    borderColor: 'border-sky-200',
    glowShadow: 'shadow-sky-400/50',
    ringColor: 'ring-sky-300',
    sectionBg: 'bg-sky-50',
    sectionBorder: 'border-sky-200',
    sectionText: 'text-sky-800',
  },
  '自立・経済': {
    badge: 'bg-amber-100',
    badgeText: 'text-amber-800',
    stripe: 'from-amber-400 via-amber-500 to-orange-500',
    cardFrom: 'from-amber-50/60',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    borderColor: 'border-amber-200',
    glowShadow: 'shadow-amber-400/50',
    ringColor: 'ring-amber-300',
    sectionBg: 'bg-amber-50',
    sectionBorder: 'border-amber-200',
    sectionText: 'text-amber-800',
  },
  '精神・レジリエンス': {
    badge: 'bg-rose-100',
    badgeText: 'text-rose-800',
    stripe: 'from-rose-400 via-rose-500 to-pink-500',
    cardFrom: 'from-rose-50/60',
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-600',
    borderColor: 'border-rose-200',
    glowShadow: 'shadow-rose-400/50',
    ringColor: 'ring-rose-300',
    sectionBg: 'bg-rose-50',
    sectionBorder: 'border-rose-200',
    sectionText: 'text-rose-800',
  },
  'チュートリアル': {
    badge: 'bg-yellow-100',
    badgeText: 'text-yellow-800',
    stripe: 'from-yellow-300 via-yellow-400 to-amber-400',
    cardFrom: 'from-yellow-50/60',
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
    borderColor: 'border-yellow-200',
    glowShadow: 'shadow-yellow-400/50',
    ringColor: 'ring-yellow-300',
    sectionBg: 'bg-yellow-50',
    sectionBorder: 'border-yellow-200',
    sectionText: 'text-yellow-800',
  },
};

export const DEFAULT_CONFIG: CategoryConfig = {
  badge: 'bg-gray-100',
  badgeText: 'text-gray-800',
  stripe: 'from-gray-400 to-gray-500',
  cardFrom: 'from-gray-50/60',
  iconBg: 'bg-gray-100',
  iconColor: 'text-gray-600',
  borderColor: 'border-gray-200',
  glowShadow: 'shadow-gray-400/50',
  ringColor: 'ring-gray-300',
  sectionBg: 'bg-gray-50',
  sectionBorder: 'border-gray-200',
  sectionText: 'text-gray-800',
};

export function getConfig(category: string): CategoryConfig {
  return CATEGORY_CONFIG[category] ?? DEFAULT_CONFIG;
}

export function getDifficultyStars(difficulty: string): number {
  if (difficulty === 'Easy') return 1;
  if (difficulty === 'Normal') return 2;
  return 3;
}

export function calcLevel(completed: number): number {
  return Math.floor(completed / 4) + 1;
}

export function calcXp(completed: number): number {
  return ((completed % 4) / 4) * 100;
}
