/**
 * CSV Export utilities for HabitFlow.
 * Uses native Blob + URL.createObjectURL — no library needed.
 */

/**
 * Convert an array of objects to a CSV string.
 */
function toCSV(rows, headers) {
  const headerLine = headers.map((h) => `"${h.label}"`).join(',');
  const dataLines = rows.map((row) =>
    headers
      .map((h) => {
        const val = row[h.key] ?? '';
        return `"${String(val).replace(/"/g, '""')}"`;
      })
      .join(',')
  );
  return [headerLine, ...dataLines].join('\n');
}

/**
 * Trigger a CSV file download in the browser.
 */
function downloadCSV(csvContent, filename) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export habits array to CSV file.
 * @param {Array} habits - Array of habit objects from Redux store.
 * @param {string} filename - Optional filename override.
 */
export function exportHabitsToCSV(habits, filename = 'habitflow_habits.csv') {
  const headers = [
    { key: 'title',            label: 'Title' },
    { key: 'category',         label: 'Category' },
    { key: 'priority',         label: 'Priority' },
    { key: 'frequency',        label: 'Frequency' },
    { key: 'currentStreak',    label: 'Current Streak (days)' },
    { key: 'longestStreak',    label: 'Longest Streak (days)' },
    { key: 'totalCompletions', label: 'Total Completions' },
    { key: 'completionRate',   label: 'Completion Rate (%)' },
    { key: 'createdAt',        label: 'Created Date' },
    { key: 'isArchived',       label: 'Archived' },
  ];

  const rows = habits.map((h) => ({
    ...h,
    createdAt: h.createdAt ? new Date(h.createdAt).toLocaleDateString() : '',
    isArchived: h.isArchived ? 'Yes' : 'No',
  }));

  const csv = toCSV(rows, headers);
  downloadCSV(csv, filename);
}
