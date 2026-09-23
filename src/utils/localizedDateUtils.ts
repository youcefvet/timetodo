import { parseDateKey, getTodayDateKey } from './dateUtils';
import { translations, SupportedLanguage } from '../i18n/translations';

export function getLocalizedDateFormatted(
  dateKey: string,
  lang: string = 'ar'
): {
  dayName: string;
  dayNumber: number;
  monthName: string;
  year: number;
  fullDate: string;
  relativeLabel?: string;
} {
  const safeLang = (['ar', 'fr', 'en', 'zh', 'es'].includes(lang) ? lang : 'ar') as SupportedLanguage;
  const date = parseDateKey(dateKey);
  const todayKey = getTodayDateKey();
  const t = translations[safeLang];

  const dayNumber = date.getDate();
  const year = date.getFullYear();
  const dayName = t.days[date.getDay()];
  const monthName = t.months[date.getMonth()];

  let fullDate = '';
  if (safeLang === 'ar') {
    fullDate = `${dayName}، ${dayNumber} ${monthName} ${year}`;
  } else if (safeLang === 'zh') {
    fullDate = `${year}年${monthName}${dayNumber}日 ${dayName}`;
  } else if (safeLang === 'fr' || safeLang === 'es') {
    fullDate = `${dayName} ${dayNumber} ${monthName} ${year}`;
  } else {
    fullDate = `${dayName}, ${monthName} ${dayNumber}, ${year}`;
  }

  // Calculate relative labels
  let relativeLabel: string | undefined;
  if (dateKey === todayKey) {
    relativeLabel = t.today;
  } else {
    const today = parseDateKey(todayKey);
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === -1) {
      relativeLabel = t.yesterday;
    } else if (diffDays === 1) {
      relativeLabel = t.tomorrow;
    }
  }

  return {
    dayName,
    dayNumber,
    monthName,
    year,
    fullDate,
    relativeLabel,
  };
}
