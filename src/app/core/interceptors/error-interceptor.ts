import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, tap, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../services/auth.service';
import { ApiStatusService } from '../services/api-status.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);
  const router = inject(Router);
  const authService = inject(AuthService);
  const apiStatus = inject(ApiStatusService);

  return next(req).pipe(
    tap(() => apiStatus.recordSuccess()),
    catchError((err: HttpErrorResponse) => {
      apiStatus.recordFailure();
      const message = err.error?.message ?? err.message ?? 'Something went wrong';
      if (err.status === 401) {
        authService.logout();
        router.navigate(['/login']);
        snackBar.open('Session expired. Please log in again.', 'Close', { duration: 4000 });
      } else if (err.status >= 400 && err.status < 500) {
        snackBar.open(message, 'Close', { duration: 4000 });
      } else if (err.status >= 500) {
        snackBar.open('Server error. Please try again later.', 'Close', { duration: 4000 });
      } else {
        snackBar.open(message, 'Close', { duration: 4000 });
      }
      return throwError(() => err);
    })
  );
};
