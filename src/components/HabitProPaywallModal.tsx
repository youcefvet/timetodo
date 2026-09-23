import React, { useState } from 'react';
import { Crown, Sparkles, Check, X, ShieldCheck, Zap, RefreshCw } from 'lucide-react';
import { translations, SupportedLanguage } from '../i18n/translations';

interface HabitProPaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: (plan: string) => void;
  onRestorePurchases: () => Promise<boolean>;
  lang: SupportedLanguage;
}

export const HabitProPaywallModal: React.FC<HabitProPaywallModalProps> = ({
  isOpen,
  onClose,
  onUpgrade,
  onRestorePurchases,
  lang,
}) => {
  const t = translations[lang];
  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'monthly' | 'lifetime'>('annual');
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoredSuccess, setRestoredSuccess] = useState(false);

  if (!isOpen) return null;

  const handleRestore = async () => {
    setIsRestoring(true);
    try {
      await onRestorePurchases();
      setRestoredSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1200);
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div
      id="habit-pro-paywall-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="habit-pro-paywall-card"
        className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800/80 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative overflow-hidden text-slate-800 dark:text-slate-100 max-h-[90vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          id="close-paywall-modal-btn"
          type="button"
          onClick={onClose}
          className="absolute top-4 end-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          title={t.dismiss}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header Badge */}
        <div className="flex flex-col items-center text-center pt-2 pb-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/25 mb-3.5 ring-4 ring-amber-100 dark:ring-amber-950/50">
            <Crown className="w-7 h-7 stroke-[2.2]" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 font-bold text-xs mb-2 border border-amber-300/60 dark:border-amber-800/60">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>{t.proFeature}</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t.habitMonetizationTitle}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1.5 max-w-md">
            {t.habitMonetizationSubtitle}
          </p>
        </div>

        {/* Value Proposition Points */}
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3.5 border border-slate-200/80 dark:border-slate-800 space-y-2.5 my-3">
          <div className="flex items-start gap-2.5 text-xs sm:text-sm">
            <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <span className="font-medium text-slate-700 dark:text-slate-200">
              {t.habitMonetizationBenefit1}
            </span>
          </div>

          <div className="flex items-start gap-2.5 text-xs sm:text-sm">
            <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <span className="font-medium text-slate-700 dark:text-slate-200">
              {t.habitMonetizationBenefit2}
            </span>
          </div>

          <div className="flex items-start gap-2.5 text-xs sm:text-sm">
            <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <span className="font-medium text-slate-700 dark:text-slate-200">
              {t.habitMonetizationBenefit3}
            </span>
          </div>
        </div>

        {/* Plans Selector */}
        <div className="space-y-2 my-4">
          {/* Annual Plan */}
          <div
            onClick={() => setSelectedPlan('annual')}
            className={`p-3.5 rounded-xl border-2 cursor-pointer transition flex items-center justify-between gap-3 relative ${
              selectedPlan === 'annual'
                ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 shadow-xs'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  selectedPlan === 'annual'
                    ? 'border-amber-600 bg-amber-600 text-white'
                    : 'border-slate-300 dark:border-slate-600'
                }`}
              >
                {selectedPlan === 'annual' && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {t.annualPlan}
                  </span>
                  <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-500 text-white shadow-2xs">
                    Popular
                  </span>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {t.freeTrialNote}
                </span>
              </div>
            </div>
            <div className="text-end">
              <span className="text-base font-bold text-slate-900 dark:text-white font-mono">
                $19.99
              </span>
              <span className="text-[11px] text-slate-500 block">/ سنة</span>
            </div>
          </div>

          {/* Monthly Plan */}
          <div
            onClick={() => setSelectedPlan('monthly')}
            className={`p-3.5 rounded-xl border-2 cursor-pointer transition flex items-center justify-between gap-3 ${
              selectedPlan === 'monthly'
                ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 shadow-xs'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  selectedPlan === 'monthly'
                    ? 'border-amber-600 bg-amber-600 text-white'
                    : 'border-slate-300 dark:border-slate-600'
                }`}
              >
                {selectedPlan === 'monthly' && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
              <div>
                <span className="font-bold text-sm text-slate-900 dark:text-white block">
                  {t.monthlyPlan}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  إلغاء في أي وقت
                </span>
              </div>
            </div>
            <div className="text-end">
              <span className="text-base font-bold text-slate-900 dark:text-white font-mono">
                $2.99
              </span>
              <span className="text-[11px] text-slate-500 block">/ شهر</span>
            </div>
          </div>

          {/* Lifetime Plan */}
          <div
            onClick={() => setSelectedPlan('lifetime')}
            className={`p-3.5 rounded-xl border-2 cursor-pointer transition flex items-center justify-between gap-3 ${
              selectedPlan === 'lifetime'
                ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 shadow-xs'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  selectedPlan === 'lifetime'
                    ? 'border-amber-600 bg-amber-600 text-white'
                    : 'border-slate-300 dark:border-slate-600'
                }`}
              >
                {selectedPlan === 'lifetime' && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
              <div>
                <span className="font-bold text-sm text-slate-900 dark:text-white block">
                  {t.lifetimePlan}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  دفعة واحدة لمدى الحياة
                </span>
              </div>
            </div>
            <div className="text-end">
              <span className="text-base font-bold text-slate-900 dark:text-white font-mono">
                $39.99
              </span>
              <span className="text-[11px] text-slate-500 block">مرة واحدة</span>
            </div>
          </div>
        </div>

        {restoredSuccess && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs flex items-center gap-2 my-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{t.purchasesRestored}</span>
          </div>
        )}

        {/* Action Button: Upgrade */}
        <div className="space-y-2.5 pt-2">
          <button
            id="paywall-upgrade-now-btn"
            type="button"
            onClick={() => onUpgrade(selectedPlan)}
            className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition cursor-pointer"
          >
            <Zap className="w-4 h-4" />
            <span>{t.upgradeToProBtn}</span>
          </button>

          {/* Test Trial Unlock for developer/tester in the app */}
          <button
            id="paywall-test-unlock-btn"
            type="button"
            onClick={() => onUpgrade('developer_preview_trial')}
            className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{t.testUnlockBtn}</span>
          </button>

          {/* Restore purchases */}
          <div className="flex items-center justify-center pt-1">
            <button
              id="paywall-restore-purchases-btn"
              type="button"
              disabled={isRestoring}
              onClick={handleRestore}
              className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline underline-offset-4 flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isRestoring ? 'animate-spin' : ''}`} />
              <span>{t.restorePurchases}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
