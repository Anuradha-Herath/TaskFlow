import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Project {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/projects`;

  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(this.apiUrl);
  }

  getProject(id: string): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/${id}`);
  }

  createProject(name: string): Observable<Project> {
    const user = this.getStoredUserId();
    return this.http.post<Project>(this.apiUrl, {
      name,
      userId: user ?? 'user-1',
      createdAt: new Date().toISOString(),
    });
  }

  updateProject(id: string, payload: { name: string }): Observable<Project> {
    return this.http.patch<Project>(`${this.apiUrl}/${id}`, payload);
  }

  deleteProject(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  private getStoredUserId(): string | null {
    try {
      const raw = localStorage.getItem('taskflow_user');
      const user = raw ? JSON.parse(raw) : null;
      return user?.id ?? null;
    } catch {
      return null;
    }
  }
}
