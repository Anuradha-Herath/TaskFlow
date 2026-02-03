import { Component, input, output, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-navbar',
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule, RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  userName = input<string | null>(null);
  menuClick = output<void>();
  logoutClick = output<void>();

  userInitial = computed(() => {
    const name = this.userName();
    return name && name.length > 0 ? name.charAt(0).toUpperCase() : '?';
  });

  onLogout(): void {
    this.logoutClick.emit();
  }
}
