import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  order: number;
  createdAt: string;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  status?: TaskStatus;
}

@Injectable({ providedIn: 'root' })
export class TaskService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/tasks`;

  getTasksByProject(projectId: string): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl, {
      params: { projectId },
    });
  }

  createTask(projectId: string, dto: CreateTaskDto): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, {
      projectId,
      title: dto.title,
      description: dto.description ?? '',
      status: dto.status ?? 'todo',
      order: 0,
      createdAt: new Date().toISOString(),
    });
  }

  updateTask(task: Task): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${task.id}`, task);
  }

  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
