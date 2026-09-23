export function formatToDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function getTodayDateKey(): string {
  return formatToDateKey(new Date());
}

export function isDateToday(dateKey: string): boolean {
  return dateKey === getTodayDateKey();
}

export function isPastDate(dateKey: string): boolean {
  return dateKey < getTodayDateKey();
}

export const ARABIC_DAYS = [
  'الأحد',
  'الإثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
  'السبت',
];

export const ARABIC_MONTHS = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
];

export function getArabicDayName(dateKey: string): string {
  const date = parseDateKey(dateKey);
  return ARABIC_DAYS[date.getDay()];
}

export function getArabicFormattedDate(dateKey: string): {
  dayName: string;
  dayNumber: number;
  monthName: string;
  year: number;
  fullDate: string;
  relativeLabel?: string;
} {
  const date = parseDateKey(dateKey);
  const todayKey = getTodayDateKey();
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = formatToDateKey(yesterday);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowKey = formatToDateKey(tomorrow);

  let relativeLabel: string | undefined;
  if (dateKey === todayKey) {
    relativeLabel = 'اليوم';
  } else if (dateKey === yesterdayKey) {
    relativeLabel = 'أمس';
  } else if (dateKey === tomorrowKey) {
    relativeLabel = 'غداً';
  }

  const dayName = ARABIC_DAYS[date.getDay()];
  const dayNumber = date.getDate();
  const monthName = ARABIC_MONTHS[date.getMonth()];
  const year = date.getFullYear();

  return {
    dayName,
    dayNumber,
    monthName,
    year,
    fullDate: `${dayName}، ${dayNumber} ${monthName} ${year}`,
    relativeLabel,
  };
}

export function formatArabicDateKey(dateKey: string): string {
  const formatted = getArabicFormattedDate(dateKey);
  return formatted.fullDate;
}

export function getSurroundingDays(centerDateKey: string, daysCount = 7): string[] {
  const center = parseDateKey(centerDateKey);
  const result: string[] = [];
  const half = Math.floor(daysCount / 2);

  for (let i = -half; i <= half; i++) {
    const d = new Date(center);
    d.setDate(d.getDate() + i);
    result.push(formatToDateKey(d));
  }
  return result;
}

export function formatHourLabel(hour: number): { label24: string; label12: string; period: string } {
  const padded = String(hour).padStart(2, '0') + ':00';
  const period = hour >= 12 ? 'م' : 'ص';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  const label12 = `${hour12}:00 ${period}`;
  return {
    label24: padded,
    label12,
    period,
  };
}
