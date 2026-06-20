import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { LocalstorageService } from '../services/localstorage.service';
import { decodeJwtPayload, JwtUserClaims, getJwtUserDetails } from '../utils/jwt.utils';

export const redirectGuardGuard: CanActivateFn = (route, state) => {

  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  const localStorageService = inject(LocalstorageService);


  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  if (localStorageService.role()) {
    if (localStorageService.role() === 'Doctor') {
      return router.navigate(['/doctor/home']);
    }

    if (localStorageService.role() === 'Patient') {
      return router.navigate(['/patient/home']);
    }

  }

  return true;
};
