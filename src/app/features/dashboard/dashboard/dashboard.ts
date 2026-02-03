import { Component, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProjectService, Project } from '../../../core/services/project.service';
import { AuthService } from '../../../core/services/auth.service';
import { CreateProjectDialog } from '../create-project-dialog/create-project-dialog';
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
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private destroyRef = inject(DestroyRef);

  projects = signal<Project[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.loading.set(true);
    this.error.set(null);
    this.projectService
      .getProjects()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (list) => {
          const userId = this.authService.currentUser()?.id;
          const filtered = userId ? list.filter((p) => p.userId === userId) : list;
          this.projects.set(filtered);
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
