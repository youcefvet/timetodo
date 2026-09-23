import React, { useState } from 'react';
import { HabitAutocompleteInput } from './HabitAutocompleteInput';
import { SuggestedHabit } from '../types';
import { Plus, Clock, X, Bell, Lock, Repeat, Crown, Sparkles } from 'lucide-react';
import {
  isMoreThan24HoursAhead,
  calculateReminderTimestamp,
  getNotificationTimeString,
  requestNotificationPermission,
  isNotificationSupported,
} from '../utils/notificationUtils';
import { getLocalizedDateFormatted } from '../utils/localizedDateUtils';
import { translations, SupportedLanguage } from '../i18n/translations';
import { isPastDate } from '../utils/dateUtils';

interface DateHabitInputBoxProps {
  selectedDate: string;
  onAddHabit: (habit: {
    title: string;
    time?: string;
    reminderEnabled?: boolean;
    reminderTime?: string;
    reminderOffsetMinutes?: number;
    reminderTriggerTimestamp?: number;
  }) => void;
  onAddHabitSchedule?: (schedule: {
    title: string;
    startDate: string;
    durationDays: number;
    selectedDaysOfWeek?: number[];
    time?: string;
    reminderEnabled?: boolean;
    reminderOffsetMinutes?: number;
    durationLabel?: string;
  }) => void;
  getSuggestions: (prefix: string) => SuggestedHabit[];
  onClose?: () => void;
  lang?: SupportedLanguage;
  isHabitPaywalled?: boolean;
  isProUser?: boolean;
  onRequestPaywall?: () => void;
}

export const DateHabitInputBox: React.FC<DateHabitInputBoxProps> = ({
  selectedDate,
  onAddHabit,
  onAddHabitSchedule,
  getSuggestions,
  onClose,
  lang = 'ar',
  isHabitPaywalled = false,
  isProUser = false,
  onRequestPaywall,
}) => {
  const t = translations[lang];
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [error, setError] = useState('');

  // Reminder states
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [selectedOffset, setSelectedOffset] = useState<number>(15); // Default: 15 mins before
  const [customOffsetValue, setCustomOffsetValue] = useState<number>(1);
  const [customOffsetUnit, setCustomOffsetUnit] = useState<'minutes' | 'hours' | 'days'>('hours');

  // Habit recurring scheduling states
  const [isHabitEnabled, setIsHabitEnabled] = useState(false);
  const [selectedDays, setSelectedDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [durationPreset, setDurationPreset] = useState<number>(21); // Default: 21 days
  const [customDurationValue, setCustomDurationValue] = useState<number>(30);
  const [customDurationUnit, setCustomDurationUnit] = useState<'days' | 'weeks' | 'months'>('days');

  // Preset options localized
  const presetDurations = [
    { label: t.sameTime, value: 0 },
    { label: t.before15m, value: 15 },
    { label: t.before30m, value: 30 },
    { label: t.before1h, value: 60 },
    { label: t.before2h, value: 120 },
    { label: t.before3h, value: 180 },
    { label: t.before1d, value: 1440 }, // 1 day
    { label: t.before2d, value: 2880 }, // 2 days
    { label: t.custom, value: -1 },
  ];

  const habitDurationPresets = [
    { label: t.duration1Week, value: 7 },
    { label: t.duration2Weeks, value: 14 },
    { label: t.duration21Days, value: 21 },
    { label: t.duration1Month, value: 30 },
    { label: t.duration3Months, value: 90 },
    { label: t.customDuration, value: -1 },
  ];

  // Check if target date/time is > 24h in the future
  const isFutureDateMoreThan24Hours = isMoreThan24HoursAhead(selectedDate, time);

  const handleEnableReminderToggle = async (enabled: boolean) => {
    setReminderEnabled(enabled);
    if (enabled && isNotificationSupported() && Notification.permission !== 'granted') {
      await requestNotificationPermission();
    }
  };

  const getCustomOffsetInMinutes = (): number => {
    if (customOffsetUnit === 'days') {
      return customOffsetValue * 24 * 60;
    }
    if (customOffsetUnit === 'hours') {
      return customOffsetValue * 60;
    }
    return customOffsetValue;
  };

  const effectiveOffsetMinutes =
    selectedOffset === -1
      ? getCustomOffsetInMinutes()
      : selectedOffset;

  const isPast = isPastDate(selectedDate);

  const getEffectiveDurationDays = (): number => {
    if (durationPreset === -1) {
      if (customDurationUnit === 'months') return customDurationValue * 30;
      if (customDurationUnit === 'weeks') return customDurationValue * 7;
      return customDurationValue;
    }
    return durationPreset;
  };

  const getDurationLabel = (): string => {
    const match = habitDurationPresets.find((p) => p.value === durationPreset);
    if (match && match.value !== -1) return match.label;
    return `${getEffectiveDurationDays()} ${t.daysUnit}`;
  };

  const toggleDay = (dayIndex: number) => {
    setSelectedDays((prev) => {
      if (prev.includes(dayIndex)) {
        if (prev.length === 1) return prev;
        return prev.filter((d) => d !== dayIndex);
      } else {
        return [...prev, dayIndex].sort();
      }
    });
  };

  const calculateTotalHabitTasks = (): number => {
    const totalDays = getEffectiveDurationDays();
    let count = 0;
    const [y, m, d] = selectedDate.split('-').map(Number);
    const start = new Date(y, m - 1, d);
    for (let i = 0; i < totalDays; i++) {
      const cur = new Date(start);
      cur.setDate(start.getDate() + i);
      const dayOfWeek = cur.getDay();
      if (selectedDays.includes(dayOfWeek)) {
        count++;
      }
    }
    return count;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPast) {
      return;
    }
    if (!title.trim()) {
      setError(t.errorEmptyTitle);
      return;
    }

    if (isHabitEnabled && onAddHabitSchedule) {
      const effectiveDuration = getEffectiveDurationDays();
      onAddHabitSchedule({
        title: title.trim(),
        startDate: selectedDate,
        durationDays: effectiveDuration,
        selectedDaysOfWeek: selectedDays,
        time: time || undefined,
        reminderEnabled: reminderEnabled,
        reminderOffsetMinutes: reminderEnabled ? effectiveOffsetMinutes : undefined,
        durationLabel: getDurationLabel(),
      });
    } else {
      let triggerTimestamp: number | undefined;
      let notifTimeString: string | undefined;

      if (reminderEnabled && isFutureDateMoreThan24Hours) {
        const baseHabitTime = time || '09:00';
        triggerTimestamp = calculateReminderTimestamp(selectedDate, baseHabitTime, effectiveOffsetMinutes);
        notifTimeString = getNotificationTimeString(baseHabitTime, effectiveOffsetMinutes);
      }

      onAddHabit({
        title: title.trim(),
        time: time || undefined,
        reminderEnabled: reminderEnabled && isFutureDateMoreThan24Hours,
        reminderTime: notifTimeString,
        reminderOffsetMinutes: reminderEnabled && isFutureDateMoreThan24Hours ? effectiveOffsetMinutes : undefined,
        reminderTriggerTimestamp: triggerTimestamp,
      });
    }

    setTitle('');
    setTime('');
    setReminderEnabled(false);
    setIsHabitEnabled(false);
    setError('');
  };

  const handleSelectSuggestion = (suggestion: SuggestedHabit) => {
    if (suggestion.defaultTime && !time) {
      setTime(suggestion.defaultTime);
    }
  };

  const formattedDate = getLocalizedDateFormatted(selectedDate, lang);

  if (isPast) {
    return (
      <div
        id="date-habit-locked-box"
        className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xs flex items-center justify-center relative select-none"
      >
        <div
          className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center shadow-2xs"
          title={t.pastDaysLocked}
          aria-label={t.pastDaysLocked}
        >
          <Lock className="w-5 h-5 stroke-[2]" />
        </div>
        {onClose && (
          <button
            id="close-habit-locked-btn"
            type="button"
            onClick={onClose}
            className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title={t.dismiss}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      id="date-habit-input-box"
      className="bg-white dark:bg-slate-900 border-2 border-emerald-500/40 rounded-2xl p-4 sm:p-5 shadow-md space-y-4"
    >
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            {t.addHabitForDate}: {formattedDate.fullDate}
          </h2>
        </div>
        {onClose && (
          <button
            id="close-habit-input-btn"
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Habit Title with Autocomplete */}
        <div>
          <HabitAutocompleteInput
            id="input-box-habit-title"
            value={title}
            onChange={(val) => {
              setTitle(val);
              if (error) setError('');
            }}
            onSelectSuggestion={handleSelectSuggestion}
            getSuggestions={getSuggestions}
            placeholder={t.habitInputPlaceholder}
            autoFocus
          />
          {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
        </div>

        {/* Time input */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl flex-1 sm:max-w-xs">
            <Clock className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-xs text-slate-500 whitespace-nowrap">{t.timeOptional}</span>
            <input
              id="input-box-habit-time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="bg-transparent text-sm text-slate-800 dark:text-slate-100 focus:outline-none w-full font-mono cursor-pointer"
            />
            {time && (
              <button
                type="button"
                onClick={() => setTime('')}
                className="text-slate-400 hover:text-slate-600 text-xs"
                title={t.clearTime}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Habit Recurring Programming Feature Box (ميزة عادة: برمجة المهمة في عدة أيام ولمدة زمنية مختارة) */}
        <div
          id="habit-schedule-box"
          className="rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/70 dark:bg-amber-950/30 p-3.5 space-y-3 transition-all"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center shrink-0">
                <Repeat className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-sm font-bold text-amber-950 dark:text-amber-100 block leading-tight">
                    {t.scheduleAsHabit}
                  </span>
                  {isHabitPaywalled && !isProUser && (
                    <button
                      type="button"
                      onClick={onRequestPaywall}
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500 hover:bg-amber-600 text-white font-black text-[10px] shadow-2xs transition cursor-pointer"
                      title={t.proFeature}
                    >
                      <Crown className="w-2.5 h-2.5 stroke-[2.5]" />
                      <span>{t.proBadge}</span>
                    </button>
                  )}
                  {isHabitPaywalled && isProUser && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-[10px] border border-emerald-300/60">
                      <Sparkles className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                      <span>{t.proUnlocked}</span>
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-amber-800/80 dark:text-amber-300/80 block mt-0.5">
                  {t.habitFeatureDesc}
                </span>
                {isHabitPaywalled && !isProUser && (
                  <button
                    type="button"
                    onClick={onRequestPaywall}
                    className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold hover:underline inline-flex items-center gap-1 mt-1 cursor-pointer"
                  >
                    <Crown className="w-3 h-3 text-amber-600" />
                    <span>{t.habitMonetizationTitle}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Toggle Switch */}
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                id="habit-feature-toggle"
                type="checkbox"
                checked={isHabitEnabled}
                onChange={(e) => {
                  if (isHabitPaywalled && !isProUser) {
                    onRequestPaywall?.();
                    return;
                  }
                  setIsHabitEnabled(e.target.checked);
                }}
                className="sr-only peer"
              />
              <div className="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
            </label>
          </div>

          {isHabitEnabled && (
            <div className="pt-2.5 border-t border-amber-200/60 dark:border-amber-800/50 space-y-3 text-xs">
              {/* 1. Days of Week Selection */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <span className="font-bold text-amber-950 dark:text-amber-100">
                    {t.repeatDays}:
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setSelectedDays([0, 1, 2, 3, 4, 5, 6])}
                      className="text-[11px] px-2 py-0.5 rounded bg-amber-100/90 dark:bg-amber-900/50 text-amber-900 dark:text-amber-200 hover:bg-amber-200/80 transition cursor-pointer font-medium"
                    >
                      {t.allDays}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedDays(lang === 'ar' ? [0, 1, 2, 3, 4] : [1, 2, 3, 4, 5])}
                      className="text-[11px] px-2 py-0.5 rounded bg-amber-100/90 dark:bg-amber-900/50 text-amber-900 dark:text-amber-200 hover:bg-amber-200/80 transition cursor-pointer font-medium"
                    >
                      {t.workdays}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedDays(lang === 'ar' ? [5, 6] : [0, 6])}
                      className="text-[11px] px-2 py-0.5 rounded bg-amber-100/90 dark:bg-amber-900/50 text-amber-900 dark:text-amber-200 hover:bg-amber-200/80 transition cursor-pointer font-medium"
                    >
                      {t.weekend}
                    </button>
                  </div>
                </div>

                {/* 7-day pill toggles */}
                <div className="grid grid-cols-7 gap-1 pt-1">
                  {t.days.map((dayName, index) => {
                    const isSelected = selectedDays.includes(index);
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => toggleDay(index)}
                        className={`py-1.5 px-1 rounded-lg text-center font-medium transition cursor-pointer text-[11px] ${
                          isSelected
                            ? 'bg-amber-600 text-white shadow-xs font-bold'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-amber-200/60 dark:border-slate-700 hover:bg-amber-50 dark:hover:bg-slate-700'
                        }`}
                      >
                        {dayName.slice(0, 3)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Duration Period Selection */}
              <div className="space-y-1.5 pt-1">
                <span className="font-bold text-amber-950 dark:text-amber-100 block">
                  {t.durationPeriod}:
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {habitDurationPresets.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setDurationPreset(preset.value)}
                      className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                        durationPreset === preset.value
                          ? 'bg-amber-600 text-white shadow-xs font-bold'
                          : 'bg-white dark:bg-slate-800 text-amber-950 dark:text-amber-200 border border-amber-200 dark:border-amber-800/60 hover:bg-amber-100/70'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Custom duration fields */}
                {durationPreset === -1 && (
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-amber-300 dark:border-amber-700">
                      <input
                        id="custom-duration-input"
                        type="number"
                        min="1"
                        max={customDurationUnit === 'months' ? 12 : customDurationUnit === 'weeks' ? 52 : 365}
                        value={customDurationValue}
                        onChange={(e) => setCustomDurationValue(Math.max(1, parseInt(e.target.value, 10) || 1))}
                        className="w-16 bg-transparent text-sm font-mono text-center text-slate-900 dark:text-white focus:outline-none"
                      />
                      <div className="flex items-center bg-slate-100 dark:bg-slate-700/60 rounded-md p-0.5 text-xs">
                        <button
                          type="button"
                          onClick={() => setCustomDurationUnit('days')}
                          className={`px-2 py-0.5 rounded transition cursor-pointer ${
                            customDurationUnit === 'days'
                              ? 'bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-300 font-bold shadow-xs'
                              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                          }`}
                        >
                          {t.daysUnit}
                        </button>
                        <button
                          type="button"
                          onClick={() => setCustomDurationUnit('weeks')}
                          className={`px-2 py-0.5 rounded transition cursor-pointer ${
                            customDurationUnit === 'weeks'
                              ? 'bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-300 font-bold shadow-xs'
                              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                          }`}
                        >
                          {lang === 'ar' ? 'أسبوع' : 'week'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setCustomDurationUnit('months')}
                          className={`px-2 py-0.5 rounded transition cursor-pointer ${
                            customDurationUnit === 'months'
                              ? 'bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-300 font-bold shadow-xs'
                              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                          }`}
                        >
                          {lang === 'ar' ? 'شهر' : 'month'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Dynamic Summary Badge */}
              <div className="bg-amber-100/70 dark:bg-amber-900/30 border border-amber-300/60 dark:border-amber-700/40 rounded-lg p-2.5 flex items-center justify-between text-[11px] text-amber-950 dark:text-amber-200">
                <span className="font-semibold flex items-center gap-1.5">
                  <Repeat className="w-3.5 h-3.5 text-amber-600" />
                  <span>{t.scheduledHabitSummary}:</span>
                  <span>{getDurationLabel()}</span>
                </span>
                <span className="px-2 py-0.5 bg-amber-600 text-white rounded font-bold">
                  {calculateTotalHabitTasks()} {lang === 'ar' ? 'مهمة مجدولة' : 'tasks'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 
          Reminder proposal section:
          - Shows ONLY: reminderQuestion (e.g. "هل تريد مني تذكيرك؟")
          - Durations available in Minutes, Hours, AND DAYS
          - No extra instructions
        */}
        {isFutureDateMoreThan24Hours && (
          <div
            id="notification-proposal-box"
            className="rounded-xl border border-teal-200 dark:border-teal-800/60 bg-teal-50/70 dark:bg-teal-950/30 p-3.5 space-y-3 transition-all"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                <span className="text-sm font-bold text-teal-950 dark:text-teal-100">
                  {t.reminderQuestion}
                </span>
              </div>

              {/* Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={reminderEnabled}
                  onChange={(e) => handleEnableReminderToggle(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
              </label>
            </div>

            {/* Duration choices: Minutes, Hours, Days */}
            {reminderEnabled && (
              <div className="pt-2.5 border-t border-teal-200/60 dark:border-teal-800/50 space-y-2.5 text-xs">
                <div className="flex flex-wrap items-center gap-1.5">
                  {presetDurations.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setSelectedOffset(preset.value)}
                      className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                        selectedOffset === preset.value
                          ? 'bg-teal-600 text-white shadow-xs font-bold'
                          : 'bg-white dark:bg-slate-800 text-teal-900 dark:text-teal-200 border border-teal-200 dark:border-teal-800/60 hover:bg-teal-100/70'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Custom unit input if "مخصص / Custom" is selected */}
                {selectedOffset === -1 && (
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-teal-300 dark:border-teal-700">
                      <input
                        id="custom-offset-input"
                        type="number"
                        min="1"
                        max={customOffsetUnit === 'days' ? 30 : customOffsetUnit === 'hours' ? 48 : 2880}
                        value={customOffsetValue}
                        onChange={(e) => setCustomOffsetValue(Math.max(1, parseInt(e.target.value, 10) || 1))}
                        className="w-16 bg-transparent text-sm font-mono text-center text-slate-900 dark:text-white focus:outline-none"
                      />
                      <div className="flex items-center bg-slate-100 dark:bg-slate-700/60 rounded-md p-0.5 text-xs">
                        <button
                          type="button"
                          onClick={() => setCustomOffsetUnit('days')}
                          className={`px-2 py-0.5 rounded transition cursor-pointer ${
                            customOffsetUnit === 'days'
                              ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 font-bold shadow-xs'
                              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                          }`}
                        >
                          {t.daysUnit}
                        </button>
                        <button
                          type="button"
                          onClick={() => setCustomOffsetUnit('hours')}
                          className={`px-2 py-0.5 rounded transition cursor-pointer ${
                            customOffsetUnit === 'hours'
                              ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 font-bold shadow-xs'
                              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                          }`}
                        >
                          {t.hoursUnit}
                        </button>
                        <button
                          type="button"
                          onClick={() => setCustomOffsetUnit('minutes')}
                          className={`px-2 py-0.5 rounded transition cursor-pointer ${
                            customOffsetUnit === 'minutes'
                              ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 font-bold shadow-xs'
                              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                          }`}
                        >
                          {t.minutesUnit}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Submit button */}
        <div className="flex justify-end pt-1">
          <button
            id="submit-habit-btn"
            type="submit"
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isHabitEnabled ? t.scheduleAsHabit : t.addHabitBtn}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
