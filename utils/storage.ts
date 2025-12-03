import { Task, AppSettings } from '../types';

const TASKS_KEY = 'simple-tasks-data-v2';
const SETTINGS_KEY = 'simple-tasks-settings';

export const loadTasks = (): Task[] => {
  try {
    const stored = localStorage.getItem(TASKS_KEY);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    // Backward compatibility & Default values
    return parsed.map((t: any) => ({
      ...t,
      subtasks: t.subtasks || [],
      attachments: t.attachments || [],
      priority: t.priority || 'medium',
      category: t.category || 'Other'
    }));
  } catch (error) {
    console.error("Failed to load tasks", error);
    return [];
  }
};

export const saveTasks = (tasks: Task[]): void => {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error("Failed to save tasks", error);
  }
};

export const loadSettings = (): AppSettings => {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    return stored ? JSON.parse(stored) : { darkMode: false };
  } catch {
    return { darkMode: false };
  }
};

export const saveSettings = (settings: AppSettings): void => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  // Apply theme immediately
  if (settings.darkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};