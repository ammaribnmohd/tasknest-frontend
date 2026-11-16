export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export type NavViewId = 'inbox' | 'today' | 'upcoming' | 'all' | 'completed';
export type TaskSortField = 'dueDate' | 'priority' | 'createdAt' | 'title';
export type SortDirection = 'asc' | 'desc';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskRequest {
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
}

export interface ApiError {
  status: number;
  error: string;
  message: string;
  timestamp: string;
  validationErrors?: Record<string, string> | null;
}

export interface ToastMessage {
  id: number;
  type: 'success' | 'error' | 'info';
  text: string;
}

export const PRIORITY_WEIGHT: Record<TaskPriority, number> = {
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1
};

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isTaskOverdue(task: Task, now: Date = new Date()): boolean {
  if (!task.dueDate || task.status === 'DONE') return false;
  const due = new Date(task.dueDate);
  return due.getTime() < now.getTime() && !isSameDay(due, now);
}

export function isTaskDueToday(task: Task, now: Date = new Date()): boolean {
  if (!task.dueDate) return false;
  return isSameDay(new Date(task.dueDate), now);
}

export function isTaskUpcoming(task: Task, now: Date = new Date()): boolean {
  if (!task.dueDate || task.status === 'DONE') return false;
  const due = new Date(task.dueDate);
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  return due.getTime() > endOfToday.getTime();
}
