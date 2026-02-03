import { TestBed, ComponentFixture } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { Login } from './login';
import { AuthService } from '../../../../core/services/auth.service';
import { of, throwError } from 'rxjs';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let authService: AuthService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Login, HttpClientTestingModule],
      providers: [
        AuthService,
        provideRouter([]),
        provideAnimations(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('form should be invalid when empty', () => {
    expect(component.loginForm.invalid).toBe(true);
  });

  it('form should be invalid with invalid email', () => {
    component.loginForm.patchValue({ email: 'notanemail', password: 'pass' });
    expect(component.loginForm.get('email')?.invalid).toBe(true);
  });

  it('form should be valid with email and password', () => {
    component.loginForm.patchValue({ email: 'test@test.com', password: 'password' });
    expect(component.loginForm.valid).toBe(true);
  });

  it('onSubmit should call auth.login and navigate on success', () => {
    vi.spyOn(authService, 'login').mockReturnValue(of({ token: 't', user: { id: '1', name: 'Test', email: 'test@test.com' } }));
    vi.spyOn(router, 'navigate');
    component.loginForm.patchValue({ email: 'test@test.com', password: 'pass' });
    component.onSubmit();
    expect(authService.login).toHaveBeenCalledWith('test@test.com', 'pass');
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('onSubmit should set errorMessage on login failure', () => {
    vi.spyOn(authService, 'login').mockReturnValue(throwError(() => new Error('fail')));
    component.loginForm.patchValue({ email: 'test@test.com', password: 'pass' });
    component.onSubmit();
    expect(component.errorMessage()).toBe('Login failed. Please try again.');
  });

  it('onSubmit should not call auth when form invalid', () => {
    vi.spyOn(authService, 'login');
    component.loginForm.patchValue({ email: '', password: '' });
    component.onSubmit();
    expect(authService.login).not.toHaveBeenCalled();
  });
});
