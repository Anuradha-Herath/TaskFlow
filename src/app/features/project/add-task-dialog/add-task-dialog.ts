import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { TaskPriority } from '../../../core/services/task.service';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/services/auth.service';

@Component({
  selector: 'app-add-task-dialog',
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
  templateUrl: './add-task-dialog.html',
  styleUrl: './add-task-dialog.scss',
})
export class AddTaskDialog implements OnInit {
  private userService = inject(UserService);

  title = '';
  description = '';
  priority: TaskPriority = 'medium';
  dueDate: Date | null = null;
  assigneeIdValue = ''; // '' means unassigned; component maps to assigneeId: null

  users = signal<User[]>([]);

  readonly priorities: { value: TaskPriority; label: string }[] = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' },
  ];

  ngOnInit(): void {
    this.userService.getUsers().subscribe((list) => this.users.set(list));
  }

  getResult(): {
    title: string;
    description: string;
    priority: TaskPriority;
    dueDate: string | null;
    assigneeId: string | null;
  } {
    return {
      title: this.title.trim(),
      description: this.description.trim(),
      priority: this.priority,
      dueDate: this.dueDate ? this.dueDate.toISOString().slice(0, 10) : null,
      assigneeId: this.assigneeIdValue || null,
    };
  }
}
