import React, { useState, useRef, useEffect } from 'react';
import { SuggestedHabit } from '../types';
import { History, Clock } from 'lucide-react';
import { normalizeArabic } from '../utils/arabicUtils';

interface HabitAutocompleteInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onSelectSuggestion?: (suggestion: SuggestedHabit) => void;
  getSuggestions: (prefix: string) => SuggestedHabit[];
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export const HabitAutocompleteInput: React.FC<HabitAutocompleteInputProps> = ({
  id = 'habit-title-input',
  value,
  onChange,
  onSelectSuggestion,
  getSuggestions,
  placeholder = 'اكتب اسم المهمة...',
  className = '',
  autoFocus = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasTypedCharacter = value.trim().length >= 1;
  const suggestions = hasTypedCharacter ? getSuggestions(value) : [];

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item: SuggestedHabit) => {
    onChange(item.title);
    if (onSelectSuggestion) {
      onSelectSuggestion(item);
    }
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'ArrowDown' && hasTypedCharacter) {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        e.preventDefault();
        handleSelect(suggestions[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const renderHighlightedTitle = (title: string, query: string) => {
    if (!query.trim()) return <span>{title}</span>;

    const normTitle = normalizeArabic(title);
    const normQuery = normalizeArabic(query);
    const matchIndex = normTitle.indexOf(normQuery);

    if (matchIndex === -1) return <span>{title}</span>;

    const before = title.slice(0, matchIndex);
    const match = title.slice(matchIndex, matchIndex + query.length);
    const after = title.slice(matchIndex + query.length);

    return (
      <span>
        {before}
        <mark className="bg-emerald-100 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-100 font-bold px-0.5 rounded">
          {match}
        </mark>
        {after}
      </span>
    );
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <input
        id={id}
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => {
          const nextVal = e.target.value;
          onChange(nextVal);
          if (nextVal.trim().length >= 1) {
            setIsOpen(true);
          } else {
            setIsOpen(false);
          }
          setHighlightedIndex(-1);
        }}
        onFocus={() => {
          if (value.trim().length >= 1) {
            setIsOpen(true);
          }
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={`w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition shadow-sm ${className}`}
      />

      {/* Dropdown Suggestions - only displayed if at least one character typed */}
      {hasTypedCharacter && isOpen && suggestions.length > 0 && (
        <div
          id={`${id}-suggestions-dropdown`}
          className="absolute z-50 w-full mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden"
        >
          <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <History className="w-3 h-3 text-slate-400" />
            <span>مهمات سابقة</span>
          </div>

          <ul className="max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/40">
            {suggestions.map((item, idx) => {
              const isHighlighted = idx === highlightedIndex;

              return (
                <li
                  key={item.title + idx}
                  id={`suggestion-item-${idx}`}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  onClick={() => handleSelect(item)}
                  className={`px-3.5 py-2.5 cursor-pointer flex items-center justify-between gap-3 transition text-sm ${
                    isHighlighted
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-50'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span className="truncate font-medium">
                      {renderHighlightedTitle(item.title, value)}
                    </span>
                  </div>

                  {item.defaultTime && (
                    <span className="text-xs text-slate-400 flex items-center gap-1 shrink-0 font-mono">
                      <Clock className="w-3 h-3" />
                      {item.defaultTime}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};
