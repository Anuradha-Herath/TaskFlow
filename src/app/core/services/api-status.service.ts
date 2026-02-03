import { Injectable, signal, computed } from '@angular/core';

const FAILURE_THRESHOLD = 2;

@Injectable({ providedIn: 'root' })
export class ApiStatusService {
  private readonly consecutiveFailures = signal(0);
  private readonly dismissed = signal(false);

  apiUnavailable = computed(
    () => this.consecutiveFailures() >= FAILURE_THRESHOLD && !this.dismissed()
  );

  recordSuccess(): void {
    this.consecutiveFailures.set(0);
  }

  recordFailure(): void {
    this.consecutiveFailures.update((n) => n + 1);
  }

  dismiss(): void {
    this.dismissed.set(true);
    this.consecutiveFailures.set(0);
  }

  resetDismissed(): void {
    this.dismissed.set(false);
  }
}
