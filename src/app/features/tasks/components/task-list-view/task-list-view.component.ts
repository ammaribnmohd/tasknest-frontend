import { Component, ElementRef, HostListener, OnInit, ViewChild, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { SelectModule } from 'primeng/select';
import { TabsModule } from 'primeng/tabs';
import { BadgeModule } from 'primeng/badge';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';
import { TaskStateService } from '../../services/task-state.service';
import { TaskRowComponent } from '../task-row/task-row.component';
import { NavViewId, TaskPriority, TaskSortField } from '../../models/task.model';

/** Shared list UI (header, tabs, filters, list). Each page in /pages renders this with its own view. */
@Component({
  selector: 'app-task-list-view',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    SelectModule,
    TabsModule,
    BadgeModule,
    ToggleSwitchModule,
    ToggleButtonModule,
    TooltipModule,
    SkeletonModule,
    TaskRowComponent
  ],
  templateUrl: './task-list-view.component.html',
  styleUrl: './task-list-view.component.scss'
})
export class TaskListViewComponent implements OnInit {
  readonly state = inject(TaskStateService);
  readonly view = input.required<NavViewId>();
  readonly quickTitle = signal<string>('');

  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;

  readonly priorityFilterOptions: { label: string; value: TaskPriority | 'ALL' }[] = [
    { label: 'All Priorities', value: 'ALL' },
    { label: 'High Priority', value: 'HIGH' },
    { label: 'Medium Priority', value: 'MEDIUM' },
    { label: 'Low Priority', value: 'LOW' }
  ];

  readonly sortOptions: { label: string; value: TaskSortField }[] = [
    { label: 'Created Date', value: 'createdAt' },
    { label: 'Due Date', value: 'dueDate' },
    { label: 'Priority', value: 'priority' },
    { label: 'Alphabetical', value: 'title' }
  ];

  ngOnInit(): void {
    this.state.selectView(this.view());
  }

  @HostListener('document:keydown', ['$event'])
  onSearchShortcut(event: KeyboardEvent): void {
    const target = event.target as HTMLElement | null;
    const isInput =
      target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.tagName === 'SELECT';
    if (isInput || this.state.isTaskModalOpen()) return;

    if (event.key === '/') {
      event.preventDefault();
      this.searchInput?.nativeElement.focus();
    }
  }

  onQuickAddSubmit(): void {
    const title = this.quickTitle().trim();
    if (!title) return;
    this.state.quickCreateTask(title, () => this.quickTitle.set(''));
  }

  get isAscending(): boolean {
    return this.state.sortDirection() === 'asc';
  }

  onSortDirectionToggle(asc: boolean): void {
    this.state.sortDirection.set(asc ? 'asc' : 'desc');
  }

  get hasActiveFilters(): boolean {
    return (
      this.state.searchQuery().trim().length > 0 ||
      (this.state.statusFilter() !== 'ALL' && this.state.activeView() !== 'completed') ||
      this.state.priorityFilter() !== 'ALL' ||
      this.state.overdueOnlyFilter()
    );
  }
}

