import { Task } from '../types';

const TASKS_KEY = 'simple-tasks-data-v2';

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