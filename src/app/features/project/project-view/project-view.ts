import { Component, inject, signal, computed, OnInit, DestroyRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { combineLatest, EMPTY } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ProjectService } from '../../../core/services/project.service';
import { TaskService, Task, TaskStatus, TaskPriority } from '../../../core/services/task.service';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/services/auth.service';
import { AddTaskDialog } from '../add-task-dialog/add-task-dialog';
import { EditTaskDialog } from '../edit-task-dialog/edit-task-dialog';
import { ConfirmDialog } from '../../dashboard/confirm-dialog/confirm-dialog';

const KANBAN_STATUSES: TaskStatus[] = ['todo', 'in_progress', 'done'];

@Component({
  selector: 'app-project-view',
  imports: [
    RouterLink,
    FormsModule,
    DragDropModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './project-view.html',
  styleUrl: './project-view.scss',
})
export class ProjectView implements OnInit {
  private route = inject(ActivatedRoute);
  private projectService = inject(ProjectService);
  private taskService = inject(TaskService);
  private userService = inject(UserService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private destroyRef = inject(DestroyRef);

  projectId = signal<string | null>(null);
  projectName = signal<string | null>(null);
  tasks = signal<Task[]>([]);
  usersMap = signal<Record<string, string>>({});
  usersList = signal<User[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  searchQuery = signal('');
  filterStatus = signal<TaskStatus | ''>('');
  filterPriority = signal<TaskPriority | ''>('');
  filterAssigneeId = signal<string | ''>('');

  readonly kanbanStatuses = KANBAN_STATUSES;

  readonly statusFilterOptions: { value: TaskStatus | ''; label: string }[] = [
    { value: '', label: 'All statuses' },
    { value: 'todo', label: 'Todo' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'done', label: 'Done' },
  ];

  readonly priorityFilterOptions: { value: TaskPriority | ''; label: string }[] = [
    { value: '', label: 'All priorities' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' },
  ];

  filteredTasks = computed(() => {
    const list = this.tasks();
    const q = this.searchQuery().trim().toLowerCase();
    const statusFilter = this.filterStatus();
    const priorityFilter = this.filterPriority();
    const assigneeFilter = this.filterAssigneeId();
    return list.filter((t) => {
      if (q && !t.title.toLowerCase().includes(q) && !(t.description ?? '').toLowerCase().includes(q))
        return false;
      if (statusFilter && t.status !== statusFilter) return false;
      if (priorityFilter && (t.priority ?? 'medium') !== priorityFilter) return false;
      if (assigneeFilter) {
        if (!t.assigneeId || t.assigneeId !== assigneeFilter) return false;
      }
      return true;
    });
  });

  formatPriority(priority: TaskPriority | undefined): string {
    const map: Record<string, string> = {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      critical: 'Critical',
    };
    return map[priority ?? 'medium'] ?? 'Medium';
  }

  formatDueDate(dueDate: string): string {
    const d = new Date(dueDate);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  getAssigneeName(assigneeId: string | null | undefined): string {
    if (!assigneeId) return '';
    return this.usersMap()[assigneeId] ?? '';
  }

  tasksByStatus = (status: TaskStatus): Task[] =>
    this.filteredTasks().filter((t) => t.status === status);

  onTaskDrop(event: CdkDragDrop<Task[], Task | null>): void {
    const task = event.item.data as Task;
    const newStatus = event.container.id as TaskStatus;
    if (!task || task.status === newStatus) return;
    this.updateStatus(task, newStatus);
  }

  ngOnInit(): void {
    this.userService
      .getUsers()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((users) => {
        const map: Record<string, string> = {};
        users.forEach((u) => (map[u.id] = u.name));
        this.usersMap.set(map);
        this.usersList.set(users);
      });

    const projectId$ = this.route.paramMap.pipe(
      map((params) => params.get('id')),
      map((id) => id ?? '')
    );
    projectId$
      .pipe(
        switchMap((id) => {
          if (!id) return EMPTY;
          this.loading.set(true);
          this.error.set(null);
          return combineLatest([
            this.projectService.getProject(id),
            this.taskService.getTasksByProject(id),
          ]);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: ([project, taskList]) => {
          this.projectId.set(project.id);
          this.projectName.set(project.name);
          this.tasks.set(taskList);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err?.message ?? 'Failed to load project. Is the API server running?');
          this.loading.set(false);
        },
      });
  }

  loadData(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.loading.set(true);
    this.error.set(null);
    this.projectService.getProject(id).subscribe({
      next: (project) => {
        this.projectId.set(project.id);
        this.projectName.set(project.name);
      },
      error: (err) => {
        this.error.set(err?.message ?? 'Failed to load.');
        this.loading.set(false);
      },
    });
    this.taskService.getTasksByProject(id).subscribe({
      next: (list) => {
        this.tasks.set(list);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.message ?? 'Failed to load.');
        this.loading.set(false);
      },
    });
  }

  openAddTask(): void {
    const projectId = this.route.snapshot.paramMap.get('id');
    if (!projectId) return;
    const ref = this.dialog.open(AddTaskDialog, { width: '400px' });
    ref
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result?.title) {
          this.taskService
            .createTask(projectId, {
              title: result.title,
              description: result.description,
              priority: result.priority,
              dueDate: result.dueDate ?? null,
              assigneeId: result.assigneeId ?? null,
            })
            .subscribe({
              next: (task) => {
                this.tasks.update((list) => [...list, task]);
                this.snackBar.open('Task added', 'Close', { duration: 3000 });
              },
              error: () => {
                this.error.set('Failed to add task');
                this.snackBar.open('Failed to add task', 'Close', { duration: 3000 });
              },
            });
        }
      });
  }

  openEditTask(task: Task): void {
    const ref = this.dialog.open(EditTaskDialog, {
      width: '400px',
      data: { task: { ...task } },
    });
    ref
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((updated) => {
        if (updated) {
          this.taskService.updateTask(updated).subscribe({
            next: (t) => {
              this.tasks.update((list) =>
                list.map((item) => (item.id === t.id ? t : item))
              );
              this.snackBar.open('Task updated', 'Close', { duration: 3000 });
            },
            error: () => {
              this.error.set('Failed to update task');
              this.snackBar.open('Failed to update task', 'Close', { duration: 3000 });
            },
          });
        }
      });
  }

  updateStatus(task: Task, status: TaskStatus): void {
    const updated = { ...task, status };
    this.taskService.updateTask(updated).subscribe({
      next: (t) => {
        this.tasks.update((list) =>
          list.map((item) => (item.id === t.id ? t : item))
        );
        this.snackBar.open('Status updated', 'Close', { duration: 2000 });
      },
      error: () => {
        this.error.set('Failed to update status');
        this.snackBar.open('Failed to update status', 'Close', { duration: 3000 });
      },
    });
  }

  confirmDeleteTask(task: Task): void {
    const ref = this.dialog.open(ConfirmDialog, {
      width: '400px',
      data: {
        title: 'Delete Task',
        message: `Are you sure you want to delete "${task.title}"?`,
      },
    });
    ref
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed) => {
        if (confirmed) {
          this.taskService.deleteTask(task.id).subscribe({
            next: () => {
              this.tasks.update((list) => list.filter((t) => t.id !== task.id));
              this.snackBar.open('Task deleted', 'Close', { duration: 3000 });
            },
            error: () => {
              this.error.set('Failed to delete task');
              this.snackBar.open('Failed to delete task', 'Close', { duration: 3000 });
            },
          });
        }
      });
  }
}
