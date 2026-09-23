import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { HabitItem, SuggestedHabit, AppNotification } from '../types';
import { DEFAULT_PREVIOUS_HABITS } from '../data/defaultHabits';
import { getTodayDateKey, isPastDate } from '../utils/dateUtils';
import { matchesArabicPrefix, normalizeArabic } from '../utils/arabicUtils';
import {
  showSystemNotification,
  formatRemainingTimeToTask,
  calculateReminderTimestamp,
} from '../utils/notificationUtils';
import { translations, SupportedLanguage } from '../i18n/translations';

const STORAGE_KEY_HABITS = 'habits_organizer_items_v2';
const STORAGE_KEY_SUGGESTIONS = 'habits_organizer_suggestions_v2';
const STORAGE_KEY_NOTIFICATIONS = 'habits_organizer_inapp_notifications_v1';
const STORAGE_KEY_LANGUAGE = 'habits_organizer_selected_lang_v1';
const STORAGE_KEY_TRIGGERED_REMINDERS = 'habits_organizer_triggered_reminders_v2';

export function useHabits() {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateKey());

  // Language selection (ar, fr, en, zh, es)
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LANGUAGE) as SupportedLanguage;
      if (saved && ['ar', 'fr', 'en', 'zh', 'es'].includes(saved)) {
        return saved;
      }
    } catch (e) {
      console.error('Failed to read lang preference', e);
    }
    return 'ar';
  });

  const handleLanguageChange = useCallback((lang: SupportedLanguage) => {
    setCurrentLang(lang);
    try {
      localStorage.setItem(STORAGE_KEY_LANGUAGE, lang);
    } catch (e) {
      console.error('Failed to save language preference', e);
    }
  }, []);

  // Synchronize document dir and lang attributes
  useEffect(() => {
    const isRtl = currentLang === 'ar';
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLang;
  }, [currentLang]);

  // In-app notifications
  const [inAppNotifications, setInAppNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load notifications', e);
    }
    return [];
  });

  // Load habits from localStorage or provide initial demo habits
  const [habits, setHabits] = useState<HabitItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HABITS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load habits from localStorage', e);
    }

    const today = getTodayDateKey();
    const initialHabits: HabitItem[] = [
      {
        id: 'init-1',
        title: 'صلاة الفجر وقراءة أذكار الصباح',
        date: today,
        time: '05:30',
        completed: true,
        createdAt: 1000,
      },
      {
        id: 'init-2',
        title: 'تمارين رياضية صباحية (كارديو)',
        date: today,
        time: '07:00',
        completed: false,
        createdAt: 2000,
      },
      {
        id: 'init-3',
        title: 'قراءة 20 صفحة من كتاب تطوير الذات',
        date: today,
        time: '18:00',
        completed: false,
        createdAt: 3000,
      },
      {
        id: 'init-4',
        title: 'شرب 2 لتر من الماء خلال اليوم',
        date: today,
        completed: false,
        createdAt: 4000,
      },
    ];
    return initialHabits;
  });

  // Auto-complete suggestions state
  const [suggestions, setSuggestions] = useState<SuggestedHabit[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SUGGESTIONS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load suggestions from localStorage', e);
    }
    return DEFAULT_PREVIOUS_HABITS;
  });

  // Persist habits
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_HABITS, JSON.stringify(habits));
    } catch (e) {
      console.error('Failed to save habits to localStorage', e);
    }
  }, [habits]);

  // Persist suggestions
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SUGGESTIONS, JSON.stringify(suggestions));
    } catch (e) {
      console.error('Failed to save suggestions to localStorage', e);
    }
  }, [suggestions]);

  // Persist notifications
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(inAppNotifications));
    } catch (e) {
      console.error('Failed to save notifications to localStorage', e);
    }
  }, [inAppNotifications]);

  /**
   * Records a habit title and default time into the suggestions dictionary
   */
  const recordHabitUsage = useCallback((habit: { title: string; defaultTime?: string }) => {
    const trimmedTitle = habit.title.trim();
    if (!trimmedTitle) return;

    setSuggestions((prev) => {
      const normalizedNew = normalizeArabic(trimmedTitle);
      const existingIndex = prev.findIndex(
        (s) => normalizeArabic(s.title) === normalizedNew
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        const current = updated[existingIndex];
        updated[existingIndex] = {
          ...current,
          usageCount: current.usageCount + 1,
          lastUsed: Date.now(),
          defaultTime: habit.defaultTime || current.defaultTime,
        };
        return updated;
      } else {
        const newSuggestion: SuggestedHabit = {
          title: trimmedTitle,
          defaultTime: habit.defaultTime,
          usageCount: 1,
          lastUsed: Date.now(),
        };
        return [newSuggestion, ...prev];
      }
    });
  }, []);

  /**
   * Retrieves suggestions that match the typed prefix (only when at least 1 character is typed)
   */
  const getSuggestionsForPrefix = useCallback(
    (prefix: string): SuggestedHabit[] => {
      const trimmed = prefix ? prefix.trim() : '';
      if (!trimmed || trimmed.length === 0) {
        return [];
      }

      return suggestions
        .filter((s) => matchesArabicPrefix(s.title, trimmed))
        .sort((a, b) => {
          if (b.usageCount !== a.usageCount) {
            return b.usageCount - a.usageCount;
          }
          return (b.lastUsed || 0) - (a.lastUsed || 0);
        })
        .slice(0, 6);
    },
    [suggestions]
  );

  /**
   * Add a habit - rejected if date is in the past
   */
  const addHabit = useCallback((habitData: Omit<HabitItem, 'id' | 'createdAt'>) => {
    if (isPastDate(habitData.date)) {
      console.warn('Cannot add habits to past days');
      return null;
    }

    const newHabit: HabitItem = {
      ...habitData,
      id: 'habit_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      createdAt: Date.now(),
      notified: false,
    };

    setHabits((prev) => [...prev, newHabit]);

    recordHabitUsage({
      title: newHabit.title,
      defaultTime: newHabit.time,
    });

    return newHabit;
  }, [recordHabitUsage]);

  /**
   * Schedule a task as a habit across multiple days for a chosen duration
   */
  const addHabitSchedule = useCallback((scheduleData: {
    title: string;
    startDate: string;
    durationDays: number;
    selectedDaysOfWeek?: number[];
    time?: string;
    reminderEnabled?: boolean;
    reminderOffsetMinutes?: number;
    durationLabel?: string;
  }) => {
    const {
      title,
      startDate,
      durationDays,
      selectedDaysOfWeek,
      time,
      reminderEnabled,
      reminderOffsetMinutes,
      durationLabel,
    } = scheduleData;

    const trimmedTitle = title.trim();
    if (!trimmedTitle) return [];

    const groupId = 'habit_grp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const newItems: HabitItem[] = [];

    const [y, m, d] = startDate.split('-').map(Number);
    const start = new Date(y, m - 1, d);

    for (let i = 0; i < durationDays; i++) {
      const current = new Date(start);
      current.setDate(start.getDate() + i);

      // Check day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
      const dayOfWeek = current.getDay();
      if (selectedDaysOfWeek && selectedDaysOfWeek.length > 0 && !selectedDaysOfWeek.includes(dayOfWeek)) {
        continue;
      }

      const dateKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;

      // Do not add to past dates
      if (isPastDate(dateKey)) {
        continue;
      }

      let triggerTimestamp: number | undefined;
      if (reminderEnabled && time && reminderOffsetMinutes !== undefined) {
        triggerTimestamp = calculateReminderTimestamp(dateKey, time, reminderOffsetMinutes);
      }

      newItems.push({
        id: 'habit_' + Date.now() + '_' + i + '_' + Math.random().toString(36).substring(2, 7),
        title: trimmedTitle,
        date: dateKey,
        time: time || undefined,
        completed: false,
        createdAt: Date.now(),
        reminderEnabled: Boolean(reminderEnabled && triggerTimestamp),
        reminderTime: time,
        reminderOffsetMinutes: reminderOffsetMinutes,
        reminderTriggerTimestamp: triggerTimestamp,
        notified: false,
        isHabit: true,
        habitGroupId: groupId,
        habitDurationLabel: durationLabel,
        habitDaysOfWeek: selectedDaysOfWeek,
      });
    }

    if (newItems.length > 0) {
      setHabits((prev) => [...prev, ...newItems]);
      recordHabitUsage({
        title: trimmedTitle,
        defaultTime: time,
      });
    }

    return newItems;
  }, [recordHabitUsage]);

  const deleteHabitGroup = useCallback((groupId: string) => {
    setHabits((prev) =>
      prev.filter((h) => {
        if (h.habitGroupId === groupId) {
          if (isPastDate(h.date)) {
            return true;
          }
          return false;
        }
        return true;
      })
    );
  }, []);

  const updateHabit = useCallback((id: string, updates: Partial<HabitItem>) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === id) {
          // Past days cannot be edited
          if (isPastDate(h.date)) {
            return h;
          }

          const updated = { ...h, ...updates };
          if (updates.title && updates.title !== h.title) {
            recordHabitUsage({
              title: updated.title,
              defaultTime: updated.time,
            });
          }
          return updated;
        }
        return h;
      })
    );
  }, [recordHabitUsage]);

  const toggleHabit = useCallback((id: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === id) {
          // Past days cannot be toggled/edited
          if (isPastDate(h.date)) {
            return h;
          }
          return { ...h, completed: !h.completed };
        }
        return h;
      })
    );
  }, []);

  const deleteHabit = useCallback((id: string) => {
    setHabits((prev) =>
      prev.filter((h) => {
        if (h.id === id) {
          // Past days cannot be deleted
          if (isPastDate(h.date)) {
            return true;
          }
          return false;
        }
        return true;
      })
    );
    setInAppNotifications((prev) => prev.filter((n) => n.habitId !== id));
    triggeredRemindersRef.current.delete(id);
    try {
      localStorage.setItem(
        STORAGE_KEY_TRIGGERED_REMINDERS,
        JSON.stringify(Array.from(triggeredRemindersRef.current))
      );
    } catch {}
  }, []);

  const dismissInAppNotification = useCallback((id: string) => {
    setInAppNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const markNotificationAsRead = useCallback((id: string) => {
    setInAppNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setInAppNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setInAppNotifications([]);
  }, []);

  // Set of habit IDs whose reminder has already triggered, persisted across reloads
  const triggeredRemindersRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TRIGGERED_REMINDERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          parsed.forEach((id: string) => triggeredRemindersRef.current.add(id));
        }
      }
    } catch (e) {
      console.error('Failed to load triggered reminders', e);
    }
  }, []);

  /**
   * Periodic reminder checker:
   * Checks every 15 seconds if any scheduled reminder reached its trigger timestamp.
   * Ensures the reminder or alert is triggered strictly once.
   */
  useEffect(() => {
    const checkReminders = () => {
      const now = Date.now();
      const habitsToTrigger: HabitItem[] = [];

      habits.forEach((habit) => {
        if (
          habit.reminderEnabled &&
          habit.reminderTriggerTimestamp &&
          habit.reminderTriggerTimestamp <= now &&
          !habit.notified &&
          !habit.completed &&
          !triggeredRemindersRef.current.has(habit.id)
        ) {
          habitsToTrigger.push(habit);
        }
      });

      if (habitsToTrigger.length > 0) {
        // Synchronously record habit IDs so the reminder never triggers again
        habitsToTrigger.forEach((h) => triggeredRemindersRef.current.add(h.id));
        try {
          localStorage.setItem(
            STORAGE_KEY_TRIGGERED_REMINDERS,
            JSON.stringify(Array.from(triggeredRemindersRef.current))
          );
        } catch {}

        // Mark habit as notified and disable active reminder flag
        setHabits((prev) =>
          prev.map((h) =>
            habitsToTrigger.some((target) => target.id === h.id)
              ? { ...h, notified: true, reminderEnabled: false }
              : h
          )
        );

        const t = translations[currentLang];

        // For each triggered habit, dispatch notification with remaining time until task
        habitsToTrigger.forEach((habit) => {
          const notifId = 'notif_' + Date.now() + '_' + habit.id;

          // Calculate remaining time message until the task
          const remainingMsg = formatRemainingTimeToTask(
            habit.date,
            habit.time,
            currentLang,
            habit.reminderOffsetMinutes
          );

          // 1. System notification (mobile screen top / desktop prompt)
          const timeText = habit.time ? ` [${t.timeLabel}: ${habit.time}]` : '';
          const sysTitle = `${habit.title} - ${remainingMsg}`;
          const sysBody = habit.time ? `${remainingMsg} (${habit.time})` : remainingMsg;

          showSystemNotification(
            sysTitle,
            {
              body: sysBody,
              icon: '/icon.jpg',
            },
            () => {
              // Mark as read instead of removing from list
              markNotificationAsRead(notifId);
            }
          );

          // 2. In-app notification card with explanatory message of remaining time
          const newNotif: AppNotification = {
            id: notifId,
            habitId: habit.id,
            habitTitle: habit.title,
            habitDate: habit.date,
            habitTime: habit.time,
            timestamp: Date.now(),
            read: false,
            explanatoryMessage: remainingMsg,
          };
          setInAppNotifications((prev) => [newNotif, ...prev]);
        });
      }
    };

    checkReminders();
    const interval = setInterval(checkReminders, 15000); // check every 15s
    return () => clearInterval(interval);
  }, [habits, currentLang]);

  /**
   * Sorting rules:
   * Habits with time sorted by time asc.
   * Habits without time sorted by createdAt asc.
   */
  const dateHabits = useMemo(() => {
    return habits
      .filter((h) => h.date === selectedDate)
      .sort((a, b) => {
        const hasTimeA = Boolean(a.time && a.time.trim());
        const hasTimeB = Boolean(b.time && b.time.trim());

        if (hasTimeA && hasTimeB) {
          return (a.time || '').localeCompare(b.time || '');
        }
        if (hasTimeA && !hasTimeB) {
          return -1;
        }
        if (!hasTimeA && hasTimeB) {
          return 1;
        }
        return a.createdAt - b.createdAt;
      });
  }, [habits, selectedDate]);

  /**
   * Statistics for any specific date
   */
  const getDateStats = useCallback(
    (dateKey: string) => {
      const dayHabits = habits.filter((h) => h.date === dateKey);
      const total = dayHabits.length;
      const completed = dayHabits.filter((h) => h.completed).length;
      const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
      return { total, completed, percentage };
    },
    [habits]
  );

  return {
    selectedDate,
    setSelectedDate,
    dateHabits,
    allHabits: habits,
    inAppNotifications,
    currentLang,
    handleLanguageChange,
    addHabit,
    addHabitSchedule,
    updateHabit,
    toggleHabit,
    deleteHabit,
    deleteHabitGroup,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    dismissInAppNotification,
    clearAllNotifications,
    getSuggestionsForPrefix,
    getDateStats,
  };
}
