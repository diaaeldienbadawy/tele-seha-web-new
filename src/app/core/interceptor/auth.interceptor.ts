import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { catchError, switchMap, throwError } from 'rxjs';
import { RefreshTokenService } from '../../shared/services/refresh-token.service';
import { Router } from '@angular/router';
import { GlobalUserStateService } from '../services/state/global-user-state.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  const refreshService = inject(RefreshTokenService);
  const router = inject(Router);
  const globalUserStateService = inject(GlobalUserStateService);

  const isRefreshRequest = req.url.includes('refresh-login');

  let token: string | null = null;
  token = globalUserStateService.accessToken();

  if (token && !isRefreshRequest) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (
        error.status === 401 &&
        !isRefreshRequest &&
        isPlatformBrowser(platformId)
      ) {
        const refreshToken = globalUserStateService.refreshToken();

        if (refreshToken) {
          return refreshService.refreshLogin(refreshToken).pipe(
            switchMap((res: any) => {
              const newAccessToken = res.data.accessToken;

              // Instead of manually setting tokens, hydrate the whole state like the guard does
              globalUserStateService.hydrateFromLoginResponse(res);

              const retryReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${newAccessToken}`,
                },
              });

              return next(retryReq);
            }),

            catchError((refreshErr: HttpErrorResponse) => {
              if (refreshErr.status === 401 || refreshErr.status === 403) {
                globalUserStateService.clearUserData();
                router.navigate(['/']);
              }
              return throwError(() => refreshErr);
            }),
          );
        }

        globalUserStateService.clearUserData();
        router.navigate(['/']);
      }

      return throwError(() => error);
    }),
  );
};
