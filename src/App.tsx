import React, { useState, useMemo } from 'react';
import { useHabits } from './hooks/useHabits';
import { useMonetization } from './hooks/useMonetization';
import { Header } from './components/Header';
import { DateNavigator } from './components/DateNavigator';
import { DateHabitInputBox } from './components/DateHabitInputBox';
import { HabitsScrollView } from './components/HabitsScrollView';
import { HabitProPaywallModal } from './components/HabitProPaywallModal';
import { MonetizationConfigModal } from './components/MonetizationConfigModal';
import { getTodayDateKey } from './utils/dateUtils';

export default function App() {
  const {
    selectedDate,
    setSelectedDate,
    dateHabits,
    allHabits,
    inAppNotifications,
    currentLang,
    handleLanguageChange,
    addHabit,
    addHabitSchedule,
    toggleHabit,
    deleteHabit,
    deleteHabitGroup,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    dismissInAppNotification,
    clearAllNotifications,
    getSuggestionsForPrefix,
    getDateStats,
  } = useHabits();

  const {
    isHabitPaywalled,
    isProUser,
    isPaywallOpen,
    isSettingsOpen,
    setHabitPaywalled,
    setIsPaywallOpen,
    setIsSettingsOpen,
    unlockPro,
    revokePro,
    restorePurchases,
  } = useMonetization();

  // Controls whether the input box is expanded when clicking on date
  const [showInputBox, setShowInputBox] = useState(true);

  // Notification center visibility toggle (descending dropdown from notification button)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const todayKey = getTodayDateKey();
  const todayStats = getDateStats(todayKey);

  // Count of unread notifications for the bell badge
  const unseenCount = useMemo(() => {
    return inAppNotifications.filter((n) => !n.read).length;
  }, [inAppNotifications]);

  const hasUnseenBadge = unseenCount > 0;

  // When dropdown opens or closes
  const handleToggleNotifications = () => {
    setIsNotificationsOpen((prev) => !prev);
  };

  const handleCloseNotifications = () => {
    setIsNotificationsOpen(false);
  };

  // When date is clicked/selected from navigator
  const handleSelectDate = (dateKey: string) => {
    setSelectedDate(dateKey);
    setShowInputBox(true);
  };

  const handleAddHabit = (data: {
    title: string;
    time?: string;
    reminderEnabled?: boolean;
    reminderTime?: string;
    reminderOffsetMinutes?: number;
    reminderTriggerTimestamp?: number;
  }) => {
    addHabit({
      title: data.title,
      time: data.time,
      date: selectedDate,
      completed: false,
      reminderEnabled: data.reminderEnabled,
      reminderTime: data.reminderTime,
      reminderOffsetMinutes: data.reminderOffsetMinutes,
      reminderTriggerTimestamp: data.reminderTriggerTimestamp,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      {/* Top Application Header with Unified Single Notification Button & Descending Dropdown */}
      <Header
        todayCompletedCount={todayStats.completed}
        todayTotalCount={todayStats.total}
        totalAlertsCount={unseenCount}
        hasUnseenBadge={hasUnseenBadge}
        isNotificationsOpen={isNotificationsOpen}
        onToggleNotifications={handleToggleNotifications}
        onCloseNotifications={handleCloseNotifications}
        notifications={inAppNotifications}
        onDismissAlert={dismissInAppNotification}
        onClearAllAlerts={clearAllNotifications}
        onMarkAsRead={markNotificationAsRead}
        onMarkAllAsRead={markAllNotificationsAsRead}
        onCompleteHabit={(habitId) => toggleHabit(habitId)}
        currentLang={currentLang}
        onLanguageChange={handleLanguageChange}
        isProUser={isProUser}
        isHabitPaywalled={isHabitPaywalled}
        onOpenPaywall={() => setIsPaywallOpen(true)}
        onOpenMonetizationConfig={() => setIsSettingsOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Date Navigator with Today's Special Color */}
        <DateNavigator
          selectedDate={selectedDate}
          onSelectDate={handleSelectDate}
          getDateStats={getDateStats}
          lang={currentLang}
        />

        {/* Input box that appears when clicking on date */}
        {showInputBox && (
          <DateHabitInputBox
            selectedDate={selectedDate}
            onAddHabit={handleAddHabit}
            onAddHabitSchedule={addHabitSchedule}
            getSuggestions={getSuggestionsForPrefix}
            onClose={() => setShowInputBox(false)}
            lang={currentLang}
            isHabitPaywalled={isHabitPaywalled}
            isProUser={isProUser}
            onRequestPaywall={() => setIsPaywallOpen(true)}
          />
        )}

        {/* Habits Scroll Strip */}
        <HabitsScrollView
          habits={dateHabits}
          onToggleHabit={toggleHabit}
          onDeleteHabit={deleteHabit}
          onDeleteHabitGroup={deleteHabitGroup}
          lang={currentLang}
        />
      </main>

      {/* Paywall Modal for Transforming Task to Habit */}
      <HabitProPaywallModal
        isOpen={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
        onUpgrade={(plan) => unlockPro(plan)}
        onRestorePurchases={restorePurchases}
        lang={currentLang}
      />

      {/* Monetization & Feature Deployment Settings Modal */}
      <MonetizationConfigModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isHabitPaywalled={isHabitPaywalled}
        onToggleHabitPaywalled={setHabitPaywalled}
        isProUser={isProUser}
        onToggleProUser={() => {
          if (isProUser) revokePro();
          else unlockPro('test_user');
        }}
        lang={currentLang}
      />
    </div>
  );
}

