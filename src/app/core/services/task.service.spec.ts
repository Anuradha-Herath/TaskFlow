import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TaskService, Task } from './task.service';
import { environment } from '../../../../environments/environment';

describe('TaskService', () => {
  let service: TaskService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TaskService],
    });
    service = TestBed.inject(TaskService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getTasksByProject should GET tasks with projectId param', () => {
    const tasks: Task[] = [
      {
        id: '1',
        projectId: 'p1',
        title: 'T1',
        description: 'D1',
        status: 'todo',
        order: 0,
        createdAt: '2025-01-01T00:00:00.000Z',
      },
    ];
    service.getTasksByProject('p1').subscribe((list) => expect(list).toEqual(tasks));
    const req = httpMock.expectOne((r) => r.url === `${environment.apiUrl}/tasks` && r.params.get('projectId') === 'p1');
    expect(req.request.method).toBe('GET');
    req.flush(tasks);
  });

  it('createTask should POST task', () => {
    const created: Task = {
      id: '2',
      projectId: 'p1',
      title: 'New',
      description: '',
      status: 'todo',
      order: 0,
      createdAt: new Date().toISOString(),
    };
    service.createTask('p1', { title: 'New' }).subscribe((t) => expect(t).toEqual(created));
    const req = httpMock.expectOne(`${environment.apiUrl}/tasks`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.projectId).toBe('p1');
    expect(req.request.body.title).toBe('New');
    req.flush(created);
  });

  it('updateTask should PUT task', () => {
    const task: Task = {
      id: '1',
      projectId: 'p1',
      title: 'T1',
      description: '',
      status: 'in_progress',
      order: 0,
      createdAt: '2025-01-01T00:00:00.000Z',
    };
    service.updateTask(task).subscribe((t) => expect(t.status).toBe('in_progress'));
    const req = httpMock.expectOne(`${environment.apiUrl}/tasks/1`);
    expect(req.request.method).toBe('PUT');
    req.flush(task);
  });

  it('deleteTask should DELETE', () => {
    service.deleteTask('1').subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/tasks/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
