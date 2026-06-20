import { Routes } from '@angular/router';
import { patientGuard } from '../../core/guards/patient.guard';
import { patientAuthRedirectGuard } from '../../core/guards/patient-auth-redirect.guard';
import { ViewPatientAllDoctorsComponent } from './doctorsPage/view-patient-all-doctors/view-patient-all-doctors.component';
import { ViewPatientAllResentComponent } from './resentBookingPage/view-patient-all-resent/view-patient-all-resent.component';
import { AuthProcessStateService } from '../../core/services/state/auth-process-state.service';
import { PatientRegistrationStateService } from '../../core/services/state/patient-registration-state.service';
import { PatientRegistrationListsStateService } from '../../core/services/state/patient-registration-lists-state.service';
import { patientRegistrationResolver } from '../../core/resolvers/patient-registration.resolver';

export const patinet: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },

  {
    path: 'auth',
    canActivate: [patientAuthRedirectGuard],
    children: [
      {
        path: '',
        providers: [AuthProcessStateService],
        children: [
          {
            path: 'login',
            loadComponent: () =>
              import('./auth/patient-login/patient-login.component').then(
                (m) => m.PatientLoginComponent
              ),
          },
          {
            path: 'verify-otp',
            loadComponent: () =>
              import(
                './auth/patient-otp-confirm/patient-otp-confirm.component'
              ).then((m) => m.PatientOtpConfirmComponent),
          },
          {
            path: 'password',
            loadComponent: () =>
              import('./auth/patient-password/patient-password.component').then(
                (m) => m.PatientPasswordComponent
              ),
          },
        ]
      },
      {
        path: 'register',
        providers: [PatientRegistrationStateService, PatientRegistrationListsStateService],
        resolve: { lists: patientRegistrationResolver },
        children: [
          {
            path: 'select-profile',
            loadComponent: () =>
              import(
                './auth/select-profile/select-profile.component'
              ).then((m) => m.SelectProfileComponent),
          },
          {
            path: 'basic-info',
            loadComponent: () =>
              import('./auth/basic-info/basic-info.component').then(
                (m) => m.BasicInfoComponent
              ),
          },
          {
            path: 'medical-history',
            loadComponent: () =>
              import(
                './auth/basic-medical-history/basic-medical-history.component'
              ).then((m) => m.BasicMedicalHistoryComponent),
          },
          {
            path: 'info-about-you',
            loadComponent: () =>
              import('./auth/info-about-you/info-about-you.component').then(
                (m) => m.InfoAboutYouComponent
              ),
          },
        ]
      }
    ],
  },

  {
    path: 'home',
    canActivate: [patientGuard],
    loadComponent: () =>
      import('./pages/patient-home-page/patient-home-page.component').then(
        (m) => m.PatientHomePageComponent
      ),
  },
  {
    path: 'specialties',
    canActivate: [patientGuard],
    loadComponent: () =>
      import(
        './pages/patient-specialties-page/patient-specialties-page.component'
      ).then((m) => m.PatientSpecialtiesPageComponent),
  },
  {
    path: 'allDoctors',
    canActivate: [patientGuard],
    component: ViewPatientAllDoctorsComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import(
            './pages/patient-all-doctors-page/patient-all-doctors-page.component'
          ).then((m) => m.PatientAllDoctorsPageComponent),
      },
      {
        path: ':doctorId',
        canActivate: [patientGuard],
        loadComponent: () =>
          import(
            './pages/patient-doctor-details-page/patient-doctor-details-page.component'
          ).then((m) => m.PatientDoctorDetailsPageComponent),
      },
    ],
  },
  {
    path: 'allResent',
    canActivate: [patientGuard],
    component: ViewPatientAllResentComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import(
            './pages/patient-resent-booking-page/patient-resent-booking-page.component'
          ).then((m) => m.PatientResentBookingPageComponent),
      },
      {
        path: ':doctorId',
        canActivate: [patientGuard],
        loadComponent: () =>
          import(
            './pages/patient-doctor-details-page/patient-doctor-details-page.component'
          ).then((m) => m.PatientDoctorDetailsPageComponent),
      },
      {
        path: ':sessionId/waitingSession',
        canActivate: [patientGuard],
        loadComponent: () =>
          import(
            './pages/patient-wating-session-page/patient-wating-session-page.component'
          ).then((m) => m.PatientWatingSessionPageComponent),
      },
    ],
  },
  {
    path: 'videoCall/:sessionId',
    canActivate: [patientGuard],
    loadComponent: () =>
      import(
        './pages/patient-video-call-page/patient-video-call-page.component'
      ).then((m) => m.PatientVideoCallPageComponent),
  },
  {
    path: 'reports',
    canActivate: [patientGuard],
    loadComponent: () =>
      import(
        './pages/patient-reports-page/patient-reports-page.component'
      ).then((m) => m.PatientReportsPageComponent),
  },
  {
    path: 'settings',
    canActivate: [patientGuard],
    loadComponent: () =>
      import(
        './pages/patient-settings/patient-settings.component'
      ).then((m) => m.PatientSettingsComponent),
  },
];
