import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { GlobalUserStateService } from '../services/state/global-user-state.service';

export const doctorGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  const globalUserStateService = inject(GlobalUserStateService);

  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  if (globalUserStateService.role() === 'Doctor') {
    return true;
  }

  return router.createUrlTree(['/doctor/auth/login']);
};
