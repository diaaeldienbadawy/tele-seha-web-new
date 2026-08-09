import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { GlobalUserStateService } from '../../core/services/state/global-user-state.service';
import { LocalstorageService } from '../../core/services/localstorage.service';
import { RefreshTokenService } from './refresh-token.service';
import { decodeJwtPayload } from '../../core/utils/jwt.utils';

/**
 * توكن صالح لاتصالات الـ SignalR.
 *
 * **المشكلة اللي بيحلها:** الـ access token عمره 10 دقايق بس
 * (`Jwt:AccessTokenExpirationMins`). الـ `authInterceptor` بيجدده لما أي ريكويست
 * HTTP يرجّع 401 — لكن الـ SignalR بيعمل الطلبات بتاعته بـ fetch بره الـ
 * HttpClient، فالـ 401 بتاعه مش بيمر على الـ interceptor أبدًا. النتيجة: بعد
 * أول 10 دقايق الـ negotiate بيرجع 401، و`withAutomaticReconnect` يفضل يحاول
 * بنفس التوكن الميت للأبد → الشات بيقف في نص الكشف وتحديثات الحجز اللحظية بتموت،
 * وكل ده من غير أي رسالة للمستخدم. (اتشاف عمليًا: أول negotiate 200 وبعد فترة
 * كل المحاولات 401.)
 *
 * الحل: `accessTokenFactory` بينادي `getFreshToken()` — بيرجّع التوكن الحالي لو
 * لسه صالح، وبيجدده من الـ refresh token لو قرب/خلص. الطلب واحد مشترك
 * (single-flight) عشان الاتصالين (الشات + الإشعارات) ميعملوش تجديدين متوازيين.
 */
@Injectable({ providedIn: 'root' })
export class HubTokenService {
  private readonly userState = inject(GlobalUserStateService);
  private readonly localStorage = inject(LocalstorageService);
  private readonly refreshTokenService = inject(RefreshTokenService);

  /** التجديد الجاري — أي نداء تاني في نفس الوقت بيستنى نفس الوعد. */
  private inFlight: Promise<string> | null = null;

  /** بعد فشل تجديد بنهدى شوية: الـ SignalR بيعيد المحاولة بسرعة وكان هيعمل طوفان طلبات. */
  private cooldownUntil = 0;

  /** هامش أمان: بنجدد قبل الانتهاء بدقيقة بدل ما نستنى الرفض. */
  private static readonly REFRESH_SKEW_SECONDS = 60;
  private static readonly FAILURE_COOLDOWN_MS = 10000;

  async getFreshToken(): Promise<string> {
    const current = this.currentToken();
    if (current && !this.isExpiring(current)) return current;
    if (Date.now() < this.cooldownUntil) return current;

    const refreshToken = this.storedRefreshToken();
    if (!refreshToken) return current;

    if (!this.inFlight) {
      this.inFlight = this.doRefresh(refreshToken).finally(() => {
        this.inFlight = null;
      });
    }

    try {
      return await this.inFlight;
    } catch {
      // فشل التجديد: بنرجّع اللي معانا — الاتصال هيفشل ويعيد المحاولة بدل ما نرمي.
      this.cooldownUntil = Date.now() + HubTokenService.FAILURE_COOLDOWN_MS;
      return this.currentToken();
    }
  }

  private currentToken(): string {
    return this.userState.accessToken() || this.localStorage.accessToken() || '';
  }

  /**
   * الـ refresh token بيتدوّر (rotate) مع كل استعمال، والنسخة الوحيدة الصح هي اللي
   * في localStorage — أي تبويب تاني بيجدد بيكتب الجديدة هناك بينما نسخة الميموري
   * في التبويب ده بتبقى قديمة وترفض بـ 400. فبنقرأ من localStorage الأول.
   */
  private storedRefreshToken(): string {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('refreshToken');
      if (stored) return stored;
    }
    return this.userState.refreshToken() || this.localStorage.refreshToken() || '';
  }

  private async doRefresh(refreshToken: string): Promise<string> {
    const res: any = await firstValueFrom(this.refreshTokenService.refreshLogin(refreshToken));
    // نفس اللي بيعمله الـ interceptor والـ guard: بنملأ الحالتين مع بعض.
    this.userState.hydrateFromLoginResponse(res);
    this.localStorage.hydrateFromLoginResponse(res);
    this.cooldownUntil = 0;
    return res?.data?.accessToken ?? this.currentToken();
  }

  private isExpiring(token: string): boolean {
    const payload = decodeJwtPayload<{ exp?: number }>(token);
    const exp = payload?.exp;
    // توكن من غير exp: منجددش على الفاضي — نسيبه للسيرفر يحكم.
    if (typeof exp !== 'number') return false;
    const now = Math.floor(Date.now() / 1000);
    return exp - now <= HubTokenService.REFRESH_SKEW_SECONDS;
  }
}
