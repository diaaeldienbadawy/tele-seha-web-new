import { CanActivateFn, Router } from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { GlobalUserStateService } from '../services/state/global-user-state.service';
import { LocalstorageService } from '../services/localstorage.service';
import { RefreshTokenService } from '../../shared/services/refresh-token.service';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export const processInitializerGuard: CanActivateFn = (route, state) => {
  const platformId = inject(PLATFORM_ID);
  
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  const globalUserStateService = inject(GlobalUserStateService);
  const localStorageService = inject(LocalstorageService);
  const refreshTokenService = inject(RefreshTokenService);

  if (globalUserStateService.isInitialized()) {
    return true;
  }

  const refreshToken = globalUserStateService.refreshToken() || localStorage.getItem('refreshToken');

  if (!refreshToken) {
    return true; // Let child guards redirect to login if necessary
  }

  return refreshTokenService.refreshLogin(refreshToken).pipe(
    map((res: any) => {
      globalUserStateService.hydrateFromLoginResponse(res);
      localStorageService.hydrateFromLoginResponse(res);
      return true; // Proceed to route, letting child guards or components handle nextStepEnum redirects
    }),
    catchError(() => {
      globalUserStateService.clearUserData();
      localStorageService.clearUserData();
      return of(true);
    })
  );
};
