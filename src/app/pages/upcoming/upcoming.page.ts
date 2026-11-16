import { Component } from '@angular/core';
import { TaskListViewComponent } from '../../features/tasks/components/task-list-view/task-list-view.component';

@Component({
  selector: 'app-upcoming-page',
  standalone: true,
  imports: [TaskListViewComponent],
  template: '<app-task-list-view view="upcoming" />'
})
export class UpcomingPage {}

