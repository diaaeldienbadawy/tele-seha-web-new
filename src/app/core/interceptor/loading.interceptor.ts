import { inject, PLATFORM_ID } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';
import { finalize } from 'rxjs';

/** طلبات يجب تجاهلها (ما تشغّلش الـ spinner) */
const SKIP_URLS = [
  'assets/',           // ملفات الترجمة والـ assets الثابتة
  '/negotiate',         // SignalR negotiate
  '/poll',              // SignalR long-polling
  '/send',              // SignalR send
  'signalr',            // أي endpoint فيه كلمة signalr
  'hub',                // notification hubs
];

function shouldSkip(url: string): boolean {
  return SKIP_URLS.some((pattern) => url.includes(pattern));
}

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return next(req);
  }

  if (shouldSkip(req.url)) {
    return next(req);
  }

  const spinner = inject(NgxSpinnerService);

  spinner.show();

  return next(req).pipe(finalize(() => spinner.hide()));
};

