import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { TaskStateService } from '../../services/task-state.service';
import { TaskPriority, TaskRequest, TaskStatus } from '../../models/task.model';

export interface SelectOption<T> {
  label: string;
  value: T;
  icon: string;
}

@Component({
  selector: 'app-task-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    DatePickerModule,
    ButtonModule,
    MessageModule
  ],
  templateUrl: './task-modal.component.html',
  styleUrl: './task-modal.component.scss'
})
export class TaskModalComponent {
  readonly state = inject(TaskStateService);
  private readonly fb = inject(FormBuilder);

  readonly statusOptions: SelectOption<TaskStatus>[] = [
    { label: 'To Do', value: 'TODO', icon: 'pi pi-circle' },
    { label: 'In Progress', value: 'IN_PROGRESS', icon: 'pi pi-spinner' },
    { label: 'Done', value: 'DONE', icon: 'pi pi-check-circle' }
  ];

  readonly priorityOptions: SelectOption<TaskPriority>[] = [
    { label: 'Low Priority', value: 'LOW', icon: 'pi pi-arrow-down' },
    { label: 'Medium Priority', value: 'MEDIUM', icon: 'pi pi-minus' },
    { label: 'High Priority', value: 'HIGH', icon: 'pi pi-arrow-up' }
  ];

  readonly form = this.fb.group({
    title: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(100)]),
    description: this.fb.nonNullable.control('', [Validators.maxLength(500)]),
    status: this.fb.nonNullable.control<TaskStatus>('TODO'),
    priority: this.fb.nonNullable.control<TaskPriority>('MEDIUM'),
    dueDate: this.fb.control<Date | null>(null)
  });

  constructor() {
    effect(() => {
      const isOpen = this.state.isTaskModalOpen();
      const editing = this.state.editingTask();

      if (isOpen) {
        if (editing) {
          this.form.reset({
            title: editing.title,
            description: editing.description ?? '',
            status: editing.status,
            priority: editing.priority,
            dueDate: editing.dueDate ? new Date(editing.dueDate) : null
          });
        } else {
          const defaultToday = this.state.activeView() === 'today';
          const todayDate = new Date();
          todayDate.setHours(18, 0, 0, 0);

          this.form.reset({
            title: '',
            description: '',
            status: 'TODO',
            priority: 'MEDIUM',
            dueDate: defaultToday ? todayDate : null
          });
        }
      }
    });
  }

  setQuickDue(daysOffset: number | null): void {
    if (daysOffset === null) {
      this.form.controls.dueDate.setValue(null);
      this.form.markAsDirty();
      return;
    }
    const target = new Date();
    target.setDate(target.getDate() + daysOffset);
    target.setHours(18, 0, 0, 0);
    this.form.controls.dueDate.setValue(target);
    this.form.markAsDirty();
  }

  onVisibleChange(visible: boolean): void {
    if (!visible) {
      this.requestClose();
    }
  }

  requestClose(): void {
    if (this.state.submitting()) return;
    if (this.form.dirty && this.form.controls.title.value.trim().length > 0) {
      const discard = window.confirm('Discard unsaved changes to this task?');
      if (!discard) return;
    }
    this.state.closeTaskModal();
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.state.submitting()) return;

    const raw = this.form.getRawValue();
    const payload: TaskRequest = {
      title: raw.title.trim(),
      description: raw.description.trim() || null,
      status: raw.status,
      priority: raw.priority,
      dueDate: raw.dueDate ? raw.dueDate.toISOString() : null
    };

    this.state.saveTask(payload);
  }
}
