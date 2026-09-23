import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY_HABIT_PAID = 'app_habit_feature_is_paid';
const STORAGE_KEY_USER_PRO = 'app_user_is_pro';
const STORAGE_KEY_PRO_PLAN = 'app_user_pro_plan';

export interface MonetizationState {
  isHabitPaywalled: boolean;
  isProUser: boolean;
  proPlan: string | null;
  canUseHabitFeature: boolean;
  isPaywallOpen: boolean;
  isSettingsOpen: boolean;
  setHabitPaywalled: (isPaid: boolean) => void;
  setIsPaywallOpen: (isOpen: boolean) => void;
  setIsSettingsOpen: (isOpen: boolean) => void;
  unlockPro: (plan?: string) => void;
  revokePro: () => void;
  restorePurchases: () => Promise<boolean>;
}

export function useMonetization(): MonetizationState {
  // Whether the habit programming feature is configured as paid
  const [isHabitPaywalled, setIsHabitPaywalledState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HABIT_PAID);
      if (saved !== null) {
        return saved === 'true';
      }
    } catch {
      // fallback
    }
    // Default to true or check env var
    const envVal = (import.meta as unknown as { env?: { VITE_HABIT_FEATURE_PAID?: string } }).env?.VITE_HABIT_FEATURE_PAID;
    return envVal !== undefined ? envVal === 'true' : true;
  });

  // Whether user has PRO status
  const [isProUser, setIsProUserState] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_USER_PRO) === 'true';
    } catch {
      return false;
    }
  });

  const [proPlan, setProPlan] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_PRO_PLAN);
    } catch {
      return null;
    }
  });

  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Sync to storage
  const setHabitPaywalled = useCallback((isPaid: boolean) => {
    setIsHabitPaywalledState(isPaid);
    try {
      localStorage.setItem(STORAGE_KEY_HABIT_PAID, String(isPaid));
    } catch (e) {
      console.error('Failed to save monetization setting', e);
    }
  }, []);

  const unlockPro = useCallback((plan: string = 'pro_annual') => {
    setIsProUserState(true);
    setProPlan(plan);
    try {
      localStorage.setItem(STORAGE_KEY_USER_PRO, 'true');
      localStorage.setItem(STORAGE_KEY_PRO_PLAN, plan);
    } catch (e) {
      console.error('Failed to persist PRO state', e);
    }
    setIsPaywallOpen(false);
  }, []);

  const revokePro = useCallback(() => {
    setIsProUserState(false);
    setProPlan(null);
    try {
      localStorage.setItem(STORAGE_KEY_USER_PRO, 'false');
      localStorage.removeItem(STORAGE_KEY_PRO_PLAN);
    } catch (e) {
      console.error('Failed to revoke PRO state', e);
    }
  }, []);

  const restorePurchases = useCallback(async (): Promise<boolean> => {
    // In actual production app, this connects to RevenueCat, StoreKit, Google Play Billing or Stripe
    await new Promise((resolve) => setTimeout(resolve, 600));
    unlockPro('restored_license');
    return true;
  }, [unlockPro]);

  // Can use feature if it is not paywalled OR if user is Pro
  const canUseHabitFeature = !isHabitPaywalled || isProUser;

  return {
    isHabitPaywalled,
    isProUser,
    proPlan,
    canUseHabitFeature,
    isPaywallOpen,
    isSettingsOpen,
    setHabitPaywalled,
    setIsPaywallOpen,
    setIsSettingsOpen,
    unlockPro,
    revokePro,
    restorePurchases,
  };
}
