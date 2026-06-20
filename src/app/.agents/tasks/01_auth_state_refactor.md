# Task 1: إعادة هيكلة الـ Auth State — localStorage → In-Memory State

## الهدف
تحويل الـ Authentication state من localStorage (متخزن على الديسك) إلى in-memory state (Signals و BehaviorSubjects). الحاجة الوحيدة اللي هتفضل في localStorage هي الـ `refreshToken`. كل حاجة تانية (accessToken, role, nextStep, doctorId, patientName, etc.) هتيجي من الـ API response وتتخزن في الـ memory.

## لماذا؟
- الـ `nextStep` بيبقى stale في localStorage ← لو المستخدم فتح tab تاني وكمّل هناك
- `localStorage.clear()` في أماكن كتير بتمسح كل حاجة بدون داعي
- الـ Guards بتعتمد على قيم ممكن تكون قديمة
- الـ refresh-login API بترجع كل البيانات المطلوبة (accessToken, nextStep, user data)

---

## الخطوات

### الخطوة 1: تعديل `LocalstorageService` ليكون Auth State Manager

**الملف:** `src/app/core/services/localstorage.service.ts`

**التعديلات المطلوبة:**

1. **امسح كل الـ signals و BehaviorSubjects الموجودة** (أسطر 11-25)
2. **أضف الـ state الجديد كـ Signals:**

```typescript
// === الـ State الجديد ===

// الحاجة الوحيدة في localStorage
// refreshToken → يتخزن/يتجاب من localStorage

// كل حاجة تانية في الـ Memory فقط:
private _accessToken = signal<string>('');
readonly accessToken = this._accessToken.asReadonly();

private _refreshToken = signal<string>('');
readonly refreshToken = this._refreshToken.asReadonly();

private _role = signal<string | null>(null);
readonly role = this._role.asReadonly();

private _userId = signal<string | null>(null);
readonly userId = this._userId.asReadonly();

private _nextStepEnum = signal<string>('');
readonly nextStepEnum = this._nextStepEnum.asReadonly();

private _doctorId = signal<string>('');
readonly doctorId = this._doctorId.asReadonly();

private _doctorName = signal<string>('');
readonly doctorName = this._doctorName.asReadonly();

private _doctorImage = signal<string>('');
readonly doctorImage = this._doctorImage.asReadonly();

private _patientName = signal<string>('');
readonly patientName = this._patientName.asReadonly();

private _patientId = signal<string>('');
readonly patientId = this._patientId.asReadonly();

private _loggedInPatientId = signal<string | null>(null);
readonly loggedInPatientId = this._loggedInPatientId.asReadonly();

private _patients = signal<any[]>([]);
readonly patients = this._patients.asReadonly();

private _mobile = signal<string>('');
readonly mobile = this._mobile.asReadonly();

private _isInitialized = signal<boolean>(false);
readonly isInitialized = this._isInitialized.asReadonly();
```

3. **عدّل الـ Constructor:**
```typescript
constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // في البداية، الحاجة الوحيدة اللي نقراها من localStorage هي الـ refreshToken
    if (isPlatformBrowser(this.platformId)) {
        const storedRefreshToken = localStorage.getItem('refreshToken') || '';
        this._refreshToken.set(storedRefreshToken);
    }
}
```

4. **أضف method جديدة اسمها `hydrateFromLoginResponse()`:**
```typescript
/**
 * بتتنادى بعد أي login/refresh ناجح.
 * بتملأ كل الـ in-memory state من الـ API response.
 */
hydrateFromLoginResponse(res: any): void {
    // Tokens
    if (res.data?.accessToken) {
        this._accessToken.set(res.data.accessToken);
    }
    if (res.data?.refreshToken) {
        this._refreshToken.set(res.data.refreshToken);
        // الـ refreshToken هو الحاجة الوحيدة اللي بنحفظها في localStorage
        if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('refreshToken', res.data.refreshToken);
        }
    }

    // NextStep
    if (res.nextStep) {
        this._nextStepEnum.set(res.nextStep);
    }

    // Role
    if (res.data?.user?.role) {
        this._role.set(res.data.user.role);
    }

    // Doctor data
    if (res.data?.user?.doctor) {
        const doctor = res.data.user.doctor;
        this._doctorId.set(doctor.doctorId?.toString() || '');
        this._doctorName.set(doctor.name || '');
        this._doctorImage.set(doctor.imageUrl || '');
    }

    // Patient data
    if (res.data?.user?.patients?.length > 0) {
        const firstPatient = res.data.user.patients[0];
        this._patientName.set(firstPatient.name || '');
        this._patientId.set(firstPatient.patientId?.toString() || '');
        this._loggedInPatientId.set(firstPatient.patientId?.toString() || null);
        this._patients.set(res.data.user.patients);
    }

    // Role from JWT if not in response
    if (!res.data?.user?.role && res.data?.accessToken) {
        const payload = decodeJwtPayload<JwtUserClaims>(res.data.accessToken);
        const details = getJwtUserDetails(payload);
        if (details?.role) this._role.set(details.role);
        if (details?.userId) this._userId.set(details.userId);
    }

    this._isInitialized.set(true);
}
```

5. **أضف method `hydrateFromRegistrationResponse()`:**
```typescript
/**
 * بتتنادى بعد خطوات التسجيل (basicInfo, doctorProfile, certificates).
 * الـ registration responses مبترجعش tokens جديدة — بس بتحدث nextStep و data.
 */
hydrateFromRegistrationResponse(res: any): void {
    if (res.nextStep) {
        this._nextStepEnum.set(res.nextStep);
    }
    if (res.data?.doctorId) {
        this._doctorId.set(res.data.doctorId.toString());
    }
    if (res.data?.Image || res.data?.image) {
        this._doctorImage.set(res.data.Image || res.data.image);
    }
}
```

6. **أضف setters فردية للحاجات اللي بتتحدث واحدة واحدة:**
```typescript
setAccessToken(token: string): void { this._accessToken.set(token); }
setRefreshToken(token: string): void {
    this._refreshToken.set(token);
    if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('refreshToken', token);
    }
}
setNextStepEnum(step: string): void { this._nextStepEnum.set(step); }
setRole(role: string): void { this._role.set(role); }
setDoctorId(id: string): void { this._doctorId.set(id); }
setDoctorNameValue(name: string): void { this._doctorName.set(name); }
setDoctorImageValue(image: string): void { this._doctorImage.set(image); }
setPatientNameValue(name: string): void { this._patientName.set(name); }
setPatientId(id: string): void { this._patientId.set(id); }
setLoggedInPatientId(id: string | null): void { this._loggedInPatientId.set(id); }
setPatients(patients: any[]): void { this._patients.set(patients); }
setMobile(mobile: string): void { this._mobile.set(mobile); }
```

7. **عدّل `clearUserData()`:**
```typescript
clearUserData(): void {
    this._accessToken.set('');
    this._refreshToken.set('');
    this._role.set(null);
    this._userId.set(null);
    this._nextStepEnum.set('');
    this._doctorId.set('');
    this._doctorName.set('');
    this._doctorImage.set('');
    this._patientName.set('');
    this._patientId.set('');
    this._loggedInPatientId.set(null);
    this._patients.set([]);
    this._mobile.set('');
    this._isInitialized.set(false);

    // امسح الـ refreshToken من localStorage
    if (isPlatformBrowser(this.platformId)) {
        localStorage.removeItem('refreshToken');
    }

    // امسح الـ cookie
    if (typeof document !== 'undefined') {
        document.cookie = 'createPasswordToken=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
    }
}
```

8. **خلّي الـ methods القديمة `get()`, `set()`, `remove()` شغالة مؤقتاً** (backward compatibility) بس حوّلها تشتغل على الـ signals بدل localStorage:
```typescript
/** @deprecated — استخدم الـ signals مباشرة */
get(key: string): string {
    switch (key) {
        case 'accessToken': return this._accessToken();
        case 'refreshToken': return this._refreshToken();
        case 'role': return this._role() || '';
        case 'nextStepEnum': return this._nextStepEnum();
        case 'doctorId': return this._doctorId();
        case 'doctorName': return this._doctorName();
        case 'doctorImage': return this._doctorImage();
        case 'patientName': return this._patientName();
        case 'patientId': return this._patientId();
        case 'loggedInPatientId': return this._loggedInPatientId() || '';
        case 'mobile': return this._mobile();
        default: return '';
    }
}

/** @deprecated — استخدم الـ setters مباشرة */
set(key: string, value: string): void {
    switch (key) {
        case 'accessToken': this._accessToken.set(value); break;
        case 'refreshToken': this.setRefreshToken(value); break;
        case 'role': this._role.set(value || null); break;
        case 'nextStepEnum': this._nextStepEnum.set(value); break;
        case 'doctorId': this._doctorId.set(value); break;
        case 'doctorName': this._doctorName.set(value); break;
        case 'doctorImage': this._doctorImage.set(value); break;
        case 'patientName': this._patientName.set(value); break;
        case 'patientId': this._patientId.set(value); break;
        case 'loggedInPatientId': this._loggedInPatientId.set(value || null); break;
        case 'mobile': this._mobile.set(value); break;
    }
}
```

9. **خلّي `setPatientName()`, `setDoctorImage()`, `setDoctorName()` القديمين يشتغلوا** عبر الـ setters الجديدة:
```typescript
setPatientName(name: string) { this.setPatientNameValue(name); }
setDoctorImage(image: string) { this.setDoctorImageValue(image); }
setDoctorName(name: string) { this.setDoctorNameValue(name); }
```

10. **عدّل `getPatients()`:**
```typescript
getPatients(): any[] {
    return this._patients();
}
```

**⚠️ مهم:** خلّي `patientName$`, `doctorImage$`, `doctorName$` BehaviorSubjects موجودين مؤقتاً (أو حوّلهم لـ computed signals) عشان أي component بيستخدمهم ما يتكسرش. ممكن تعمل:
```typescript
// Backward compatibility — subscribe على الـ signal
readonly patientName$ = toObservable(this._patientName);
readonly doctorImage$ = toObservable(this._doctorImage);
readonly doctorName$ = toObservable(this._doctorName);
```
ده محتاج `import { toObservable } from '@angular/core/rxjs-interop';`

---

### الخطوة 2: تعديل `auth.interceptor.ts`

**الملف:** `src/app/core/interceptor/auth.interceptor.ts`

**التعديلات:**

1. **غيّر الطريقة اللي بتجيب بيها الـ token:**
```typescript
// قبل (سطر 18):
token = localStorageService.get('accessToken');

// بعد:
token = localStorageService.accessToken();
```

2. **غيّر الطريقة اللي بتجيب بيها الـ refreshToken:**
```typescript
// قبل (سطر 35):
const refreshToken = localStorageService.get('refreshToken');

// بعد:
const refreshToken = localStorageService.refreshToken();
```

3. **غيّر حفظ الـ tokens بعد refresh ناجح:**
```typescript
// قبل (سطر 43-44):
localStorageService.set('accessToken', newAccessToken);
localStorageService.set('refreshToken', newRefreshToken);

// بعد:
localStorageService.setAccessToken(newAccessToken);
localStorageService.setRefreshToken(newRefreshToken);
```

4. **غيّر الـ error handling:**
```typescript
// قبل (سطر 57-59):
localStorageService.clearUserData();
localStorage.clear();
router.navigate(['/home']);

// بعد:
localStorageService.clearUserData();
router.navigate(['/']);
```

5. **نفس التعديل في سطر 66-68:**
```typescript
// قبل:
localStorageService.clearUserData();
localStorage.clear();
router.navigate(['/home']);

// بعد:
localStorageService.clearUserData();
router.navigate(['/']);
```

---

### الخطوة 3: تعديل `app.component.ts`

**الملف:** `src/app/app.component.ts`

**التعديلات:**

الـ `AppComponent` حالياً بيقرأ الـ token من localStorage في الـ constructor ويعمل decode عشان يعرف الـ role ويوصل الـ SignalR. لازم يتغير عشان يستخدم الـ refresh-login API:

```typescript
export class AppComponent implements OnInit {
    constructor(
        private notificationService: NotificationService,
        private localStorageService: LocalstorageService,
        private refreshTokenService: RefreshTokenService,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {}

    ngOnInit(): void {
        if (!isPlatformBrowser(this.platformId)) return;

        const refreshToken = this.localStorageService.refreshToken();
        if (!refreshToken) return;

        // عمل refresh-login عشان نملأ الـ state
        this.refreshTokenService.refreshLogin(refreshToken).subscribe({
            next: (res: any) => {
                this.localStorageService.hydrateFromLoginResponse(res);

                // وصّل الـ SignalR
                const role = this.localStorageService.role();
                const userId = this.localStorageService.userId();
                if (role === 'Patient' && userId) {
                    this.notificationService.startPatientConnection(userId);
                } else if (role === 'Doctor' && userId) {
                    this.notificationService.startDoctorConnection(userId);
                }
            },
            error: () => {
                // الـ refresh token expired أو invalid
                this.localStorageService.clearUserData();
            }
        });
    }

    // ... باقي الكود (scrollToTop, etc.)
}
```

**امسح:**
- الـ `SignalRService` import والـ injection (سطر 5, 18)
- الـ JWT decoding في الـ constructor (أسطر 22-33)
- الـ `console.log(details)` (سطر 25)

**أضف imports:**
```typescript
import { RefreshTokenService } from './shared/services/refresh-token.service';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';
```

---

### الخطوة 4: تعديل `notification.service.ts`

**الملف:** `src/app/features/patient/service/notification.service.ts`

**التعديل الوحيد:** في `_authHeaders()` (سطر 23-28) و `accessTokenFactory` (سطر 198-200)، غيّرهم يستخدموا الـ Service:

```typescript
private localStorageService = inject(LocalstorageService);

private _authHeaders() {
    const token = this.localStorageService.accessToken();
    if (!token) return undefined;
    return { headers: { Authorization: `Bearer ${token}` } };
}
```

وفي `accessTokenFactory`:
```typescript
accessTokenFactory: () => this.localStorageService.accessToken(),
```

---

### الخطوة 5: تعديل الـ Guards

**الملفات:**
- `src/app/core/guards/doctor-auth-redirect.guard.ts`
- `src/app/core/guards/patient-auth-redirect.guard.ts`
- `src/app/core/guards/doctor.guard.ts`
- `src/app/core/guards/redirect-guard.guard.ts`

**التعديل:** غيّر كل `localStorageService.get('accessToken')` لـ `localStorageService.accessToken()` وكل `localStorageService.get('nextStepEnum')` لـ `localStorageService.nextStepEnum()`.

**مثال لـ `doctor-auth-redirect.guard.ts`:**
```typescript
// قبل (سطر 16):
const accessToken = localStorageService.get('accessToken');
// بعد:
const accessToken = localStorageService.accessToken();

// قبل (سطر 22):
const nextStep = localStorageService.get('nextStepEnum');
// بعد:
const nextStep = localStorageService.nextStepEnum();
```

---

### الخطوة 6: تعديل كل الـ Auth Components

**لكل component من دول، غيّر الـ pattern التالي:**

| القديم | الجديد |
|---|---|
| `this.localStorageService.set('accessToken', ...)` | `this.localStorageService.setAccessToken(...)` |
| `this.localStorageService.set('refreshToken', ...)` | `this.localStorageService.setRefreshToken(...)` |
| `this.localStorageService.set('nextStepEnum', ...)` | `this.localStorageService.setNextStepEnum(...)` |
| `this.localStorageService.set('role', ...)` | `this.localStorageService.setRole(...)` |
| `this.localStorageService.set('mobile', ...)` | `this.localStorageService.setMobile(...)` |
| `this.localStorageService.set('doctorId', ...)` | `this.localStorageService.setDoctorId(...)` |
| `this.localStorageService.set('patientId', ...)` | `this.localStorageService.setPatientId(...)` |
| `this.localStorageService.set('loggedInPatientId', ...)` | `this.localStorageService.setLoggedInPatientId(...)` |
| `this.localStorageService.set('patients', JSON.stringify(...))` | `this.localStorageService.setPatients(...)` |
| `this.localStorageService.get('mobile')` | `this.localStorageService.mobile()` |
| `this.localStorageService.get('nextStepEnum')` | `this.localStorageService.nextStepEnum()` |
| `this.localStorageService.get('doctorId')` | `this.localStorageService.doctorId()` |
| `localStorage.clear()` | `this.localStorageService.clearUserData()` |

**الملفات اللي محتاجة تتعدل (بالترتيب):**

1. `doctor-login.component.ts`
2. `doctor-otp-confirm.component.ts`
3. `doctor-password.component.ts`
4. `doctor-register-step1.component.ts`
5. `doctor-register-step2.component.ts`
6. `doctor-register-step3.component.ts`
7. `wating-for-acctivation.component.ts`
8. `patient-login.component.ts`
9. `patient-otp-confirm.component.ts`
10. `patient-password.component.ts`
11. `basic-info.component.ts`
12. `select-profile.component.ts`
13. `forget-password.component.ts`

**⚠️ بالنسبة للـ login responses:** الـ `doctor-password.component.ts` و `patient-password.component.ts` فيهم `loginWithPattern()` method — دي بتعمل الكتير من الـ `set()` calls. ممكن تستبدلهم كلهم بـ call واحد:
```typescript
// بدل كل الـ set() calls في loginWithPattern():
this.localStorageService.hydrateFromLoginResponse(res);
// وبعدين بس navigate حسب الـ nextStep
```

---

### الخطوة 7: التحقق

1. **شغّل `ng build`** — لازم يعدي بدون errors
2. **افتح الـ Application في المتصفح** وافتح DevTools → Application → Local Storage
3. **تأكد إن localStorage فيه `refreshToken` بس** — مفيش accessToken ولا role ولا nextStepEnum
4. **جرب الـ Login Flow كامل** (mobile → OTP → password → home)
5. **جرب Refresh الصفحة** — المفروض يعمل refresh-login ويرجعك لنفس المكان
6. **جرب فتح صفحة الـ Landing Page وأنت logged in** — المفروض يسمحلك
