import React, { useRef } from 'react';
import { HabitItem } from '../types';
import { HabitCard } from './HabitCard';
import { ChevronRight, ChevronLeft, CheckCircle2, Lock } from 'lucide-react';
import { translations, SupportedLanguage } from '../i18n/translations';
import { isPastDate } from '../utils/dateUtils';

interface HabitsScrollViewProps {
  habits: HabitItem[];
  onToggleHabit: (id: string) => void;
  onDeleteHabit: (id: string) => void;
  onDeleteHabitGroup?: (groupId: string) => void;
  lang?: SupportedLanguage;
}

export const HabitsScrollView: React.FC<HabitsScrollViewProps> = ({
  habits,
  onToggleHabit,
  onDeleteHabit,
  onDeleteHabitGroup,
  lang = 'ar',
}) => {
  const t = translations[lang];
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const completedCount = habits.filter((h) => h.completed).length;
  const isPast = habits.length > 0 && isPastDate(habits[0].date);

  return (
    <div id="habits-scroll-section" className="space-y-3">
      {/* Scroll controls and count */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 flex-wrap text-xs font-bold text-slate-700 dark:text-slate-300">
          <span>{t.habitsStrip} ({habits.length})</span>
          {habits.length > 0 && (
            <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {completedCount} {t.completed}
            </span>
          )}
          {isPast && (
            <span
              title={t.pastDaysLocked}
              className="p-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-2xs"
              aria-label={t.pastDaysLocked}
            >
              <Lock className="w-3.5 h-3.5 stroke-[2]" />
            </span>
          )}
        </div>

        {habits.length > 1 && (
          <div className="flex items-center gap-1">
            <button
              id="scroll-strip-right-btn"
              type="button"
              onClick={() => scroll('right')}
              title={t.scrollToRight}
              className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              id="scroll-strip-left-btn"
              type="button"
              onClick={() => scroll('left')}
              title={t.scrollToLeft}
              className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Horizontal Scroll Strip */}
      {habits.length > 0 ? (
        <div
          ref={scrollRef}
          id="habits-horizontal-scroll"
          className="flex items-stretch gap-3.5 overflow-x-auto pb-4 pt-1 px-1 scroll-smooth snap-x snap-mandatory"
          style={{ scrollbarWidth: 'thin' }}
        >
          {habits.map((habit) => (
            <div key={habit.id} className="snap-start shrink-0">
              <HabitCard
                habit={habit}
                onToggle={onToggleHabit}
                onDelete={onDeleteHabit}
                onDeleteGroup={onDeleteHabitGroup}
                lang={lang}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-xs text-slate-400">
          {t.noHabitsForDate}
        </div>
      )}
    </div>
  );
};
