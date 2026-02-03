import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { Task } from '../../../core/services/task.service';

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
  ],
  templateUrl: './edit-task-dialog.html',
  styleUrl: './edit-task-dialog.scss',
})
export class EditTaskDialog {
  data: EditTaskDialogData | null = inject(MAT_DIALOG_DATA, { optional: true });
  task: Task = this.data?.task ?? {
    id: '',
    projectId: '',
    title: '',
    description: '',
    status: 'todo',
    order: 0,
    createdAt: '',
  };
}
