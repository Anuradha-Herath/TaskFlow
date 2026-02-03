import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService, AuthResponse } from './auth.service';
import { environment } from '../../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: Router;
  let localStorageSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    localStorageSpy = vi.spyOn(Storage.prototype, 'getItem');
    vi.spyOn(Storage.prototype, 'setItem');
    vi.spyOn(Storage.prototype, 'removeItem');
    localStorageSpy.mockReturnValue(null);
  });

  afterEach(() => {
    httpMock.verify();
    vi.restoreAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should not be authenticated when no token is stored', () => {
    expect(service.isAuthenticated()).toBe(false);
    expect(service.currentUser()).toBeNull();
  });

  it('login should POST to /login and set session on success', () => {
    const res: AuthResponse = {
      token: 'fake-jwt',
      user: { id: 'u1', name: 'Test', email: 'test@test.com' },
    };
    service.login('test@test.com', 'pass').subscribe((r) => {
      expect(r).toEqual(res);
      expect(service.isAuthenticated()).toBe(true);
      expect(service.currentUser()?.email).toBe('test@test.com');
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/login`);
    expect(req.request.method).toBe('POST');
    req.flush(res);
  });

  it('login should fallback to fake auth on HTTP error', () => {
    service.login('fallback@test.com', 'pass').subscribe((r) => {
      expect(r.token).toContain('fake-jwt');
      expect(r.user.email).toBe('fallback@test.com');
      expect(service.isAuthenticated()).toBe(true);
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/login`);
    req.error(new ProgressEvent('error'));
  });

  it('register should POST to /register and set session on success', () => {
    const res: AuthResponse = {
      token: 'fake-jwt',
      user: { id: 'u1', name: 'New User', email: 'new@test.com' },
    };
    service.register('New User', 'new@test.com', 'pass').subscribe((r) => {
      expect(r).toEqual(res);
      expect(service.isAuthenticated()).toBe(true);
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/register`);
    expect(req.request.method).toBe('POST');
    req.flush(res);
  });

  it('logout should clear storage and navigate to login', () => {
    vi.spyOn(router, 'navigate');
    service.logout();
    expect(Storage.prototype.removeItem).toHaveBeenCalled();
    expect(service.isAuthenticated()).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
