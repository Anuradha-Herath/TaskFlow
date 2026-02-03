import { Component, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { combineLatest, EMPTY } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { TaskService, Task, TaskStatus, TaskPriority } from '../../../core/services/task.service';
import { ProjectService } from '../../../core/services/project.service';
import { UserService } from '../../../core/services/user.service';
import { EditTaskDialog } from '../edit-task-dialog/edit-task-dialog';

@Component({
  selector: 'app-task-detail',
  imports: [
    RouterLink,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatFormFieldModule,
  ],
  templateUrl: './task-detail.html',
  styleUrl: './task-detail.scss',
})
export class TaskDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private taskService = inject(TaskService);
  private projectService = inject(ProjectService);
  private userService = inject(UserService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private destroyRef = inject(DestroyRef);

  projectId = signal<string | null>(null);
  projectName = signal<string | null>(null);
  task = signal<Task | null>(null);
  usersMap = signal<Record<string, string>>({});
  loading = signal(true);
  error = signal<string | null>(null);

  readonly statusOptions: { value: TaskStatus; label: string }[] = [
    { value: 'todo', label: 'Todo' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'done', label: 'Done' },
  ];

  formatPriority(priority: TaskPriority | undefined): string {
    const map: Record<string, string> = {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      critical: 'Critical',
    };
    return map[priority ?? 'medium'] ?? 'Medium';
  }

  formatDueDate(dueDate: string | null | undefined): string {
    if (!dueDate) return '—';
    const d = new Date(dueDate);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  getAssigneeName(assigneeId: string | null | undefined): string {
    if (!assigneeId) return 'Unassigned';
    return this.usersMap()[assigneeId] ?? assigneeId;
  }

  ngOnInit(): void {
    this.userService
      .getUsers()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((users) => {
        const m: Record<string, string> = {};
        users.forEach((u) => (m[u.id] = u.name));
        this.usersMap.set(m);
      });

    this.route.paramMap
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        map((p) => ({ taskId: p.get('taskId') ?? '', projectId: p.get('projectId') ?? '' })),
        switchMap(({ taskId, projectId }) => {
          if (!taskId || !projectId) return EMPTY;
          this.loading.set(true);
          this.error.set(null);
          return combineLatest([
            this.taskService.getTask(taskId),
            this.projectService.getProject(projectId),
          ]);
        })
      )
      .subscribe({
        next: ([t, proj]) => {
          this.task.set(t);
          this.projectId.set(proj.id);
          this.projectName.set(proj.name);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err?.message ?? 'Failed to load task.');
          this.loading.set(false);
        },
      });
  }

  onStatusChange(newStatus: TaskStatus): void {
    const t = this.task();
    if (!t || t.status === newStatus) return;
    const updated = { ...t, status: newStatus };
    this.taskService.updateTask(updated).subscribe({
      next: (updatedTask) => {
        this.task.set(updatedTask);
        this.snackBar.open('Status updated', 'Close', { duration: 2000 });
      },
      error: () => {
        this.snackBar.open('Failed to update status', 'Close', { duration: 3000 });
      },
    });
  }

  openEdit(): void {
    const t = this.task();
    if (!t) return;
    const ref = this.dialog.open(EditTaskDialog, {
      width: '400px',
      data: { task: { ...t } },
    });
    ref
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((updated) => {
        if (updated) {
          this.taskService.updateTask(updated).subscribe({
            next: (updatedTask) => {
              this.task.set(updatedTask);
              this.snackBar.open('Task updated', 'Close', { duration: 3000 });
            },
            error: () => {
              this.snackBar.open('Failed to update task', 'Close', { duration: 3000 });
            },
          });
        }
      });
  }
}
