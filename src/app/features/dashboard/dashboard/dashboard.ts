import { Component, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { ProjectService, Project } from '../../../core/services/project.service';
import { TaskService, Task } from '../../../core/services/task.service';
import { AuthService } from '../../../core/services/auth.service';

export interface ProjectTaskCounts {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
  overdue: number;
}
import { CreateProjectDialog } from '../create-project-dialog/create-project-dialog';
import { EditProjectDialog } from '../edit-project-dialog/edit-project-dialog';
import { ConfirmDialog } from '../confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-dashboard',
  imports: [
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private projectService = inject(ProjectService);
  private taskService = inject(TaskService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private destroyRef = inject(DestroyRef);

  projects = signal<Project[]>([]);
  allTasks = signal<Task[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  summary = signal<ProjectTaskCounts>({
    total: 0,
    todo: 0,
    inProgress: 0,
    done: 0,
    overdue: 0,
  });

  getProjectCounts(projectId: string): ProjectTaskCounts {
    const tasks = this.allTasks().filter((t) => t.projectId === projectId);
    const today = new Date().toISOString().slice(0, 10);
    return {
      total: tasks.length,
      todo: tasks.filter((t) => t.status === 'todo').length,
      inProgress: tasks.filter((t) => t.status === 'in_progress').length,
      done: tasks.filter((t) => t.status === 'done').length,
      overdue: tasks.filter((t) => t.dueDate && t.dueDate < today && t.status !== 'done').length,
    };
  }

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.loading.set(true);
    this.error.set(null);
    const userId = this.authService.currentUser()?.id;
    combineLatest([
      this.projectService.getProjects().pipe(
        map((list) => (userId ? list.filter((p) => p.userId === userId) : list))
      ),
      this.taskService.getTasks(),
    ])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ([projectList, taskList]) => {
          this.projects.set(projectList);
          this.allTasks.set(taskList);
          const userProjectIds = new Set(projectList.map((p) => p.id));
          const userTasks = taskList.filter((t) => userProjectIds.has(t.projectId));
          const today = new Date().toISOString().slice(0, 10);
          this.summary.set({
            total: userTasks.length,
            todo: userTasks.filter((t) => t.status === 'todo').length,
            inProgress: userTasks.filter((t) => t.status === 'in_progress').length,
            done: userTasks.filter((t) => t.status === 'done').length,
            overdue: userTasks.filter((t) => t.dueDate && t.dueDate < today && t.status !== 'done').length,
          });
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err?.message ?? 'Failed to load projects. Is the API server running?');
          this.loading.set(false);
        },
      });
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(CreateProjectDialog, {
      width: '400px',
    });
    ref
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((name) => {
        if (name) {
          this.projectService.createProject(name).subscribe({
            next: () => {
              this.loadProjects();
              this.snackBar.open('Project created', 'Close', { duration: 3000 });
            },
            error: () => {
              this.error.set('Failed to create project');
              this.snackBar.open('Failed to create project', 'Close', { duration: 3000 });
            },
          });
        }
      });
  }

  openEditDialog(project: Project): void {
    const ref = this.dialog.open(EditProjectDialog, {
      width: '400px',
      data: { project: { ...project } },
    });
    ref
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result?.id && result?.name) {
          this.projectService.updateProject(result.id, { name: result.name }).subscribe({
            next: () => {
              this.loadProjects();
              this.snackBar.open('Project updated', 'Close', { duration: 3000 });
            },
            error: () => {
              this.error.set('Failed to update project');
              this.snackBar.open('Failed to update project', 'Close', { duration: 3000 });
            },
          });
        }
      });
  }

  confirmDelete(project: Project): void {
    const ref = this.dialog.open(ConfirmDialog, {
      width: '400px',
      data: {
        title: 'Delete Project',
        message: `Are you sure you want to delete "${project.name}"? This will delete all tasks in the project.`,
      },
    });
    ref
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed) => {
        if (confirmed) {
          this.projectService.deleteProject(project.id).subscribe({
            next: () => {
              this.loadProjects();
              this.snackBar.open('Project deleted', 'Close', { duration: 3000 });
            },
            error: () => {
              this.error.set('Failed to delete project');
              this.snackBar.open('Failed to delete project', 'Close', { duration: 3000 });
            },
          });
        }
      });
  }
}
