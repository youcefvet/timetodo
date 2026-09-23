import { parseDateKey } from './dateUtils';
import { SupportedLanguage } from '../i18n/translations';

/**
 * Calculates the remaining time duration until a task from now
 * and formats a clear, natural-sounding explanatory string for the reminder notification.
 */
export function formatRemainingTimeToTask(
  targetDateKey: string,
  targetTime?: string,
  lang: string = 'ar',
  forcedOffsetMinutes?: number
): string {
  let diffMs: number;

  if (typeof forcedOffsetMinutes === 'number' && forcedOffsetMinutes > 0) {
    diffMs = forcedOffsetMinutes * 60 * 1000;
  } else {
    const targetDate = parseDateKey(targetDateKey);
    if (targetTime && targetTime.includes(':')) {
      const [hours, minutes] = targetTime.split(':').map(Number);
      targetDate.setHours(hours || 0, minutes || 0, 0, 0);
    } else {
      targetDate.setHours(9, 0, 0, 0);
    }
    diffMs = targetDate.getTime() - Date.now();
  }

  // If time has arrived or passed
  if (diffMs <= 30 * 1000) {
    switch (lang) {
      case 'fr':
        return 'C’est l’heure de la tâche maintenant !';
      case 'en':
        return 'The task is due right now!';
      case 'zh':
        return '任务时间已到！';
      case 'es':
        return '¡Es hora de la tarea ahora!';
      case 'ar':
      default:
        return 'حان موعد المهمة الآن!';
    }
  }

  const totalMinutes = Math.round(diffMs / (60 * 1000));

  // Less than 60 minutes
  if (totalMinutes < 60) {
    const m = Math.max(1, totalMinutes);
    switch (lang) {
      case 'fr':
        return `Il reste ${m} minute${m > 1 ? 's' : ''} avant la tâche`;
      case 'en':
        return `${m} minute${m > 1 ? 's' : ''} remaining until the task`;
      case 'zh':
        return `距离任务还有 ${m} 分钟`;
      case 'es':
        return `Queda${m > 1 ? 'n' : ''} ${m} minuto${m > 1 ? 's' : ''} para la tarea`;
      case 'ar':
      default: {
        if (m === 1) return 'متبقي دقيقة واحدة على موعد المهمة';
        if (m === 2) return 'متبقي دقيقتان على موعد المهمة';
        if (m >= 3 && m <= 10) return `متبقي ${m} دقائق على موعد المهمة`;
        return `متبقي ${m} دقيقة على موعد المهمة`;
      }
    }
  }

  // Between 1 hour and 24 hours
  if (totalMinutes < 1440) {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    switch (lang) {
      case 'fr': {
        const minPart = m > 0 ? ` et ${m} min` : '';
        return `Il reste ${h} heure${h > 1 ? 's' : ''}${minPart} avant la tâche`;
      }
      case 'en': {
        const minPart = m > 0 ? ` and ${m} min` : '';
        return `${h} hour${h > 1 ? 's' : ''}${minPart} remaining until the task`;
      }
      case 'zh': {
        const minPart = m > 0 ? ` ${m} 分钟` : '';
        return `距离任务还有 ${h} 小时${minPart}`;
      }
      case 'es': {
        const minPart = m > 0 ? ` y ${m} min` : '';
        return `Queda${h > 1 ? 'n' : ''} ${h} hora${h > 1 ? 's' : ''}${minPart} para la tarea`;
      }
      case 'ar':
      default: {
        const minPart = m > 0 ? (m === 1 ? ' ودقيقة واحدة' : m === 2 ? ' ودقيقتان' : m <= 10 ? ` و ${m} دقائق` : ` و ${m} دقيقة`) : '';
        if (h === 1) return `متبقي ساعة واحدة${minPart} على موعد المهمة`;
        if (h === 2) return `متبقي ساعتان${minPart} على موعد المهمة`;
        if (h >= 3 && h <= 10) return `متبقي ${h} ساعات${minPart} على موعد المهمة`;
        return `متبقي ${h} ساعة${minPart} على موعد المهمة`;
      }
    }
  }

  // 1 day or more
  const days = Math.floor(totalMinutes / 1440);
  const remH = Math.floor((totalMinutes % 1440) / 60);
  switch (lang) {
    case 'fr': {
      const hPart = remH > 0 ? ` et ${remH} h` : '';
      return `Il reste ${days} jour${days > 1 ? 's' : ''}${hPart} avant la tâche`;
    }
    case 'en': {
      const hPart = remH > 0 ? ` and ${remH} hr` : '';
      return `${days} day${days > 1 ? 's' : ''}${hPart} remaining until the task`;
    }
    case 'zh': {
      const hPart = remH > 0 ? ` ${remH} 小时` : '';
      return `距离任务还有 ${days} 天${hPart}`;
    }
    case 'es': {
      const hPart = remH > 0 ? ` y ${remH} h` : '';
      return `Queda${days > 1 ? 'n' : ''} ${days} día${days > 1 ? 's' : ''}${hPart} para la tarea`;
    }
    case 'ar':
    default: {
      const hPart = remH > 0 ? (remH === 1 ? ' وساعة واحدة' : remH === 2 ? ' وساعتان' : remH <= 10 ? ` و ${remH} ساعات` : ` و ${remH} ساعة`) : '';
      if (days === 1) return `متبقي يوم واحد${hPart} على موعد المهمة`;
      if (days === 2) return `متبقي يومان${hPart} على موعد المهمة`;
      if (days >= 3 && days <= 10) return `متبقي ${days} أيام${hPart} على موعد المهمة`;
      return `متبقي ${days} يوماً${hPart} على موعد المهمة`;
    }
  }
}

/**
 * Short badge formatted remaining time
 */
export function formatRemainingTimeShort(
  targetDateKey: string,
  targetTime?: string,
  lang: string = 'ar'
): string {
  const targetDate = parseDateKey(targetDateKey);
  if (targetTime && targetTime.includes(':')) {
    const [hours, minutes] = targetTime.split(':').map(Number);
    targetDate.setHours(hours || 0, minutes || 0, 0, 0);
  } else {
    targetDate.setHours(9, 0, 0, 0);
  }
  const diffMs = targetDate.getTime() - Date.now();

  if (diffMs <= 30 * 1000) {
    return lang === 'ar' ? 'الآن' : lang === 'fr' ? 'Maintenant' : lang === 'zh' ? '现在' : lang === 'es' ? 'Ahora' : 'Now';
  }

  const totalMinutes = Math.round(diffMs / (60 * 1000));
  if (totalMinutes < 60) {
    const m = Math.max(1, totalMinutes);
    return lang === 'ar' ? `متبقي ${m} د` : `${m}m left`;
  }
  if (totalMinutes < 1440) {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return lang === 'ar'
      ? `متبقي ${h} س${m > 0 ? ` و ${m} د` : ''}`
      : `${h}h${m > 0 ? ` ${m}m` : ''} left`;
  }
  const d = Math.floor(totalMinutes / 1440);
  return lang === 'ar' ? `متبقي ${d} يوم` : `${d}d left`;
}

/**
 * Checks if a given target date and time is more than 24 hours in the future
 * compared to now.
 */
export function isMoreThan24HoursAhead(targetDateKey: string, targetTime?: string): boolean {
  const now = Date.now();
  const targetParsed = parseDateKey(targetDateKey);
  
  if (targetTime && targetTime.includes(':')) {
    const [hours, minutes] = targetTime.split(':').map(Number);
    targetParsed.setHours(hours || 0, minutes || 0, 0, 0);
  } else {
    // If no specific time, default to start of that day (09:00 AM)
    targetParsed.setHours(9, 0, 0, 0);
  }

  const diffMs = targetParsed.getTime() - now;
  const twentyFourHoursMs = 24 * 60 * 60 * 1000;

  return diffMs > twentyFourHoursMs;
}

/**
 * Calculates the exact trigger timestamp for a reminder given a target date,
 * target habit time, and offset minutes before the habit time.
 */
export function calculateReminderTimestamp(
  targetDateKey: string,
  baseTime: string,
  offsetMinutes: number = 0
): number {
  const targetDate = parseDateKey(targetDateKey);
  if (baseTime && baseTime.includes(':')) {
    const [hours, minutes] = baseTime.split(':').map(Number);
    targetDate.setHours(hours || 0, minutes || 0, 0, 0);
  } else {
    targetDate.setHours(9, 0, 0, 0);
  }

  // Subtract offset in minutes
  return targetDate.getTime() - offsetMinutes * 60 * 1000;
}

/**
 * Formats time string (HH:mm) minus offsetMinutes for displaying the exact notification time
 */
export function getNotificationTimeString(baseTime: string, offsetMinutes: number = 0): string {
  if (!baseTime || !baseTime.includes(':')) return '';
  const [hours, minutes] = baseTime.split(':').map(Number);
  const totalMin = hours * 60 + minutes - offsetMinutes;
  const normalizedMin = ((totalMin % 1440) + 1440) % 1440;
  const h = Math.floor(normalizedMin / 60);
  const m = normalizedMin % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Checks if Notification API is supported
 */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Requests browser/system notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) {
    return 'denied';
  }
  try {
    return await Notification.requestPermission();
  } catch (error) {
    console.error('Failed to request notification permission:', error);
    return 'denied';
  }
}

/**
 * Displays system push notification (top of screen / mobile notification bar)
 * Closes automatically when clicked.
 */
export async function showSystemNotification(
  title: string,
  options?: NotificationOptions,
  onClick?: () => void
): Promise<boolean> {
  if (!isNotificationSupported()) return false;

  if (Notification.permission !== 'granted') {
    const perm = await requestNotificationPermission();
    if (perm !== 'granted') return false;
  }

  try {
    // Try standard window Notification
    const notif = new Notification(title, {
      icon: '/icon.jpg',
      ...options,
    });

    notif.onclick = () => {
      try {
        window.focus();
      } catch {
        // ignore
      }
      notif.close();
      if (onClick) {
        onClick();
      }
    };

    return true;
  } catch (err) {
    console.warn('Could not trigger system notification directly:', err);
    return false;
  }
}
