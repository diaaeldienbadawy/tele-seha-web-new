import { Routes } from '@angular/router';
import { DoctorWeeksAppointmentsPageComponent } from './pages/doctor-weeks-appointments-page/doctor-weeks-appointments-page.component';
import { DoctorMyAppointmentsPageComponent } from './pages/doctor-my-appointments-page/doctor-my-appointments-page.component';
import { DoctorAllDoctorsPageComponent } from './pages/doctor-all-doctors-page/doctor-all-doctors-page.component';
import { doctorGuard } from '../../core/guards/doctor.guard';
import { doctorAuthRedirectGuard } from '../../core/guards/doctor-auth-redirect.guard';
import { AuthProcessStateService } from '../../core/services/state/auth-process-state.service';
import { DoctorRegistrationStateService } from '../../core/services/state/doctor-registration-state.service';
import { DoctorRegistrationListsStateService } from '../../core/services/state/doctor-registration-lists-state.service';
import { doctorRegistrationResolver } from '../../core/resolvers/doctor-registration.resolver';

export const doctor: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },

  {
    path: 'auth',
    canActivate: [doctorAuthRedirectGuard],
    children: [
      {
        path: '',
        providers: [AuthProcessStateService],
        children: [
          {
            path: 'login',
            loadComponent: () =>
              import('./auth/doctor-login/doctor-login.component').then(
                (m) => m.DoctorLoginComponent,
              ),
          },
          {
            path: 'verify-otp',
            loadComponent: () =>
              import('./auth/doctor-otp-confirm/doctor-otp-confirm.component').then(
                (m) => m.DoctorOtpConfirmComponent,
              ),
          },
          {
            path: 'password',
            loadComponent: () =>
              import('./auth/doctor-password/doctor-password.component').then(
                (m) => m.DoctorPasswordComponent,
              ),
          },
        ]
      },
      {
        path: 'register',
        providers: [DoctorRegistrationStateService, DoctorRegistrationListsStateService],
        resolve: { lists: doctorRegistrationResolver },
        children: [
          {
            path: 'basicInfo',
            loadComponent: () =>
              import('./auth/doctor-register-step1/doctor-register-step1.component').then(
                (m) => m.DoctorRegisterStep1Component,
              ),
          },
          {
            path: 'createProfile',
            loadComponent: () =>
              import('./auth/doctor-register-step2/doctor-register-step2.component').then(
                (m) => m.DoctorRegisterStep2Component,
              ),
          },
          {
            path: 'createCertificates',
            loadComponent: () =>
              import('./auth/doctor-register-step3/doctor-register-step3.component').then(
                (m) => m.DoctorRegisterStep3Component,
              ),
          },
          {
            path: 'appointment',
            loadComponent: () =>
              import('./auth/appointments-content/appointments-content.component').then(
                (m) => m.AppointmentsContentComponent,
              ),
          },
        ]
      },
      {
        path: 'watingForAcctivation',
        loadComponent: () =>
          import('./auth/wating-for-acctivation/wating-for-acctivation.component').then(
            (m) => m.WatingForAcctivationComponent,
          ),
      },
    ],
  },

  {
    path: 'home',
    canActivate: [doctorGuard],
    loadComponent: () =>
      import('./pages/doctor-home-page/doctor-home-page.component').then(
        (m) => m.DoctorHomePageComponent,
      ),
  },
  {
    path: 'todaysAppointments',
    canActivate: [doctorGuard],
    loadComponent: () =>
      import('./pages/doctor-todays-appointmets-page/doctor-todays-appointmets-page.component').then(
        (m) => m.DoctorTodaysAppointmetsPageComponent,
      ),
  },
  {
    path: 'day',
    canActivate: [doctorGuard],
    loadComponent: () =>
      import('./pages/doctor-day-appointments-page/doctor-day-appointments-page.component').then(
        (m) => m.DoctorDayAppointmentsPageComponent,
      ),
  },
  {
    path: 'followUp',
    canActivate: [doctorGuard],
    loadComponent: () =>
      import('./pages/doctor-follow-up-page/doctor-follow-up-page.component').then(
        (m) => m.DoctorFollowUpPageComponent,
      ),
  },
  {
    path: 'weeksAppointments',
    canActivate: [doctorGuard],
    component: DoctorWeeksAppointmentsPageComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./weekAppointmentsPage/doctor-weeks-appointments-section/doctor-weeks-appointments-section.component').then(
            (m) => m.DoctorWeeksAppointmentsSectionComponent,
          ),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./weekAppointmentsPage/doctor-details-of-week-appointments/doctor-details-of-week-appointments.component').then(
            (m) => m.DoctorDetailsOfWeekAppointmentsComponent,
          ),
      },
    ],
  },
  {
    path: 'myAppointments',
    canActivate: [doctorGuard],
    component: DoctorMyAppointmentsPageComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./doctorMyAppointmentsPage/doctor-my-appointments-section/doctor-my-appointments-section.component').then(
            (m) => m.DoctorMyAppointmentsSectionComponent,
          ),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./doctorMyAppointmentsPage/doctor-details-of-my-appointments/doctor-details-of-my-appointments.component').then(
            (m) => m.DoctorDetailsOfMyAppointmentsComponent,
          ),
      },
    ],
  },
  {
    path: 'allDoctors',
    canActivate: [doctorGuard],
    component: DoctorAllDoctorsPageComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./doctorsPage/doctor-alldoctors-section/doctor-alldoctors-section.component').then(
            (m) => m.DoctorAlldoctorsSectionComponent,
          ),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./doctorsPage/doctor-details-doctor/doctor-details-doctor.component').then(
            (m) => m.DoctorDetailsDoctorComponent,
          ),
      },
    ],
  },

  {
    path: 'videoCall/:meetingId',
    canActivate: [doctorGuard],
    loadComponent: () =>
      import('./pages/doctor-video-call-page/doctor-video-call-page.component').then(
        (m) => m.DoctorVideoCallPageComponent,
      ),
  },

  {
    path: 'settings',
    canActivate: [doctorGuard],
    loadComponent: () =>
      import('./pages/doctor-settings/doctor-settings.component').then(
        (m) => m.DoctorSettingsComponent,
      ),
  },
  {
    path: 'terms-conditions',
    canActivate: [doctorGuard],
    loadComponent: () =>
      import('./pages/doctor-terms-and-conditions-page/doctor-terms-and-conditions-page.component').then(
        (m) => m.DoctorTermsAndConditionsPageComponent,
      ),
  },
  {
    path: 'privacy-policy',
    canActivate: [doctorGuard],
    loadComponent: () =>
      import('./pages/doctor-privacy-policy-page/doctor-privacy-policy-page.component').then(
        (m) => m.DoctorPrivacyPolicyPageComponent,
      ),
  },
  {
    path: 'support',
    canActivate: [doctorGuard],
    loadComponent: () =>
      import('./pages/doctor-support-page/doctor-support-page.component').then(
        (m) => m.DoctorSupportPageComponent,
      ),
  },
];
