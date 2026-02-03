import { Component, input, output, computed } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-navbar',
  imports: [MatToolbarModule, MatButtonModule, MatIconModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  userName = input<string | null>(null);
  menuClick = output<void>();

  userInitial = computed(() => {
    const name = this.userName();
    return name && name.length > 0 ? name.charAt(0).toUpperCase() : '?';
  });
}
