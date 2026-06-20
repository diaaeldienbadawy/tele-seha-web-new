import { HttpInterceptorFn, HttpErrorResponse, HttpContextToken } from '@angular/common/http';
import { inject, PLATFORM_ID, Injector } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { catchError, throwError } from 'rxjs';
import { TranslateServiceService } from '../services/translate-service.service';

/**
 * HttpContextToken to allow specific requests to opt-out of global error toasts.
 * Usage:
 * this.http.get('/api/example', {
 *   context: new HttpContext().set(SKIP_GLOBAL_ERROR_HANDLING, true)
 * })
 */
export const SKIP_GLOBAL_ERROR_HANDLING = new HttpContextToken<boolean>(() => false);

export const globalHandlerInterceptor: HttpInterceptorFn = (req, next) => {
  const toastr = inject(ToastrService);
  const injector = inject(Injector);
  const platformId = inject(PLATFORM_ID);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // 1. Skip global handling if the request explicitly opts out
      if (req.context.get(SKIP_GLOBAL_ERROR_HANDLING)) {
        return throwError(() => error);
      }

      // 2. Skip 401 errors since they are handled by the authInterceptor (token refresh)
      if (error.status === 401) {
        return throwError(() => error);
      }

      // 3. Only perform Toastr and UI interactions on the browser platform
      if (isPlatformBrowser(platformId)) {
        const translateService = injector.get(TranslateServiceService);
        const lang = translateService.getCurrentLanguage() || 'en';
        const isRtl = document.documentElement.dir === 'rtl';
        const isAr = lang === 'ar' || isRtl;

        let errorMsgs: string[] = [];

        // Detect and handle status 0 (Network Error / CORS)
        if (error.status === 0) {
          errorMsgs.push(isAr
            ? 'تعذر الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت.'
            : 'Could not connect to the server. Please check your internet connection.');
        } else {
          // Try parsing custom API response messages
          const apiError = error?.error;

          if (apiError) {
            if (typeof apiError === 'string') {
              errorMsgs.push(apiError);
            } else if (apiError.message || apiError.Message) {
              const rawMsg = apiError.message || apiError.Message;

              // Check if it is a JSON parsing SyntaxError (happens when backend returns plain text instead of JSON)
              const isJsonParseError = 
                rawMsg.includes('is not valid JSON') || 
                rawMsg.includes('JSON.parse') || 
                rawMsg.includes('JSON Parse error') ||
                rawMsg.includes('Unexpected token');

              if (isJsonParseError) {
                // Try to extract any double-quoted text which contains the raw text response
                const quoteMatch = rawMsg.match(/"([^"]+)"/);
                if (quoteMatch && quoteMatch[1]) {
                  errorMsgs.push(quoteMatch[1].trim());
                } else {
                  // Fallback to error statusText or clean message instead of technical JSON parsing error
                  errorMsgs.push(error.statusText || '');
                }
              } else {
                errorMsgs.push(rawMsg);
              }
            } else if (apiError.errors) {
              // Handle validation errors from ModelState or FluentValidation
              Object.entries(apiError.errors).forEach(([key, messages]: [string, any]) => {
                if (Array.isArray(messages)) {
                  messages.forEach((msg: string) => {
                    errorMsgs.push(`${key}: ${msg}`);
                  });
                } else if (typeof messages === 'string') {
                  errorMsgs.push(`${key}: ${messages}`);
                }
              });
            }
          }

          // Fallback messages for standard HTTP Status Codes if no API message is available
          if (errorMsgs.length === 0) {
            switch (error.status) {
              case 400:
                errorMsgs.push(isAr
                  ? 'طلب غير صالح. يرجى التحقق من البيانات المدخلة.'
                  : 'Bad Request. Please check the entered data.');
                break;
              case 403:
                errorMsgs.push(isAr
                  ? 'غير مسموح لك بإجراء هذه العملية.'
                  : 'You are not authorized to perform this action.');
                break;
              case 404:
                errorMsgs.push(isAr
                  ? 'العنصر أو الصفحة المطلوبة غير موجودة.'
                  : 'The requested resource or page was not found.');
                break;
              case 500:
                errorMsgs.push(isAr
                  ? 'حدث خطأ داخلي في الخادم. يرجى المحاولة مرة أخرى لاحقاً.'
                  : 'Internal Server Error. Please try again later.');
                break;
              default:
                errorMsgs.push(error.message || (isAr ? 'حدث خطأ غير متوقع.' : 'An unexpected error occurred.'));
                break;
            }
          }
        }

        // Display toast alerts
        if (errorMsgs.length > 0) {
          const filteredMsgs = errorMsgs.filter(msg => {
            const normalized = msg.toLowerCase();
            const isNoAppointments = 
              normalized.includes('لا توجد مواعيد') || 
              normalized.includes('لا يوجد مواعيد') || 
              normalized.includes('لا توجد جلسات') || 
              normalized.includes('لا يوجد جلسات') || 
              normalized.includes('no appointments') || 
              normalized.includes('no sessions') ||
              normalized.includes('no availability') ||
              normalized.includes('no slots') ||
              normalized.includes('no schedule');
            return !isNoAppointments;
          });

          if (filteredMsgs.length > 0) {
            filteredMsgs.forEach(msg => {
              toastr.error(msg, isAr ? 'خطأ' : 'Error', {
                enableHtml: true,
                closeButton: true,
                timeOut: 5000,
                progressBar: true,
              });
            });
          }
        }

        // Create a silenced version of the error response with a null error body to prevent components from showing duplicate toasts
        const silencedError = new HttpErrorResponse({
          error: null,
          headers: error.headers,
          status: error.status,
          statusText: error.statusText,
          url: error.url || undefined
        });

        return throwError(() => silencedError);
      }

      return throwError(() => error);
    })
  );
};

