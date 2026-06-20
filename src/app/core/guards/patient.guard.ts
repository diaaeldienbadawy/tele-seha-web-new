import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { GlobalUserStateService } from '../services/state/global-user-state.service';

export const patientGuard: CanActivateFn = (): boolean | UrlTree => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  const globalUserStateService = inject(GlobalUserStateService);
  if (globalUserStateService.role() === 'Patient') {
    return true;
  }

  // ✅ رجّع UrlTree بدل navigate
  return router.createUrlTree(['/patient/auth/login']);
};
