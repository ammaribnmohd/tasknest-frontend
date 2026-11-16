import { Component, HostListener, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TaskModalComponent } from '../../features/tasks/components/task-modal/task-modal.component';
import { TaskStateService } from '../../features/tasks/services/task-state.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    ButtonModule,
    ToastModule,
    ConfirmDialogModule,
    SidebarComponent,
    TaskModalComponent
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss'
})
export class ShellComponent implements OnInit {
  readonly state = inject(TaskStateService);

  ngOnInit(): void {
    this.state.loadTasks();
  }

  @HostListener('document:keydown', ['$event'])
  onGlobalKeydown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement | null;
    const isInput =
      target?.tagName === 'INPUT' ||
      target?.tagName === 'TEXTAREA' ||
      target?.tagName === 'SELECT' ||
      target?.isContentEditable;

    if (isInput || this.state.isTaskModalOpen()) return;

    if (event.key === 'n' || event.key === 'N') {
      event.preventDefault();
      this.state.openCreateModal();
    }
  }
}

