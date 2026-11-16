import { Component } from '@angular/core';
import { TaskListViewComponent } from '../../features/tasks/components/task-list-view/task-list-view.component';

@Component({
  selector: 'app-all-tasks-page',
  standalone: true,
  imports: [TaskListViewComponent],
  template: '<app-task-list-view view="all" />'
})
export class AllTasksPage {}

