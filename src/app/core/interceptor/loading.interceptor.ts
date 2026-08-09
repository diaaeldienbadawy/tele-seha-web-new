import { inject, PLATFORM_ID } from '@angular/core';
import { HttpContextToken, HttpInterceptorFn } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';
import { finalize } from 'rxjs';

/**
 * طلبات خلفية خفيفة (زي البحث اللحظي عن الأدوية) متستدعيش سبينر يغطي الصفحة كلها —
 * الكومبوننت بيعرض مؤشر صغير مكانه. حطها في الـ HttpContext بتاع الريكويست.
 */
export const SKIP_GLOBAL_LOADING = new HttpContextToken<boolean>(() => false);

/** طلبات يجب تجاهلها (ما تشغّلش الـ spinner) */
const SKIP_URLS = [
  'assets/',           // ملفات الترجمة والـ assets الثابتة
  '/negotiate',         // SignalR negotiate
  '/poll',              // SignalR long-polling
  '/send',              // SignalR send
  'signalr',            // أي endpoint فيه كلمة signalr
  'hub',                // notification hubs
  'chat-message',       // جميع طلبات المحادثة (رفع ملفات، جلب رسائل)
];

function shouldSkip(url: string): boolean {
  return SKIP_URLS.some((pattern) => url.includes(pattern));
}

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return next(req);
  }

  if (shouldSkip(req.url) || req.context.get(SKIP_GLOBAL_LOADING)) {
    return next(req);
  }

  const spinner = inject(NgxSpinnerService);

  spinner.show();

  return next(req).pipe(finalize(() => spinner.hide()));
};

