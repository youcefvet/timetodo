import React from 'react';
import { AppNotification } from '../types';
import { Bell, X, Check, Clock, Calendar, CheckCheck } from 'lucide-react';
import { translations, SupportedLanguage } from '../i18n/translations';
import { formatRemainingTimeToTask } from '../utils/notificationUtils';

interface NotificationCenterProps {
  notifications: AppNotification[];
  onDismissAlert: (id: string) => void;
  onClearAllAlerts: () => void;
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onCompleteHabit?: (habitId: string) => void;
  onClose?: () => void;
  lang?: SupportedLanguage;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onDismissAlert,
  onClearAllAlerts,
  onMarkAsRead,
  onMarkAllAsRead,
  onCompleteHabit,
  onClose,
  lang = 'ar',
}) => {
  const t = translations[lang];
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div
      id="unified-notification-dropdown"
      className="absolute top-full mt-2 left-0 rtl:left-0 ltr:left-0 w-[calc(100vw-2rem)] max-w-sm sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xl space-y-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
    >
      {/* Dropdown Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5 text-xs">
        <div className="flex items-center gap-2">
          <span className={`p-1.5 rounded-lg ${unreadCount > 0 ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
            <Bell className="w-4 h-4" />
          </span>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
              {t.remindersAndNotifications}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {unreadCount > 0
                ? `${unreadCount} ${t.unreadNotifications}`
                : `${notifications.length} ${t.completed}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {unreadCount > 0 && onMarkAllAsRead && (
            <button
              id="mark-all-notifications-seen-btn"
              type="button"
              onClick={onMarkAllAsRead}
              className="text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 flex items-center gap-1 cursor-pointer transition px-2 py-1 rounded-md text-[11px] font-semibold"
              title={t.markAllAsSeen}
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>{t.markAllAsSeen}</span>
            </button>
          )}

          {notifications.length > 0 && onClearAllAlerts && (
            <button
              id="clear-all-notifications-btn"
              type="button"
              onClick={onClearAllAlerts}
              className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1.5 rounded-lg transition cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-medium"
              title={t.clearAll}
            >
              {t.clearAll}
            </button>
          )}

          {onClose && (
            <button
              id="close-notification-dropdown-btn"
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
              title={t.dismiss}
              aria-label={t.dismiss}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Notifications list: remains visible even after viewing */}
      {notifications.length === 0 ? (
        <div className="py-8 text-center text-xs flex flex-col items-center gap-2.5">
          <div className="w-11 h-11 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
            <Bell className="w-5 h-5 stroke-[1.75]" />
          </div>
          <div className="space-y-1">
            <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">
              {t.noUnreadNotifications}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              {t.allNotificationsSeen}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {notifications.map((item) => {
            const isRead = Boolean(item.read);
            const remainingText =
              item.explanatoryMessage ||
              formatRemainingTimeToTask(item.habitDate, item.habitTime, lang);

            return (
              <div
                key={item.id}
                id={`notification-item-${item.id}`}
                className={`rounded-xl p-3 border text-xs transition select-none shadow-xs ${
                  isRead
                    ? 'bg-slate-50/90 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    : 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700/80 hover:border-amber-400'
                }`}
              >
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    {/* Icon badge */}
                    <div
                      className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                        isRead
                          ? 'bg-slate-200/60 dark:bg-slate-700/60 text-slate-500 dark:text-slate-400'
                          : 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300'
                      }`}
                    >
                      <Bell className="w-4 h-4" />
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded ${
                            isRead
                              ? 'bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                              : 'bg-amber-200/90 dark:bg-amber-900/80 text-amber-950 dark:text-amber-200'
                          }`}
                        >
                          {t.notificationDueTitle}
                        </span>

                        {isRead && (
                          <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/50 px-1.5 py-0.2 rounded flex items-center gap-1">
                            <CheckCheck className="w-2.5 h-2.5" />
                            {t.markAsSeen}
                          </span>
                        )}

                        {item.habitTime && (
                          <span className="text-[10px] font-mono bg-white/90 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.2 rounded flex items-center gap-1 border border-slate-200/60 dark:border-slate-700">
                            <Clock className="w-2.5 h-2.5" />
                            {item.habitTime}
                          </span>
                        )}
                      </div>

                      <p className={`font-bold mt-1 text-xs truncate ${isRead ? 'text-slate-800 dark:text-slate-200' : 'text-slate-900 dark:text-slate-100'}`}>
                        {item.habitTitle}
                      </p>

                      {/* Explicit Remaining Time until task */}
                      {remainingText && (
                        <div
                          className={`mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                            isRead
                              ? 'bg-slate-200/60 dark:bg-slate-700/60 text-slate-600 dark:text-slate-400'
                              : 'bg-amber-100/90 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200'
                          }`}
                        >
                          <Clock className="w-3 h-3 shrink-0" />
                          <span className="truncate">{remainingText}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-2.5 h-2.5" />
                          {item.habitDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div
                    className="flex flex-col sm:flex-row items-end sm:items-center gap-1 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {onCompleteHabit && (
                      <button
                        type="button"
                        onClick={() => {
                          onCompleteHabit(item.habitId);
                          if (onMarkAsRead) {
                            onMarkAsRead(item.id);
                          }
                        }}
                        className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1 transition shadow-xs cursor-pointer"
                        title={t.markDone}
                      >
                        <Check className="w-3 h-3" />
                        <span>{t.markDone}</span>
                      </button>
                    )}

                    {!isRead ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (onMarkAsRead) {
                            onMarkAsRead(item.id);
                          }
                        }}
                        className="px-2 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] font-medium transition cursor-pointer flex items-center gap-1"
                        title={t.markAsSeen}
                      >
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>{t.markAsSeen}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onDismissAlert(item.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition hover:bg-slate-200/50 dark:hover:bg-slate-700/50 cursor-pointer"
                        title={t.dismiss}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
