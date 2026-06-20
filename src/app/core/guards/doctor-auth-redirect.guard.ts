import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { GlobalUserStateService } from '../services/state/global-user-state.service';
import { INextStepEnum } from '../models/nextStepEnum';

export const doctorAuthRedirectGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  const globalUserStateService = inject(GlobalUserStateService);
  const accessToken = globalUserStateService.accessToken();

  if (!accessToken) {
    const publicPaths = [
      '/doctor/auth/login',
      '/doctor/auth/verify-otp',
      '/doctor/auth/password'
    ];

    const currentPath = state.url.split('?')[0];

    if (publicPaths.includes(currentPath)) {
      return true;
    }

    return router.createUrlTree(['/doctor/auth/login']);
  }

  const nextStep = globalUserStateService.nextStepEnum();

  // List of valid Doctor steps
  const validDoctorSteps: string[] = [
    INextStepEnum.OtpConfirm,
    INextStepEnum.Login,
    INextStepEnum.CreatePassword,
    INextStepEnum.CreateProfile,
    INextStepEnum.CreateDoctorProfile,
    INextStepEnum.CreateDoctorCertificates,
    INextStepEnum.CreateDoctorSchedules,
    INextStepEnum.WaitForAcctivation,
    INextStepEnum.OpenHome
  ];

  // If nextStep is valid
  if (nextStep && validDoctorSteps.includes(nextStep)) {
    let targetUrl = '';

    switch (nextStep) {
      case INextStepEnum.OtpConfirm:
        targetUrl = '/doctor/auth/verify-otp';
        break;
      case INextStepEnum.Login:
      case INextStepEnum.CreatePassword:
        targetUrl = '/doctor/auth/password';
        break;
      case INextStepEnum.CreateProfile:
        targetUrl = '/doctor/auth/register/basicInfo';
        break;
      case INextStepEnum.CreateDoctorProfile:
        targetUrl = '/doctor/auth/register/createProfile';
        break;
      case INextStepEnum.CreateDoctorCertificates:
        targetUrl = '/doctor/auth/register/createCertificates';
        break;
      case INextStepEnum.CreateDoctorSchedules:
        targetUrl = '/doctor/auth/register/appointment';
        break;
      case INextStepEnum.WaitForAcctivation:
        targetUrl = '/doctor/auth/watingForAcctivation';
        break;
      case INextStepEnum.OpenHome:
        targetUrl = '/doctor/home';
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

  const loginUrl = '/doctor/auth/login';
  const currentPath = state.url.split('?')[0];
  if (currentPath === loginUrl) {
    return true;
  }
  return router.createUrlTree([loginUrl]);
};
