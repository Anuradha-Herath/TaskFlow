import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of, tap, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

const TOKEN_KEY = 'taskflow_token';
const USER_KEY = 'taskflow_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly token = signal<string | null>(this.getStoredToken());
  private readonly user = signal<User | null>(this.getStoredUser());

  currentUser = this.user.asReadonly();
  isAuthenticated = computed(() => !!this.token());

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  getToken(): string | null {
    return this.token();
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/login`, { email, password })
      .pipe(
        tap((res) => this.setSession(res)),
        catchError(() => {
          const res = this.createFakeAuthResponse(email, password);
          this.setSession(res);
          return of(res);
        })
      );
  }

  register(name: string, email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/register`, { name, email, password })
      .pipe(
        tap((res) => this.setSession(res)),
        catchError(() => {
          const res = this.createFakeAuthResponse(email, password, name);
          this.setSession(res);
          return of(res);
        })
      );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.token.set(null);
    this.user.set(null);
    this.router.navigate(['/login']);
  }

  private setSession(res: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    this.token.set(res.token);
    this.user.set(res.user);
  }

  private getStoredToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private getStoredUser(): User | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  private createFakeAuthResponse(
    email: string,
    _password: string,
    name?: string
  ): AuthResponse {
    const user: User = {
      id: `user-${Date.now()}`,
      name: name ?? email.split('@')[0],
      email,
    };
    const token = `fake-jwt-${btoa(JSON.stringify(user))}`;
    return { token, user };
  }
}
