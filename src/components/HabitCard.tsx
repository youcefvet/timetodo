import React, { useState } from 'react';
import { HabitItem } from '../types';
import { Check, Trash2, Clock, Bell, Lock, Repeat, X } from 'lucide-react';
import { translations, SupportedLanguage } from '../i18n/translations';
import { formatRemainingTimeShort, formatRemainingTimeToTask } from '../utils/notificationUtils';
import { isPastDate } from '../utils/dateUtils';

interface HabitCardProps {
  habit: HabitItem;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onDeleteGroup?: (groupId: string) => void;
  lang?: SupportedLanguage;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  onToggle,
  onDelete,
  onDeleteGroup,
  lang = 'ar',
}) => {
  const t = translations[lang];
  const isPast = isPastDate(habit.date);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <div
      id={`habit-card-${habit.id}`}
      className={`group shrink-0 w-72 sm:w-80 rounded-2xl p-4 transition-all duration-200 border flex flex-col justify-between relative ${
        habit.completed
          ? 'bg-slate-50 dark:bg-slate-900/40 border-emerald-300 dark:border-emerald-900/60 shadow-xs'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-emerald-300'
      }`}
    >
      {/* Delete confirmation modal for habit series */}
      {showDeleteModal && (
        <div className="absolute inset-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs z-10 rounded-2xl p-3 flex flex-col justify-between border border-slate-200 dark:border-slate-700 shadow-md animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
              <span>{t.deleteHabit}</span>
            </span>
            <button
              type="button"
              onClick={() => setShowDeleteModal(false)}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1.5 py-1">
            <button
              type="button"
              onClick={() => {
                setShowDeleteModal(false);
                onDelete(habit.id);
              }}
              className="w-full text-start px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-700 dark:text-slate-200 hover:text-rose-600 transition cursor-pointer"
            >
              {t.deleteOnlyThisInstance}
            </button>
            {habit.habitGroupId && onDeleteGroup && (
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  onDeleteGroup(habit.habitGroupId!);
                }}
                className="w-full text-start px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-300 transition cursor-pointer"
              >
                {t.deleteAllHabitSeries}
              </button>
            )}
          </div>
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* Checkbox button - disabled and locked if in a past day */}
        <button
          id={`toggle-habit-btn-${habit.id}`}
          type="button"
          disabled={isPast}
          onClick={() => !isPast && onToggle(habit.id)}
          title={isPast ? t.pastDaysLocked : undefined}
          className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center transition-all shrink-0 ${
            isPast ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'
          } ${
            habit.completed
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'border-2 border-slate-300 dark:border-slate-600 hover:border-emerald-500 bg-white dark:bg-slate-800'
          }`}
        >
          {habit.completed ? (
            <Check className="w-4 h-4 stroke-[2.5]" />
          ) : isPast ? (
            <Lock className="w-3 h-3 text-slate-400 dark:text-slate-500" />
          ) : null}
        </button>

        {/* Title */}
        <div className="min-w-0 flex-1">
          <h3
            className={`font-semibold text-sm leading-snug break-words ${
              habit.completed
                ? 'text-slate-400 dark:text-slate-500 line-through decoration-slate-300'
                : 'text-slate-800 dark:text-slate-100'
            }`}
          >
            {habit.title}
          </h3>
        </div>
      </div>

      {/* Footer of card: Time, Reminder Indicator, Habit Badge + Delete or Lock icon */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          {habit.time ? (
            <span className="text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg flex items-center gap-1 font-mono font-medium">
              <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{habit.time}</span>
            </span>
          ) : (
            <span className="text-slate-400 text-[11px]">{t.noTime}</span>
          )}

          {habit.isHabit && (
            <span
              className="text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 px-2 py-0.5 rounded-md flex items-center gap-1 text-[10px] font-semibold"
              title={habit.habitDurationLabel}
            >
              <Repeat className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              <span>{habit.habitDurationLabel || t.habitBadge}</span>
            </span>
          )}

          {habit.reminderEnabled && (
            <span
              title={formatRemainingTimeToTask(habit.date, habit.time, lang)}
              className="text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 px-2 py-0.5 rounded-md flex items-center gap-1 text-[10px] font-semibold"
            >
              <Bell className="w-3 h-3 text-teal-600" />
              <span>{t.reminderBadge} {habit.reminderTime || habit.time}</span>
              {!habit.completed && (
                <span className="opacity-75 font-normal">
                  • {formatRemainingTimeShort(habit.date, habit.time, lang)}
                </span>
              )}
            </span>
          )}
        </div>

        {isPast ? (
          <span
            title={t.pastDaysLocked}
            className="p-1.5 text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center cursor-not-allowed"
            aria-label={t.pastDaysLocked}
          >
            <Lock className="w-3.5 h-3.5" />
          </span>
        ) : (
          <button
            id={`delete-habit-btn-${habit.id}`}
            type="button"
            onClick={() => {
              if (habit.isHabit && habit.habitGroupId && onDeleteGroup) {
                setShowDeleteModal(true);
              } else {
                onDelete(habit.id);
              }
            }}
            title={t.deleteHabit}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
