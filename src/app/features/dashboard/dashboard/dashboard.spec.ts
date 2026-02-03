import { TestBed, ComponentFixture } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { Dashboard } from './dashboard';
import { ProjectService, Project } from '../../../../core/services/project.service';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;
  let projectService: ProjectService;
  let dialog: MatDialog;

  const mockProjects: Project[] = [
    { id: '1', name: 'P1', userId: 'user-1', createdAt: '2025-01-01T00:00:00.000Z' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dashboard, HttpClientTestingModule],
      providers: [
        ProjectService,
        provideRouter([]),
        provideAnimations(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    projectService = TestBed.inject(ProjectService);
    dialog = TestBed.inject(MatDialog);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit should load projects', () => {
    vi.spyOn(projectService, 'getProjects').mockReturnValue(of(mockProjects));
    fixture.detectChanges();
    expect(projectService.getProjects).toHaveBeenCalled();
    expect(component.projects()).toEqual(mockProjects);
    expect(component.loading()).toBe(false);
    expect(component.error()).toBeNull();
  });

  it('should set error when getProjects fails', () => {
    vi.spyOn(projectService, 'getProjects').mockReturnValue(
      throwError(() => new Error('Network error'))
    );
    fixture.detectChanges();
    expect(component.error()).toBeTruthy();
    expect(component.loading()).toBe(false);
  });

  it('loadProjects should refetch and update projects', () => {
    vi.spyOn(projectService, 'getProjects').mockReturnValue(of(mockProjects));
    component.loadProjects();
    expect(projectService.getProjects).toHaveBeenCalled();
    expect(component.projects()).toEqual(mockProjects);
  });

  it('openCreateDialog should open dialog', () => {
    const openSpy = vi.spyOn(dialog, 'open').mockReturnValue({
      afterClosed: () => of(undefined),
    } as any);
    component.openCreateDialog();
    expect(openSpy).toHaveBeenCalled();
  });
});
