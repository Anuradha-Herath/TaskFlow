import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Task, TaskPriority } from '../../../core/services/task.service';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/services/auth.service';

export interface EditTaskDialogData {
  task: Task;
}

@Component({
  selector: 'app-edit-task-dialog',
  imports: [
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './edit-task-dialog.html',
  styleUrl: './edit-task-dialog.scss',
})
export class EditTaskDialog implements OnInit {
  data: EditTaskDialogData | null = inject(MAT_DIALOG_DATA, { optional: true });
  private userService = inject(UserService);

  users = signal<User[]>([]);

  task: Task = this.data?.task ?? {
    id: '',
    projectId: '',
    title: '',
    description: '',
    status: 'todo',
    order: 0,
    createdAt: '',
    priority: 'medium',
    assigneeId: null,
    dueDate: null,
  };

  readonly priorities: { value: TaskPriority; label: string }[] = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' },
  ];

  get taskDueDate(): Date | null {
    return this.task.dueDate ? new Date(this.task.dueDate) : null;
  }
  set taskDueDate(value: Date | null) {
    this.task.dueDate = value ? value.toISOString().slice(0, 10) : null;
  }

  get taskAssigneeIdValue(): string {
    return this.task.assigneeId ?? '';
  }
  set taskAssigneeIdValue(value: string) {
    this.task.assigneeId = value || null;
  }

  ngOnInit(): void {
    this.userService.getUsers().subscribe((list) => this.users.set(list));
  }

  getTask(): Task {
    return { ...this.task };
  }
}
