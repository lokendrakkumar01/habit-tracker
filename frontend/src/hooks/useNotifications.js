
let activeTimeout = null;
let isScheduled = false;

export function useNotifications() {
  const isSupported = typeof window !== 'undefined' && 'Notification' in window;
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
    try {
      localStorage.setItem('habitflow-reminder-time', time);
      localStorage.setItem('habitflow-reminder-message', message);
      localStorage.setItem('habitflow-reminder-enabled', 'true');
    } catch {}
    scheduleNext(time, message);
  };

  const cancelReminder = () => {
    try {
      localStorage.removeItem('habitflow-reminder-time');
      localStorage.removeItem('habitflow-reminder-message');
      localStorage.setItem('habitflow-reminder-enabled', 'false');
    } catch {}
    if (activeTimeout) {
      clearTimeout(activeTimeout);
      activeTimeout = null;
    }
  };

  const getReminderTime = () => {
    try {
      return localStorage.getItem('habitflow-reminder-time') || '09:00';
    } catch {
      return '09:00';
    }
  };

  const isReminderEnabled = () => {
    try {
      return localStorage.getItem('habitflow-reminder-enabled') === 'true';
    } catch {
      return false;
    }
  };

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
  if (activeTimeout) {
    clearTimeout(activeTimeout);
  }

  const [hours, minutes] = time.split(':').map(Number);
  const now = new Date();
  const next = new Date();
  next.setHours(hours, minutes, 0, 0);

  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }

  const msUntilNext = next - now;
  activeTimeout = setTimeout(() => {
    let enabled = false;
    try {
      enabled = localStorage.getItem('habitflow-reminder-enabled') === 'true';
    } catch {}

    if (enabled) {
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('HabitFlow Reminder 🎯', {
          body: message,
          icon: '/favicon.ico',
        });
      }
      scheduleNext(time, message);
    }
  }, msUntilNext);
}

try {
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    const enabled = localStorage.getItem('habitflow-reminder-enabled') === 'true';
    const time = localStorage.getItem('habitflow-reminder-time');
    const message = localStorage.getItem('habitflow-reminder-message') || "Time to complete your habits! 🎯";
    if (enabled && time && !isScheduled) {
      isScheduled = true;
      scheduleNext(time, message);
    }
  }
} catch {}
