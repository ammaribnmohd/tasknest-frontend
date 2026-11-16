import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import {
  Task,
  TaskStatus,
  isSameDay,
  isTaskDueToday,
  isTaskOverdue
} from '../../models/task.model';

@Component({
  selector: 'app-task-row',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DatePipe,
    CheckboxModule,
    TagModule,
    ButtonModule,
    TooltipModule
  ],
  templateUrl: './task-row.component.html',
  styleUrl: './task-row.component.scss'
})
export class TaskRowComponent {
  @Input({ required: true }) task!: Task;
  @Input() compact = false;

  @Output() toggleComplete = new EventEmitter<Task>();
  @Output() statusChange = new EventEmitter<{ task: Task; status: TaskStatus }>();
  @Output() edit = new EventEmitter<Task>();
  @Output() delete = new EventEmitter<{ task: Task; event: Event }>();

  get isCompleted(): boolean {
    return this.task.status === 'DONE';
  }

  get isOverdue(): boolean {
    return isTaskOverdue(this.task);
  }

  get isDueToday(): boolean {
    return isTaskDueToday(this.task);
  }

  get isDueTomorrow(): boolean {
    if (!this.task.dueDate) return false;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return isSameDay(new Date(this.task.dueDate), tomorrow);
  }

  get statusLabel(): string {
    switch (this.task.status) {
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'DONE':
        return 'Done';
      default:
        return 'To Do';
    }
  }

  get statusSeverity(): 'secondary' | 'info' | 'success' {
    switch (this.task.status) {
      case 'IN_PROGRESS':
        return 'info';
      case 'DONE':
        return 'success';
      default:
        return 'secondary';
    }
  }

  get priorityLabel(): string {
    switch (this.task.priority) {
      case 'HIGH':
        return 'High';
      case 'LOW':
        return 'Low';
      default:
        return 'Medium';
    }
  }

  get prioritySeverity(): 'danger' | 'warn' | 'secondary' {
    switch (this.task.priority) {
      case 'HIGH':
        return 'danger';
      case 'MEDIUM':
        return 'warn';
      default:
        return 'secondary';
    }
  }

  onCycleStatus(event: Event): void {
    event.stopPropagation();
    const nextMap: Record<TaskStatus, TaskStatus> = {
      TODO: 'IN_PROGRESS',
      IN_PROGRESS: 'DONE',
      DONE: 'TODO'
    };
    this.statusChange.emit({ task: this.task, status: nextMap[this.task.status] });
  }
}
