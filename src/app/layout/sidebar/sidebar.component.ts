import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { DrawerModule } from 'primeng/drawer';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TaskStateService } from '../../features/tasks/services/task-state.service';
import { TaskPriority } from '../../features/tasks/models/task.model';
import { AuthService } from '../../core/services/auth.service';

export interface NavItemConfig {
  route: string;
  label: string;
  icon: string;
  countKey: 'inbox' | 'today' | 'upcoming' | 'all' | 'completed';
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    RouterLinkActive,
    ButtonModule,
    TooltipModule,
    DrawerModule,
    ToggleSwitchModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  readonly state = inject(TaskStateService);
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);

  readonly navItems: NavItemConfig[] = [
    { route: '/inbox', label: 'Inbox', icon: 'pi pi-inbox', countKey: 'inbox' },
    { route: '/today', label: 'Today', icon: 'pi pi-calendar', countKey: 'today' },
    { route: '/upcoming', label: 'Upcoming', icon: 'pi pi-calendar-plus', countKey: 'upcoming' },
    { route: '/all', label: 'All Tasks', icon: 'pi pi-list', countKey: 'all' },
    { route: '/completed', label: 'Completed', icon: 'pi pi-check-circle', countKey: 'completed' }
  ];

  readonly priorities: { value: TaskPriority; label: string; dotClass: string }[] = [
    { value: 'HIGH', label: 'High Priority', dotClass: 'high' },
    { value: 'MEDIUM', label: 'Medium Priority', dotClass: 'medium' },
    { value: 'LOW', label: 'Low Priority', dotClass: 'low' }
  ];

  togglePriority(priority: TaskPriority): void {
    const current = this.state.priorityFilter();
    this.state.priorityFilter.set(current === priority ? 'ALL' : priority);
  }

  getCount(key: NavItemConfig['countKey']): number {
    return this.state.viewCounts()[key];
  }

  closeMobile(): void {
    this.state.isSidebarOpenMobile.set(false);
  }

  logout(): void {
    this.confirmationService.confirm({
      header: 'Sign Out',
      message: 'Are you sure you want to sign out of your account?',
      icon: 'pi pi-sign-out',
      acceptButtonProps: {
        label: 'Sign Out',
        severity: 'danger',
        icon: 'pi pi-sign-out'
      },
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true
      },
      accept: () => {
        this.auth.logout().subscribe(() => {
          this.closeMobile();
          this.router.navigate(['/login']);
        });
      }
    });
  }

  getUserInitials(): string {
    const user = this.auth.currentUser();
    if (!user || !user.fullName) return 'U';
    const parts = user.fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  }
}
