import { Routes } from '@angular/router';

import { processInitializerGuard } from './core/guards/process-initializer.guard';

export const routes: Routes = [
  {
    path: 'patient',
    canActivate: [processInitializerGuard],
    loadChildren: () =>
      import('./features/patient/patient.routes').then((m) => m.patinet),
  },
  {
    path: 'doctor',
    canActivate: [processInitializerGuard],
    loadChildren: () =>
      import('./features/doctor/doctor.routes').then((m) => m.doctor),
  },
  {
    path: '',
    loadChildren: () =>
      import('./features/landing-page/landing-page.routes').then(
        (m) => m.landing,
      ),
  },

  {
    path: '**',
    redirectTo: '',
  },
];
