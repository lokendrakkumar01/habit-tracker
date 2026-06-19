/**
  Custom hook for browser Notification API.
 Handles permission request and scheduling daily reminders.
 */
export function useNotifications() {
  const isSupported = 'Notification' in window;
  const permission = isSupported ? Notification.permission : 'denied';

  /**
   Request notification permission from user.
   Returns: 'granted' | 'denied' | 'default'
   */
  const requestPermission = async () => {
    if (!isSupported) return 'denied';
    return await Notification.requestPermission();
  };

  /**
   * Send a browser notification immediately.
   */
  const sendNotification = (title, options = {}) => {
    if (!isSupported || Notification.permission !== 'granted') return;
    new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options,
    });
  };

  /**
   * Schedule a daily reminder at a specific time (HH:MM string).
   * Saves to localStorage so it persists across reloads.
   * Uses a polling approach via setTimeout.
   */
  const scheduleDailyReminder = (time, message = "Time to complete your habits! 🎯") => {
    if (!isSupported || Notification.permission !== 'granted') return;
    localStorage.setItem('habitflow-reminder-time', time);
    localStorage.setItem('habitflow-reminder-message', message);
    localStorage.setItem('habitflow-reminder-enabled', 'true');
    scheduleNext(time, message);
  };

  const cancelReminder = () => {
    localStorage.removeItem('habitflow-reminder-time');
    localStorage.removeItem('habitflow-reminder-message');
    localStorage.setItem('habitflow-reminder-enabled', 'false');
  };

  const getReminderTime = () => localStorage.getItem('habitflow-reminder-time') || '09:00';
  const isReminderEnabled = () => localStorage.getItem('habitflow-reminder-enabled') === 'true';

  return {
    isSupported,
    permission,
    requestPermission,
    sendNotification,
    scheduleDailyReminder,
    cancelReminder,
    getReminderTime,
    isReminderEnabled,
  };
}

/**
 * Schedule the next occurrence of the reminder.
 * Called recursively to re-schedule every day.
 */
function scheduleNext(time, message) {
  const [hours, minutes] = time.split(':').map(Number);
  const now = new Date();
  const next = new Date();
  next.setHours(hours, minutes, 0, 0);

  // If the time has already passed today, schedule for tomorrow
  if (next <= now) next.setDate(next.getDate() + 1);

  const msUntilNext = next - now;
  setTimeout(() => {
    if (localStorage.getItem('habitflow-reminder-enabled') === 'true') {
      if (Notification.permission === 'granted') {
        new Notification('HabitFlow Reminder 🎯', {
          body: message,
          icon: '/favicon.ico',
        });
      }
      // Schedule next day
      scheduleNext(time, message);
    }
  }, msUntilNext);
}
