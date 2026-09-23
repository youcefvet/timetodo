import React, { useState } from 'react';
import { CheckCheck, Bell, Globe, Crown } from 'lucide-react';
import { requestNotificationPermission, isNotificationSupported } from '../utils/notificationUtils';
import { translations, SupportedLanguage, SUPPORTED_LANGUAGES } from '../i18n/translations';
import { NotificationCenter } from './NotificationCenter';
import { AppNotification, HabitItem } from '../types';

interface HeaderProps {
  todayCompletedCount: number;
  todayTotalCount: number;
  totalAlertsCount: number; // Count of unseen notifications
  hasUnseenBadge: boolean; // Controls whether badge appears on button
  isNotificationsOpen?: boolean;
  onToggleNotifications?: () => void;
  onCloseNotifications?: () => void;
  notifications: AppNotification[];
  onDismissAlert: (id: string) => void;
  onClearAllAlerts: () => void;
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onCompleteHabit?: (habitId: string) => void;
  currentLang: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  isProUser?: boolean;
  isHabitPaywalled?: boolean;
  onOpenPaywall?: () => void;
  onOpenMonetizationConfig?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  todayCompletedCount,
  todayTotalCount,
  totalAlertsCount,
  hasUnseenBadge,
  isNotificationsOpen = false,
  onToggleNotifications,
  onCloseNotifications,
  notifications,
  onDismissAlert,
  onClearAllAlerts,
  onMarkAsRead,
  onMarkAllAsRead,
  onCompleteHabit,
  currentLang,
  onLanguageChange,
  isProUser = false,
  isHabitPaywalled = false,
  onOpenPaywall,
  onOpenMonetizationConfig,
}) => {
  const t = translations[currentLang];
  const [showLangMenu, setShowLangMenu] = useState(false);

  // Automatically request permission if user clicks and it's not granted
  const handleBellClick = async () => {
    if (isNotificationSupported() && Notification.permission === 'default') {
      try {
        await requestNotificationPermission();
      } catch {
        // ignore
      }
    }
    if (onToggleNotifications) {
      onToggleNotifications();
    }
  };

  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === currentLang) || SUPPORTED_LANGUAGES[0];

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-30 shadow-xs">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        {/* Brand / App Icon without adjacent text */}
        <div className="flex items-center">
          <img
            id="app-brand-icon"
            src="/icon.jpg"
            alt="App Icon"
            referrerPolicy="no-referrer"
            className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 select-none"
          />
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Monetization / PRO Badge & Setting Button */}
          <div className="flex items-center gap-1.5">
            {isProUser ? (
              <button
                id="pro-status-badge-btn"
                type="button"
                onClick={onOpenMonetizationConfig}
                className="px-2.5 py-1.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/80 text-amber-900 dark:text-amber-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                title={t.proSubscribed}
              >
                <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>{t.proBadge}</span>
              </button>
            ) : isHabitPaywalled ? (
              <button
                id="open-paywall-header-btn"
                type="button"
                onClick={onOpenPaywall}
                className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                title={t.habitMonetizationTitle}
              >
                <Crown className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{t.proBadge}</span>
              </button>
            ) : null}

            {/* Quick config button to control whether habit feature is paid when deploying */}
            <button
              id="monetization-config-header-btn"
              type="button"
              onClick={onOpenMonetizationConfig}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs transition cursor-pointer"
              title={t.monetizationSettingsTitle}
            >
              <Crown className="w-4 h-4 text-amber-500" />
            </button>
          </div>

          {/* Today's completion stats */}
          <div className="flex items-center gap-1.5 text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-3 py-1.5 rounded-full border border-emerald-200/60 shrink-0">
            <CheckCheck className="w-4 h-4" />
            <span>{todayCompletedCount}/{todayTotalCount}</span>
          </div>

          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              id="language-switcher-btn"
              type="button"
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              title={t.changeLanguage}
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{currentLangObj.flag}</span>
              <span className="hidden sm:inline">{currentLangObj.nativeName}</span>
            </button>

            {showLangMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowLangMenu(false)}
                />
                <div
                  id="language-dropdown-menu"
                  className="absolute right-0 ltr:right-0 rtl:left-0 rtl:right-auto mt-2 w-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        onLanguageChange(lang.code);
                        setShowLangMenu(false);
                      }}
                      className={`w-full px-3.5 py-2 text-xs flex items-center justify-between transition cursor-pointer ${
                        currentLang === lang.code
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-sm">{lang.flag}</span>
                        <span>{lang.nativeName}</span>
                      </span>
                      {currentLang === lang.code && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Unified single button shared for Reminders & Notifications - Positioned at the Far Left */}
          <div className="relative">
            <button
              id="notification-bell-toggle-btn"
              type="button"
              onClick={handleBellClick}
              className={`relative p-2 rounded-xl border transition cursor-pointer flex items-center justify-center ${
                isNotificationsOpen
                  ? 'bg-amber-100 dark:bg-amber-900/60 border-amber-400 dark:border-amber-700 text-amber-900 dark:text-amber-200 shadow-xs'
                  : hasUnseenBadge
                  ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 hover:bg-amber-100'
                  : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
              title={t.remindersAndNotifications}
              aria-label={t.remindersAndNotifications}
            >
              <Bell
                className={`w-4 h-4 ${
                  hasUnseenBadge && !isNotificationsOpen
                    ? 'animate-bounce text-amber-600 dark:text-amber-400'
                    : ''
                }`}
              />
              {/* The alert badge disappears when dropdown is opened or acknowledged */}
              {hasUnseenBadge && (
                <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 text-[10px] font-bold bg-amber-600 text-white rounded-full min-w-4 text-center">
                  {totalAlertsCount}
                </span>
              )}
            </button>

            {/* Dropdown menu that descends directly from the button */}
            {isNotificationsOpen && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-transparent"
                  onClick={onCloseNotifications}
                />
                <NotificationCenter
                  notifications={notifications}
                  onDismissAlert={onDismissAlert}
                  onClearAllAlerts={onClearAllAlerts}
                  onMarkAsRead={onMarkAsRead}
                  onMarkAllAsRead={onMarkAllAsRead}
                  onCompleteHabit={onCompleteHabit}
                  onClose={onCloseNotifications}
                  lang={currentLang}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
