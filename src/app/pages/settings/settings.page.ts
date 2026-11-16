import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TaskStateService } from '../../features/tasks/services/task-state.service';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [FormsModule, ToggleSwitchModule],
  templateUrl: './settings.page.html',
  styleUrl: './settings.page.scss'
})
export class SettingsPage {
  readonly state = inject(TaskStateService);
}

