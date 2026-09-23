export interface HabitItem {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm (optional, e.g. "07:00")
  completed: boolean;
  createdAt: number;
  reminderEnabled?: boolean;
  reminderTime?: string; // HH:mm or full timestamp ISO string
  reminderOffsetMinutes?: number; // duration between reminder and habit time in minutes
  reminderTriggerTimestamp?: number; // exact timestamp in ms when reminder should fire
  notified?: boolean; // whether notification was already shown
  isHabit?: boolean; // Indicates this task was programmed as a recurring habit
  habitGroupId?: string; // Group identifier for the habit series
  habitDurationLabel?: string; // Human-friendly duration label (e.g. "لمدة 30 يوماً")
  habitDaysOfWeek?: number[]; // Days of the week this habit repeats on (0=Sun, 1=Mon, ..., 6=Sat)
}

export interface HabitScheduleOptions {
  isHabit: boolean;
  durationDays: number;
  selectedDaysOfWeek: number[]; // e.g. [0, 1, 2, 3, 4, 5, 6]
  durationLabel: string;
}

export interface SuggestedHabit {
  title: string;
  defaultTime?: string;
  usageCount: number;
  lastUsed?: number;
}

export interface AppNotification {
  id: string;
  habitId: string;
  habitTitle: string;
  habitDate: string;
  habitTime?: string;
  timestamp: number;
  read: boolean;
  explanatoryMessage?: string; // Clear explanatory message shown with the notification
}
