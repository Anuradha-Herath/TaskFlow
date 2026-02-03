import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile {
  private auth = inject(AuthService);

  user = computed(() => this.auth.currentUser());
}
