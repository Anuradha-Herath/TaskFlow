import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { authGuard } from './auth-guard';
import { AuthService } from '../services/auth.service';

describe('authGuard', () => {
  let router: Router;
  let mockAuthService: { isAuthenticated: () => boolean };

  beforeEach(() => {
    mockAuthService = { isAuthenticated: () => false };
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        {
          provide: Router,
          useValue: { navigate: vi.fn() },
        },
      ],
    });
    router = TestBed.inject(Router);
  });

  it('should allow access when authenticated', () => {
    mockAuthService.isAuthenticated = () => true;
    const result = TestBed.runInInjectionContext(() => authGuard(null!, null!));
    expect(result).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should redirect to login when not authenticated', () => {
    const result = TestBed.runInInjectionContext(() => authGuard(null!, null!));
    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
