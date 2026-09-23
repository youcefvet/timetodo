import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  isDateToday,
  isPastDate,
  getTodayDateKey,
  parseDateKey,
  formatToDateKey,
} from '../utils/dateUtils';
import { getLocalizedDateFormatted } from '../utils/localizedDateUtils';
import { ChevronRight, ChevronLeft, Calendar as CalendarIcon, RotateCcw, CheckCircle2, Lock } from 'lucide-react';
import { translations, SupportedLanguage } from '../i18n/translations';

interface DateNavigatorProps {
  selectedDate: string;
  onSelectDate: (dateKey: string) => void;
  getDateStats: (dateKey: string) => { total: number; completed: number; percentage: number };
  lang?: SupportedLanguage;
}

export const DateNavigator: React.FC<DateNavigatorProps> = ({
  selectedDate,
  onSelectDate,
  getDateStats,
  lang = 'ar',
}) => {
  const t = translations[lang];
  const isRtl = lang === 'ar';
  const currentFormatted = getLocalizedDateFormatted(selectedDate, lang);
  const stats = getDateStats(selectedDate);
  const todayKey = getTodayDateKey();

  // Reference for draggable strip
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasMovedRef = useRef(false);
  const [isGrabbed, setIsGrabbed] = useState(false);

  // Dynamic wide list of days: 30 days past and 30 days future around today
  const daysList = useMemo(() => {
    const today = parseDateKey(todayKey);
    const selected = parseDateKey(selectedDate);

    const minDate = new Date(today);
    minDate.setDate(minDate.getDate() - 30);
    if (selected < minDate) {
      minDate.setTime(selected.getTime());
      minDate.setDate(minDate.getDate() - 10);
    }

    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 30);
    if (selected > maxDate) {
      maxDate.setTime(selected.getTime());
      maxDate.setDate(maxDate.getDate() + 10);
    }

    const list: string[] = [];
    const cur = new Date(minDate);
    while (cur <= maxDate) {
      list.push(formatToDateKey(cur));
      cur.setDate(cur.getDate() + 1);
    }
    return list;
  }, [todayKey, selectedDate]);

  // Center selected date on mount or when changed (unless user is actively dragging)
  useEffect(() => {
    if (isDraggingRef.current) return;
    const timer = setTimeout(() => {
      const el = document.getElementById(`date-slot-${selectedDate}`);
      if (el && scrollContainerRef.current) {
        el.scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'nearest',
        });
      }
    }, 60);

    return () => clearTimeout(timer);
  }, [selectedDate]);

  // Handle Mouse Drag on the day boxes container
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollContainerRef.current) return;
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    startXRef.current = e.pageX;
    scrollLeftRef.current = scrollContainerRef.current.scrollLeft;
    setIsGrabbed(true);
  };

  useEffect(() => {
    if (!isGrabbed) return;

    const handleWindowMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !scrollContainerRef.current) return;
      const deltaX = e.pageX - startXRef.current;
      if (Math.abs(deltaX) > 5) {
        hasMovedRef.current = true;
      }
      const move = isRtl ? deltaX : -deltaX;
      scrollContainerRef.current.scrollLeft = scrollLeftRef.current + move;
    };

    const handleWindowMouseUp = () => {
      isDraggingRef.current = false;
      setIsGrabbed(false);
      setTimeout(() => {
        hasMovedRef.current = false;
      }, 80);
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [isGrabbed, isRtl]);

  // Wheel scroll over tape converts vertical wheel to horizontal scroll
  const handleWheel = (e: React.WheelEvent) => {
    if (!scrollContainerRef.current) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      const move = isRtl ? -e.deltaY : e.deltaY;
      scrollContainerRef.current.scrollLeft += move;
    }
  };

  const handleDayClick = (dateKey: string) => {
    if (hasMovedRef.current) {
      return;
    }
    onSelectDate(dateKey);
  };

  const scrollStrip = (direction: 'prev' | 'next') => {
    if (!scrollContainerRef.current) return;
    const amount = 220;
    const move = direction === 'next' ? amount : -amount;
    const signedMove = isRtl ? -move : move;
    scrollContainerRef.current.scrollBy({
      left: signedMove,
      behavior: 'smooth',
    });
  };

  const handlePrevDay = () => {
    const d = parseDateKey(selectedDate);
    d.setDate(d.getDate() - 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    onSelectDate(`${year}-${month}-${day}`);
  };

  const handleNextDay = () => {
    const d = parseDateKey(selectedDate);
    d.setDate(d.getDate() + 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    onSelectDate(`${year}-${month}-${day}`);
  };

  const handleGoToday = () => {
    onSelectDate(todayKey);
  };

  return (
    <div id="date-navigator-container" className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm select-none">
      {/* Top Bar: Date title, navigation buttons, calendar picker, jump to today */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          {/* Day Label */}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {currentFormatted.fullDate}
              </h2>
              {currentFormatted.relativeLabel && (
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold shadow-xs ${
                    currentFormatted.relativeLabel === t.today
                      ? 'bg-emerald-600 text-white animate-pulse'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {currentFormatted.relativeLabel}
                </span>
              )}
              {/* If past date: display ONLY lock symbol with tooltip, NO guiding texts */}
              {isPastDate(selectedDate) && (
                <span
                  title={t.pastDaysLocked}
                  className="p-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-2xs"
                  aria-label={t.pastDaysLocked}
                >
                  <Lock className="w-3.5 h-3.5 stroke-[2]" />
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {stats.total > 0
                ? `${stats.completed} / ${stats.total} ${t.completed} (${stats.percentage}%)`
                : t.noHabitsForDate}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          {/* Back to today button if not today */}
          {selectedDate !== todayKey && (
            <button
              id="back-to-today-btn"
              type="button"
              onClick={handleGoToday}
              className="text-xs font-semibold px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 rounded-xl hover:bg-emerald-100 transition flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.today}</span>
            </button>
          )}

          {/* Calendar Picker Native Input */}
          <div className="relative inline-block">
            <input
              id="calendar-date-picker"
              type="date"
              value={selectedDate}
              onChange={(e) => {
                if (e.target.value) {
                  onSelectDate(e.target.value);
                }
              }}
              className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
              title={t.dateLabel}
            />
            <div className="p-2 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition cursor-pointer flex items-center gap-1.5 text-xs font-medium">
              <CalendarIcon className="w-4 h-4" />
            </div>
          </div>

          {/* Prev/Next Day buttons */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5">
            <button
              id="prev-day-btn"
              type="button"
              onClick={handlePrevDay}
              title={t.yesterday}
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
            </button>
            <button
              id="next-day-btn"
              type="button"
              onClick={handleNextDay}
              title={t.tomorrow}
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
            </button>
          </div>
        </div>
      </div>

      {/* DRAGGABLE Days Strip Container */}
      <div className="relative mt-3 group">
        {/* Nudge Left Button */}
        <button
          type="button"
          onClick={() => scrollStrip('prev')}
          className="hidden md:flex absolute top-1/2 -translate-y-1/2 -start-3 z-10 w-7 h-7 rounded-full bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
          title={isRtl ? 'تمرير للأمام' : 'Scroll left'}
        >
          <ChevronRight className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
        </button>

        {/* The Draggable Strip */}
        <div
          ref={scrollContainerRef}
          id="draggable-days-container"
          onMouseDown={handleMouseDown}
          onWheel={handleWheel}
          className={`flex items-stretch gap-2.5 overflow-x-auto py-2 px-1 scroll-smooth touch-pan-x ${
            isGrabbed ? 'cursor-grabbing select-none' : 'cursor-grab'
          }`}
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {daysList.map((dateKey) => {
            const isToday = isDateToday(dateKey);
            const isPast = isPastDate(dateKey);
            const isSelected = dateKey === selectedDate;
            const parsed = parseDateKey(dateKey);
            const dayName = t.days[parsed.getDay()];
            const dayNum = parsed.getDate();
            const dayStats = getDateStats(dateKey);

            let containerStyles = '';
            if (isToday) {
              if (isSelected) {
                containerStyles =
                  'bg-linear-to-b from-emerald-600 to-teal-700 text-white ring-3 ring-emerald-400/50 shadow-md shadow-emerald-500/20 scale-[1.02] border-emerald-400';
              } else {
                containerStyles =
                  'bg-linear-to-b from-emerald-50 to-teal-50 dark:from-emerald-950/60 dark:to-teal-950/60 border-2 border-emerald-500 text-emerald-900 dark:text-emerald-200 shadow-sm shadow-emerald-500/10 hover:border-emerald-600';
              }
            } else if (isSelected) {
              containerStyles =
                'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 ring-2 ring-slate-400 shadow-sm border-transparent';
            } else {
              containerStyles =
                'bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800';
            }

            return (
              <button
                key={dateKey}
                id={`date-slot-${dateKey}`}
                type="button"
                onClick={() => handleDayClick(dateKey)}
                className={`relative shrink-0 w-16 sm:w-20 py-2.5 px-2 rounded-2xl flex flex-col items-center justify-between transition-all duration-150 select-none ${containerStyles}`}
              >
                {/* Special Today Tag if this cell is today */}
                {isToday && (
                  <span
                    className={`absolute -top-2 px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-tight uppercase shadow-xs ${
                      isSelected
                        ? 'bg-amber-400 text-amber-950 border border-amber-300'
                        : 'bg-emerald-600 text-white ring-1 ring-emerald-300'
                    }`}
                  >
                    {t.today}
                  </span>
                )}

                <span className="text-[11px] font-medium opacity-85 truncate w-full text-center">
                  {dayName}
                </span>

                <span className="text-base sm:text-lg font-bold my-0.5">{dayNum}</span>

                {/* Habit indicator dot / count OR Lock symbol if past day */}
                <div className="flex items-center justify-center gap-1 h-3.5 mt-0.5 w-full">
                  {isPast ? (
                    <div
                      className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500"
                      title={t.pastDaysLocked}
                    >
                      <Lock className="w-3 h-3 shrink-0" />
                      {dayStats.total > 0 && (
                        <span className="opacity-90">{dayStats.completed}/{dayStats.total}</span>
                      )}
                    </div>
                  ) : dayStats.total > 0 ? (
                    <div className="flex items-center gap-1 text-[10px] font-medium">
                      {dayStats.completed === dayStats.total ? (
                        <CheckCircle2
                          className={`w-3 h-3 ${
                            isSelected && isToday
                              ? 'text-amber-300'
                              : isToday
                              ? 'text-emerald-600'
                              : isSelected
                              ? 'text-emerald-400'
                              : 'text-emerald-500'
                          }`}
                        />
                      ) : (
                        <span
                          className={`inline-block w-1.5 h-1.5 rounded-full ${
                            isSelected && isToday
                              ? 'bg-amber-300'
                              : isToday
                              ? 'bg-emerald-500'
                              : isSelected
                              ? 'bg-slate-300'
                              : 'bg-slate-400'
                          }`}
                        />
                      )}
                      <span className="opacity-90">{dayStats.completed}/{dayStats.total}</span>
                    </div>
                  ) : (
                    <span className="text-[10px] opacity-40">-</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Nudge Right Button */}
        <button
          type="button"
          onClick={() => scrollStrip('next')}
          className="hidden md:flex absolute top-1/2 -translate-y-1/2 -end-3 z-10 w-7 h-7 rounded-full bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
          title={isRtl ? 'تمرير للخلف' : 'Scroll right'}
        >
          <ChevronLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
        </button>
      </div>

      {/* Progress Bar for selected date */}
      {stats.total > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${stats.percentage}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 shrink-0">
            {stats.percentage}% {t.todayProgress}
          </span>
        </div>
      )}
    </div>
  );
};
