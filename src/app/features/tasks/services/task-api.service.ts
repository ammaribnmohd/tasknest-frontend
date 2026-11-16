import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task, TaskRequest, TaskStatus } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/tasks';

  getAllTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl);
  }

  getTaskById(id: string): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/${id}`);
  }

  createTask(request: TaskRequest): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, request);
  }

  updateTask(id: string, request: TaskRequest): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${id}`, request);
  }

  updateTaskStatus(id: string, status: TaskStatus): Observable<Task> {
    const params = new HttpParams().set('status', status);
    return this.http.patch<Task>(`${this.apiUrl}/${id}/status`, null, { params });
  }

  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

