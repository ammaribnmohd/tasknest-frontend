import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TaskApiService } from './task-api.service';
import { applyTheme } from '../../../core/config/theme.service';
import {
  ApiError,
  NavViewId,
  PRIORITY_WEIGHT,
  SortDirection,
  Task,
  TaskPriority,
  TaskRequest,
  TaskSortField,
  TaskStatus,
  isTaskDueToday,
  isTaskOverdue,
  isTaskUpcoming
} from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskStateService {
  private readonly api = inject(TaskApiService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  // Core Data Signals
  readonly tasks = signal<Task[]>([]);
  readonly loading = signal<boolean>(false);
  readonly submitting = signal<boolean>(false);
  readonly apiError = signal<string | null>(null);
  readonly validationErrors = signal<Record<string, string>>({});

  // Navigation & View Filtering Signals
  readonly activeView = signal<NavViewId>('inbox');
  readonly searchQuery = signal<string>('');
  readonly statusFilter = signal<TaskStatus | 'ALL'>('ALL');
  readonly priorityFilter = signal<TaskPriority | 'ALL'>('ALL');
  readonly overdueOnlyFilter = signal<boolean>(false);
  readonly sortBy = signal<TaskSortField>('createdAt');
  readonly sortDirection = signal<SortDirection>('desc');

  // Genuine User Preferences (Controlled by PrimeNG ToggleSwitches)
  readonly isSidebarCollapsed = signal<boolean>(false);
  readonly isDarkMode = signal<boolean>(false);
  readonly showCompletedInViews = signal<boolean>(false);
  readonly compactDensity = signal<boolean>(false);

  // UI Dialog & Drawer State
  readonly isSidebarOpenMobile = signal<boolean>(false);
  readonly isTaskModalOpen = signal<boolean>(false);
  readonly editingTask = signal<Task | null>(null);

  // Computed Counts for Sidebar & Tabs
  readonly viewCounts = computed(() => {
    const all = this.tasks();
    const now = new Date();
    const active = all.filter(t => t.status !== 'DONE');

    return {
      inbox: active.length,
      today: active.filter(t => isTaskDueToday(t, now) || isTaskOverdue(t, now)).length,
      upcoming: active.filter(t => isTaskUpcoming(t, now)).length,
      all: all.length,
      completed: all.filter(t => t.status === 'DONE').length,
      overdue: active.filter(t => isTaskOverdue(t, now)).length,
      todo: all.filter(t => t.status === 'TODO').length,
      inProgress: all.filter(t => t.status === 'IN_PROGRESS').length
    };
  });

  // Contextual metadata for the active view header
  readonly activeViewMeta = computed(() => {
    const view = this.activeView();
    switch (view) {
      case 'inbox':
        return {
          title: 'Inbox',
          subtitle: 'Active tasks requiring your attention',
          icon: 'pi pi-inbox'
        };
      case 'today':
        return {
          title: 'Today',
          subtitle: 'Tasks due today and overdue items',
          icon: 'pi pi-calendar'
        };
      case 'upcoming':
        return {
          title: 'Upcoming',
          subtitle: 'Scheduled tasks with future deadlines',
          icon: 'pi pi-calendar-plus'
        };
      case 'completed':
        return {
          title: 'Completed',
          subtitle: 'Finished tasks and accomplishments',
          icon: 'pi pi-check-circle'
        };
      case 'all':
      default:
        return {
          title: 'All Tasks',
          subtitle: 'Complete workspace archive across every status',
          icon: 'pi pi-list'
        };
    }
  });

  // Base tasks for the currently selected sidebar navigation view (used to compute accurate Tab counts)
  readonly currentViewBaseTasks = computed(() => {
    const list = this.tasks();
    const view = this.activeView();
    const includeDone = this.showCompletedInViews();
    const now = new Date();

    return list.filter(task => {
      if (view === 'inbox') {
        if (!includeDone && task.status === 'DONE') return false;
      } else if (view === 'today') {
        if (task.status === 'DONE' && !includeDone) return false;
        if (!isTaskDueToday(task, now) && !isTaskOverdue(task, now)) return false;
      } else if (view === 'upcoming') {
        if (task.status === 'DONE' && !includeDone) return false;
        if (!isTaskUpcoming(task, now)) return false;
      } else if (view === 'completed') {
        if (task.status !== 'DONE') return false;
      }
      return true;
    });
  });

  // Tab counts scoped to the current view
  readonly tabCounts = computed(() => {
    const base = this.currentViewBaseTasks();
    return {
      ALL: base.length,
      TODO: base.filter(t => t.status === 'TODO').length,
      IN_PROGRESS: base.filter(t => t.status === 'IN_PROGRESS').length,
      DONE: this.tasks().filter(t => t.status === 'DONE').length
    };
  });

  // Computed Filtered & Sorted Task List
  readonly visibleTasks = computed(() => {
    const base = this.currentViewBaseTasks();
    const allTasks = this.tasks();
    const view = this.activeView();
    const query = this.searchQuery().trim().toLowerCase();
    const status = this.statusFilter();
    const priority = this.priorityFilter();
    const overdueOnly = this.overdueOnlyFilter();
    const sortField = this.sortBy();
    const direction = this.sortDirection();
    const now = new Date();

    // If user explicitly selects the DONE tab while in another view, show completed tasks
    const sourceList = status === 'DONE' && view !== 'completed' ? allTasks.filter(t => t.status === 'DONE') : base;

    const filtered = sourceList.filter(task => {
      if (status !== 'ALL' && task.status !== status) {
        return false;
      }

      if (priority !== 'ALL' && task.priority !== priority) {
        return false;
      }

      if (overdueOnly && !isTaskOverdue(task, now)) {
        return false;
      }

      if (query.length > 0) {
        const inTitle = task.title.toLowerCase().includes(query);
        const inDesc = task.description ? task.description.toLowerCase().includes(query) : false;
        if (!inTitle && !inDesc) return false;
      }

      return true;
    });

    const factor = direction === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (sortField === 'priority') {
        const diff = PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority];
        if (diff !== 0) return diff * factor;
      } else if (sortField === 'dueDate') {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        const diff = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        if (diff !== 0) return diff * factor;
      } else if (sortField === 'title') {
        const diff = a.title.localeCompare(b.title);
        if (diff !== 0) return diff * factor;
      }

      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return (timeA - timeB) * factor;
    });
  });

  constructor() {
    this.restorePreferences();
  }

  private restorePreferences(): void {
    try {
      const savedTheme = localStorage.getItem('taskflow-theme');
      this.applyDarkMode(savedTheme === 'dark');

      const savedCollapsed = localStorage.getItem('taskflow-sidebar-collapsed');
      if (savedCollapsed === 'true') {
        this.isSidebarCollapsed.set(true);
      }

      const savedShowCompleted = localStorage.getItem('taskflow-show-completed');
      if (savedShowCompleted === 'true') {
        this.showCompletedInViews.set(true);
      }

      const savedCompact = localStorage.getItem('taskflow-compact');
      if (savedCompact === 'true') {
        this.compactDensity.set(true);
      }
    } catch {
      // Ignore storage access errors
    }
  }

  setDarkMode(enabled: boolean): void {
    this.applyDarkMode(enabled);
    try {
      localStorage.setItem('taskflow-theme', enabled ? 'dark' : 'light');
    } catch {}
  }

  toggleTheme(): void {
    this.setDarkMode(!this.isDarkMode());
  }

  private applyDarkMode(enabled: boolean): void {
    this.isDarkMode.set(enabled);
    applyTheme(enabled ? 'dark' : 'light');
  }

  toggleSidebarCollapsed(): void {
    const next = !this.isSidebarCollapsed();
    this.isSidebarCollapsed.set(next);
    try {
      localStorage.setItem('taskflow-sidebar-collapsed', String(next));
    } catch {}
  }

  setShowCompletedInViews(enabled: boolean): void {
    this.showCompletedInViews.set(enabled);
    try {
      localStorage.setItem('taskflow-show-completed', String(enabled));
    } catch {}
  }

  setCompactDensity(enabled: boolean): void {
    this.compactDensity.set(enabled);
    try {
      localStorage.setItem('taskflow-compact', String(enabled));
    } catch {}
  }

  selectView(view: NavViewId): void {
    this.activeView.set(view);
    if (view === 'completed') {
      this.statusFilter.set('DONE');
    } else {
      this.statusFilter.set('ALL');
    }
    this.isSidebarOpenMobile.set(false);
  }

  setStatusTab(tabValue: string | number | undefined): void {
    if (!tabValue) return;
    const status = String(tabValue) as TaskStatus | 'ALL';
    this.statusFilter.set(status);
    if (status === 'DONE' && this.activeView() === 'completed') {
      return;
    }
  }

  loadTasks(): void {
    this.loading.set(true);
    this.apiError.set(null);

    this.api.getAllTasks().subscribe({
      next: tasks => {
        this.tasks.set(tasks);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.handleHttpError(err, 'Unable to reach the Taskflow server at localhost:8080.');
      }
    });
  }

  openCreateModal(): void {
    this.editingTask.set(null);
    this.validationErrors.set({});
    this.apiError.set(null);
    this.isTaskModalOpen.set(true);
  }

  openEditModal(task: Task): void {
    this.editingTask.set(task);
    this.validationErrors.set({});
    this.apiError.set(null);
    this.isTaskModalOpen.set(true);
  }

  closeTaskModal(): void {
    this.isTaskModalOpen.set(false);
    this.editingTask.set(null);
    this.validationErrors.set({});
  }

  saveTask(payload: TaskRequest, onSuccess?: () => void): void {
    this.submitting.set(true);
    this.validationErrors.set({});
    this.apiError.set(null);

    const existing = this.editingTask();

    if (existing) {
      this.api.updateTask(existing.id, payload).subscribe({
        next: updated => {
          this.tasks.update(list => list.map(t => (t.id === existing.id ? updated : t)));
          this.submitting.set(false);
          this.closeTaskModal();
          this.notify('success', 'Task Updated', `"${updated.title}" has been saved.`);
          onSuccess?.();
        },
        error: (err: HttpErrorResponse) => {
          this.submitting.set(false);
          this.handleHttpError(err, 'Could not update task');
        }
      });
    } else {
      this.api.createTask(payload).subscribe({
        next: created => {
          this.tasks.update(list => [created, ...list]);
          this.submitting.set(false);
          this.closeTaskModal();
          this.notify('success', 'Task Created', `"${created.title}" added to your tasks.`);
          onSuccess?.();
        },
        error: (err: HttpErrorResponse) => {
          this.submitting.set(false);
          this.handleHttpError(err, 'Could not create task');
        }
      });
    }
  }

  quickCreateTask(title: string, onSuccess?: () => void): void {
    const trimmed = title.trim();
    if (!trimmed) return;

    const now = new Date();
    const isTodayView = this.activeView() === 'today';

    const payload: TaskRequest = {
      title: trimmed,
      description: null,
      status: 'TODO',
      priority: 'MEDIUM',
      dueDate: isTodayView ? now.toISOString() : null
    };

    this.submitting.set(true);
    this.api.createTask(payload).subscribe({
      next: created => {
        this.tasks.update(list => [created, ...list]);
        this.submitting.set(false);
        this.notify('success', 'Task Added', `"${created.title}" added to ${isTodayView ? 'Today' : 'Inbox'}.`);
        onSuccess?.();
      },
      error: (err: HttpErrorResponse) => {
        this.submitting.set(false);
        this.handleHttpError(err, 'Could not create task');
      }
    });
  }

  toggleComplete(task: Task): void {
    const nextStatus: TaskStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
    this.changeTaskStatus(task, nextStatus);
  }

  changeTaskStatus(task: Task, status: TaskStatus): void {
    if (task.status === status) return;

    this.api.updateTaskStatus(task.id, status).subscribe({
      next: updated => {
        this.tasks.update(list => list.map(t => (t.id === task.id ? updated : t)));
        const summary =
          status === 'DONE'
            ? 'Task Completed'
            : status === 'IN_PROGRESS'
              ? 'Moved to In Progress'
              : 'Task Reopened';
        this.notify('info', summary, `"${updated.title}"`);
      },
      error: (err: HttpErrorResponse) => {
        this.handleHttpError(err, 'Failed to update task status');
      }
    });
  }

  requestDelete(task: Task, event?: Event): void {
    this.confirmationService.confirm({
      target: event?.target as EventTarget,
      header: 'Delete Task',
      message: `Are you sure you want to permanently delete "${task.title}"? This action cannot be undone.`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: {
        label: 'Delete Task',
        severity: 'danger',
        icon: 'pi pi-trash'
      },
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true
      },
      accept: () => {
        this.executeDelete(task);
      }
    });
  }

  private executeDelete(task: Task): void {
    this.submitting.set(true);
    this.api.deleteTask(task.id).subscribe({
      next: () => {
        this.tasks.update(list => list.filter(t => t.id !== task.id));
        this.submitting.set(false);
        if (this.editingTask()?.id === task.id) {
          this.closeTaskModal();
        }
        this.notify('info', 'Task Deleted', `"${task.title}" was removed.`);
      },
      error: (err: HttpErrorResponse) => {
        this.submitting.set(false);
        this.handleHttpError(err, 'Failed to delete task');
      }
    });
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.statusFilter.set(this.activeView() === 'completed' ? 'DONE' : 'ALL');
    this.priorityFilter.set('ALL');
    this.overdueOnlyFilter.set(false);
  }

  private notify(severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string): void {
    this.messageService.add({
      severity,
      summary,
      detail,
      life: 3000
    });
  }

  private handleHttpError(err: HttpErrorResponse, fallbackMessage: string): void {
    const apiErr = err.error as ApiError | undefined;
    if (apiErr && apiErr.message) {
      this.apiError.set(apiErr.message);
      if (apiErr.validationErrors) {
        this.validationErrors.set(apiErr.validationErrors);
      }
      this.notify('error', apiErr.error || 'Error', apiErr.message);
    } else {
      this.apiError.set(fallbackMessage);
      this.notify('error', 'Connection Error', fallbackMessage);
    }
  }
}
