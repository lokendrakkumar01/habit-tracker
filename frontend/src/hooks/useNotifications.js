
export function useNotifications() {
  const isSupported = 'Notification' in window;
  const permission = isSupported ? Notification.permission : 'denied';

  const requestPermission = async () => {
    if (!isSupported) return 'denied';
    return await Notification.requestPermission();
  };

  const sendNotification = (title, options = {}) => {
    if (!isSupported || Notification.permission !== 'granted') return;
    new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options,
    });
  };

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

function scheduleNext(time, message) {
  const [hours, minutes] = time.split(':').map(Number);
  const now = new Date();
  const next = new Date();
  next.setHours(hours, minutes, 0, 0);

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
      
      scheduleNext(time, message);
    }
  }, msUntilNext);
}
