import { Task } from '../types';

/**
 * Formats a Date object to ISO string format suitable for Google Calendar (YYYYMMDDTHHmmssZ)
 */
function formatGoogleCalendarDate(date: Date): string {
  return date.toISOString().replace(/-|:|\.\d+/g, '');
}

/**
 * Generates a direct URL to create an event in Google Calendar
 */
export function getGoogleCalendarUrl(task: Task): string {
  const startDate = new Date(task.dueDate);
  const durationMinutes = task.estimatedMinutes || 60;
  const endDate = new Date(startDate.getTime() + durationMinutes * 60000);

  const startStr = formatGoogleCalendarDate(startDate);
  const endStr = formatGoogleCalendarDate(endDate);

  const priorityLabel = task.priority.toUpperCase();
  const title = encodeURIComponent(`[${priorityLabel}] ${task.title}`);
  
  let detailsText = task.description ? `${task.description}\n\n` : '';
  detailsText += `Kategori: ${task.category}\n`;
  detailsText += `Prioritas: ${task.priority}\n`;
  if (task.subtasks && task.subtasks.length > 0) {
    detailsText += `\nSubtugas:\n` + task.subtasks.map(s => `- [${s.completed ? 'x' : ' '}] ${s.title}`).join('\n');
  }
  const details = encodeURIComponent(detailsText);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}&details=${details}`;
}

/**
 * Generates and triggers download of an .ICS file for a single task or array of tasks
 */
export function downloadIcsCalendar(tasks: Task[], filename = 'jadwal-tugas.ics'): void {
  const nowStr = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  
  let icsLines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Productivity Tracker//ID',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Productivity Tracker',
    'X-WR-TIMEZONE:Asia/Jakarta'
  ];

  tasks.forEach((task) => {
    if (!task.dueDate) return;
    const taskDate = new Date(task.dueDate);
    const duration = task.estimatedMinutes || 60;
    const endDate = new Date(taskDate.getTime() + duration * 60000);

    const startFormatted = taskDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endFormatted = endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const subtasksInfo = task.subtasks && task.subtasks.length > 0
      ? '\\nSubtugas: ' + task.subtasks.map(s => `${s.title} (${s.completed ? 'OK' : 'Pending'})`).join(', ')
      : '';

    const desc = `${(task.description || '').replace(/\n/g, '\\n')}\\n[Prioritas: ${task.priority.toUpperCase()} | Kategori: ${task.category}]${subtasksInfo}`;

    icsLines.push(
      'BEGIN:VEVENT',
      `UID:task-${task.id}@productivitytracker.app`,
      `DTSTAMP:${nowStr}`,
      `DTSTART:${startFormatted}`,
      `DTEND:${endFormatted}`,
      `SUMMARY:${task.title.replace(/\n/g, ' ')}`,
      `DESCRIPTION:${desc}`,
      `STATUS:${task.completed ? 'COMPLETED' : 'CONFIRMED'}`,
      `PRIORITY:${task.priority === 'urgent' ? '1' : task.priority === 'high' ? '2' : task.priority === 'medium' ? '5' : '9'}`,
      'BEGIN:VALARM',
      'TRIGGER:-PT15M',
      'ACTION:DISPLAY',
      `DESCRIPTION:Pengingat Tugas: ${task.title.replace(/\n/g, ' ')}`,
      'END:VALARM',
      'END:VEVENT'
    );
  });

  icsLines.push('END:VCALENDAR');

  const icsContent = icsLines.join('\r\n');
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
