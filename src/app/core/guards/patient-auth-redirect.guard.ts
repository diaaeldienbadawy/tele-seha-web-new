import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { GlobalUserStateService } from '../services/state/global-user-state.service';
import { INextStepEnum } from '../models/nextStepEnum';

export const patientAuthRedirectGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  const globalUserStateService = inject(GlobalUserStateService);
  const accessToken = globalUserStateService.accessToken();

  if (!accessToken) {
    const publicPaths = [
      '/patient/auth/login',
      '/patient/auth/verify-otp',
      '/patient/auth/password'
    ];

    const currentPath = state.url.split('?')[0];

    if (publicPaths.includes(currentPath)) {
      return true;
    }

    return router.createUrlTree(['/patient/auth/login']);
  }

  const nextStep = globalUserStateService.nextStepEnum();

  // List of valid Patient steps
  const validPatientSteps: string[] = [
    INextStepEnum.OtpConfirm,
    INextStepEnum.Login,
    INextStepEnum.CreatePassword,
    INextStepEnum.CreateProfile,
    INextStepEnum.CreateMedicalProfile,
    INextStepEnum.SelectProfile,
    INextStepEnum.OpenHome
  ];

  // If nextStep is valid
  if (nextStep && validPatientSteps.includes(nextStep)) {
    let targetUrl = '';

    switch (nextStep) {
      case INextStepEnum.OtpConfirm:
        targetUrl = '/patient/auth/verify-otp';
        break;
      case INextStepEnum.Login:
      case INextStepEnum.CreatePassword:
        targetUrl = '/patient/auth/password';
        break;
      case INextStepEnum.CreateProfile:
        targetUrl = '/patient/auth/register/basic-info';
        break;
      case INextStepEnum.CreateMedicalProfile:
        targetUrl = '/patient/auth/register/medical-history';
        break;
      case INextStepEnum.SelectProfile:
        targetUrl = '/patient/auth/register/select-profile';
        break;
      case INextStepEnum.OpenHome:
        targetUrl = '/patient/home';
        break;
    }

    if (targetUrl) {
      const currentPath = state.url.split('?')[0];
      if (currentPath === targetUrl) {
        return true;
      }
      return router.createUrlTree([targetUrl]);
    }
  }

  // If nextStep is invalid, empty, or missing: wipe user credentials and redirect to login
  globalUserStateService.clearUserData();

  const loginUrl = '/patient/auth/login';
  const currentPath = state.url.split('?')[0];
  if (currentPath === loginUrl) {
    return true;
  }
  return router.createUrlTree([loginUrl]);
};
