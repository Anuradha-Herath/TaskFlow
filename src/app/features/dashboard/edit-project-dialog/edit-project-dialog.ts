import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Project } from '../../../core/services/project.service';

export interface EditProjectDialogData {
  project: Project;
}

@Component({
  selector: 'app-edit-project-dialog',
  imports: [
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './edit-project-dialog.html',
  styleUrl: './edit-project-dialog.scss',
})
export class EditProjectDialog {
  data: EditProjectDialogData | null = inject(MAT_DIALOG_DATA, { optional: true });
  project: Project = this.data?.project ?? {
    id: '',
    name: '',
    userId: '',
    createdAt: '',
  };
}
