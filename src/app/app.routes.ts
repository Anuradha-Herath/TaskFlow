import { Routes } from '@angular/router';
import { MainLayout } from './core/layout/main-layout/main-layout';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile/profile').then((m) => m.Profile),
      },
      {
        path: 'project/:id',
        loadComponent: () =>
          import('./features/project/project-view/project-view').then((m) => m.ProjectView),
      },
      {
        path: 'project/:projectId/task/:taskId',
        loadComponent: () =>
          import('./features/project/task-detail/task-detail').then((m) => m.TaskDetail),
      },
    ],
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register').then((m) => m.Register),
  },
  {
    path: '404',
    loadComponent: () =>
      import('./features/not-found/not-found/not-found').then((m) => m.NotFound),
  },
  { path: '**', loadComponent: () => import('./features/not-found/not-found/not-found').then((m) => m.NotFound) },
];
