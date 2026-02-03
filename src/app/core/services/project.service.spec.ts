import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProjectService, Project } from './project.service';
import { environment } from '../../../../environments/environment';

describe('ProjectService', () => {
  let service: ProjectService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProjectService],
    });
    service = TestBed.inject(ProjectService);
    httpMock = TestBed.inject(HttpTestingController);
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(
      JSON.stringify({ id: 'user-1', name: 'Test', email: 'test@test.com' })
    );
  });

  afterEach(() => {
    httpMock.verify();
    vi.restoreAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getProjects should GET projects', () => {
    const projects: Project[] = [
      { id: '1', name: 'P1', userId: 'user-1', createdAt: '2025-01-01T00:00:00.000Z' },
    ];
    service.getProjects().subscribe((list) => expect(list).toEqual(projects));
    const req = httpMock.expectOne(`${environment.apiUrl}/projects`);
    expect(req.request.method).toBe('GET');
    req.flush(projects);
  });

  it('getProject should GET single project', () => {
    const project: Project = {
      id: '1',
      name: 'P1',
      userId: 'user-1',
      createdAt: '2025-01-01T00:00:00.000Z',
    };
    service.getProject('1').subscribe((p) => expect(p).toEqual(project));
    const req = httpMock.expectOne(`${environment.apiUrl}/projects/1`);
    expect(req.request.method).toBe('GET');
    req.flush(project);
  });

  it('createProject should POST with userId from storage', () => {
    const created: Project = {
      id: '2',
      name: 'New',
      userId: 'user-1',
      createdAt: new Date().toISOString(),
    };
    service.createProject('New').subscribe((p) => expect(p).toEqual(created));
    const req = httpMock.expectOne(`${environment.apiUrl}/projects`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.name).toBe('New');
    expect(req.request.body.userId).toBe('user-1');
    req.flush(created);
  });

  it('deleteProject should DELETE', () => {
    service.deleteProject('1').subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/projects/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
