import { Component, inject, computed, signal, OnInit, DestroyRef } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Sidebar } from '../../../shared/sidebar/sidebar/sidebar';
import { Navbar } from '../../../shared/navbar/navbar/navbar';
import { AuthService } from '../../services/auth.service';
import { ApiStatusService } from '../../services/api-status.service';

@Component({
  selector: 'app-main-layout',
  imports: [MatSidenavModule, MatButtonModule, MatIconModule, RouterOutlet, Sidebar, Navbar],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout implements OnInit {
  private auth: AuthService = inject(AuthService);
  private apiStatus: ApiStatusService = inject(ApiStatusService);
  private breakpoint = inject(BreakpointObserver);
  private destroyRef = inject(DestroyRef);

  userName = computed(() => this.auth.currentUser()?.name ?? null);
  apiUnavailable = this.apiStatus.apiUnavailable;
  sidenavMode = signal<'side' | 'over'>('side');
  sidenavOpened = signal(true);

  toggleSidenav(): void {
    this.sidenavOpened.update((v) => !v);
  }

  ngOnInit(): void {
    this.breakpoint
      .observe([Breakpoints.Handset, Breakpoints.TabletPortrait])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        const isSmall = result.matches;
        this.sidenavMode.set(isSmall ? 'over' : 'side');
        this.sidenavOpened.set(!isSmall);
      });
  }

  onLogout(): void {
    this.auth.logout();
  }

  dismissApiBanner(): void {
    this.apiStatus.dismiss();
  }
}
