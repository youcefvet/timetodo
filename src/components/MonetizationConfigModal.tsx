import React from 'react';
import { Settings2, Crown, Check, X, ShieldAlert, Sparkles, ToggleLeft, ToggleRight, Info } from 'lucide-react';
import { translations, SupportedLanguage } from '../i18n/translations';

interface MonetizationConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  isHabitPaywalled: boolean;
  onToggleHabitPaywalled: (isPaid: boolean) => void;
  isProUser: boolean;
  onToggleProUser: () => void;
  lang: SupportedLanguage;
}

export const MonetizationConfigModal: React.FC<MonetizationConfigModalProps> = ({
  isOpen,
  onClose,
  isHabitPaywalled,
  onToggleHabitPaywalled,
  isProUser,
  onToggleProUser,
  lang,
}) => {
  const t = translations[lang];

  if (!isOpen) return null;

  return (
    <div
      id="monetization-config-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="monetization-config-card"
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative text-slate-800 dark:text-slate-100"
      >
        {/* Close Button */}
        <button
          id="close-monetization-config-btn"
          type="button"
          onClick={onClose}
          className="absolute top-4 end-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          title={t.dismiss}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
            <Settings2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {t.monetizationSettingsTitle}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              التحكم في خاصية جعل العادة مدفوعة عند الرفع
            </p>
          </div>
        </div>

        {/* Core Monetization Switch */}
        <div className="my-4 space-y-4">
          <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/50 dark:bg-amber-950/20 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {t.habitFeaturePaidToggle}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  {t.habitFeaturePaidDesc}
                </p>
              </div>

              {/* Toggle Switch */}
              <button
                id="toggle-habit-paywall-setting-btn"
                type="button"
                onClick={() => onToggleHabitPaywalled(!isHabitPaywalled)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isHabitPaywalled ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
                title={isHabitPaywalled ? t.paid : t.free}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    isHabitPaywalled ? 'ltr:translate-x-5 rtl:-translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Current Feature Status Badge */}
            <div className="pt-2 border-t border-amber-200/60 dark:border-amber-800/40 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">{t.featurePaidStatus}:</span>
              <span
                className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                  isHabitPaywalled
                    ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 border border-amber-300/80 dark:border-amber-700'
                    : 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 border border-emerald-300/80 dark:border-emerald-700'
                }`}
              >
                {isHabitPaywalled ? `🔒 ${t.paid}` : `✅ ${t.free}`}
              </span>
            </div>
          </div>

          {/* Test User PRO Status Switcher */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  حالة العضوية الحالية (للاختبار)
                </span>
              </div>
              <button
                id="toggle-test-user-pro-btn"
                type="button"
                onClick={onToggleProUser}
                className="text-xs px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium transition cursor-pointer"
              >
                {isProUser ? 'تبديل إلى مستخدم عادي (Free)' : 'تبديل إلى مشترك (PRO)'}
              </button>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>الحالة:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {isProUser ? '👑 مشترك في النسخة المدفوعة PRO' : 'مستخدم مجاني (غير مشترك)'}
              </span>
            </div>
          </div>

          {/* Deployment Instructions for App Publication */}
          <div className="rounded-xl p-3 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-800/50 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2.5 leading-relaxed">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-0.5">جاهز لرفع التطبيق (App Store / Play Console):</span>
              عند تحزيم التطبيق (Build/Publish)، يمكنك أيضاً تحديد <code className="bg-blue-100 dark:bg-blue-900/60 px-1 py-0.5 rounded font-mono font-bold">VITE_HABIT_FEATURE_PAID=true</code> في ملف البيئة لفرض كونها مدفوعة بشكل دائم لجميع المستخدمين الجدد.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2">
          <button
            id="close-monetization-config-bottom-btn"
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 font-bold text-xs transition cursor-pointer"
          >
            إغلاق وحفظ
          </button>
        </div>
      </div>
    </div>
  );
};
