# 🔌 تقرير مشاكل استدعاءات الـ API — TeleSeha Web

> **تاريخ المراجعة:** 2026-05-22
> **النطاق:** كل ملفات الـ Services, Interceptors, و الـ Components اللي بتعمل API Calls

---

## المشكلة #1 — Duplicate Error Toasts (المستخدم بيشوف رسالتين خطأ) (Critical)

### الملفات المتأثرة
| الملف | الأسطر |
|---|---|
| `doctor-otp-confirm.component.ts` | 119-136 |
| `doctor-password.component.ts` | 240-258, 298-316 |
| `doctor-login.component.ts` | 150-168 |
| `doctor-register-step1.component.ts` | 264-278 |
| `doctor-register-step2.component.ts` | 270-285 |
| `doctor-register-step3.component.ts` | 255-269 |
| `patient-login.component.ts` | 153-170 |
| `patient-otp-confirm.component.ts` | 115-132 |
| `patient-password.component.ts` | 225-282 |
| `basic-info.component.ts` | 81-98 |
| `forget-password.component.ts` | *لا يوجد error handler — مشكلة أخرى* |

### الوصف
الـ `globalHandlerInterceptor` (سطر 125-130) بيعمل `toastr.error()` لكل API Error **ثم** بيعمل `throwError()` بنسخة من الـ Error بعد ما يحط `error: null` فيها. الفكرة كانت إن الـ Components ما تعرضش toast تاني.

**المشكلة:** الـ Components لسه بتعمل check على `err?.error` وبتعرض toasts خاصة بيها. صحيح إن الـ Interceptor بيحط `error: null` (سطر 133-138)، بس الـ Components مش بتعمل check عليها بشكل consistent:

```typescript
// في الـ Components — الـ error handler النمطي:
error: (err) => {
    const apiError = err?.error;  // ← الـ Interceptor حطها null
    if (apiError?.message) {      // ← ده مش هيتنفذ لأن apiError = null
        this.toastr.error(apiError.message);
        return;
    }
    // ...
}
```

فعلياً الـ silenced error في الـ interceptor بتمنع الـ duplicate **في معظم الحالات**، لكن:
1. الـ Pattern ده مكرر في 15+ ملف وبيضيع وقت الـ developer
2. لو أي component نسيت تستخدم نفس الـ pattern بالظبط، هتلاقي duplicate toast
3. الـ `globalHandlerInterceptor` بيعمل skip لـ 401 (سطر 30-32)، فالـ Components هتحتاج تعمل handle ليها manually

### الحل المقترح
**خيار 1 (المفضل):** شيل كل الـ error handlers من الـ Components واعتمد على الـ `globalHandlerInterceptor` بالكامل. الـ Components تعمل بس `error: () => {}` (أو error callback فاضي).

**خيار 2:** لو في حالات محتاج فيها الـ Component يتعامل مع الـ error بشكل خاص — استخدم `SKIP_GLOBAL_ERROR_HANDLING` HttpContext:
```typescript
this.http.get('/api/example', {
    context: new HttpContext().set(SKIP_GLOBAL_ERROR_HANDLING, true)
})
```

### الأولوية: 🔴 Critical

---

## المشكلة #2 — عدم إلغاء الـ Subscriptions (Memory Leaks) (High)

### الملفات المتأثرة
**كل** الـ Components اللي بتعمل `.subscribe()` بدون أي آلية لإلغاء الـ Subscription:

| الملف | عدد الـ subscriptions الغير مُدارة |
|---|---|
| `doctor-register-step1.component.ts` | 4 (specialties, enum, jobTitles, save) |
| `doctor-register-step2.component.ts` | 4 (infoLists, dataList, loadExisting, save) + 2 valueChanges |
| `doctor-register-step3.component.ts` | 2 (loadExisting, save) |
| `doctor-password.component.ts` | 2 (login, createPassword) |
| `patient-password.component.ts` | 2 (login, createPassword) |
| `header.component.ts` | 1 (lang$ subscription في constructor) |
| `doctor-hero-section-home-page.component.ts` | 1+ |
| كل الـ home sections | 1-3 لكل component |

### الوصف
**مشكلتين:**

**أ) الـ HTTP Subscriptions:** Angular's `HttpClient` subscriptions بتكمل تلقائياً بعد أول response/error، فدي مش memory leak حقيقي. **لكن** لو المستخدم عمل navigate بعيد قبل ما الـ response يوصل، الـ callback لسه هيتنفذ (ممكن يعمل navigate لصفحة تانية والمستخدم يتفاجأ).

**ب) الـ `valueChanges` Subscriptions في `doctor-register-step2.component.ts` (سطر 153, 166):**
```typescript
this.basicInfoForm.get('Country')?.valueChanges.subscribe(...)
this.basicInfoForm.get('State')?.valueChanges.subscribe(...)
```
دي Observable ما بتكملش لوحدها — هتفضل active طول ما الـ Component موجود. لو الـ Component اتدمر واتعمل recreate، الـ subscriptions القديمة هتفضل شغالة → **Memory Leak حقيقي**.

**ج) الـ `lang$` في `header.component.ts` (سطر 41):**
```typescript
this.translateService.lang$.subscribe(() => { ... });
```
الـ Header component طول عمره موجود فمش هيسبب leak، لكن الـ pattern لسه غلط.

### الحل المقترح
استخدام `takeUntilDestroyed()` من Angular 16+:
```typescript
import { DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

private destroyRef = inject(DestroyRef);

// في أي subscription:
this.basicInfoForm.get('Country')?.valueChanges
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(...);
```

### الأولوية: 🟠 High

---

## المشكلة #3 — الـ Forget Password Component بدون Error Handling (High)

### الملف
`src/app/features/doctor/auth/forget-password/forget-password.component.ts` — سطر 57-82

### الوصف
الـ `submit()` method بتعمل `loginMobile().subscribe()` بـ `next` handler بس — **ما فيش `error` handler**:
```typescript
this.doctorAuthService.loginMobile(this.mobileForm.value.mobile).subscribe({
    next: (res: any) => { ... },
    // ← لا يوجد error handler!
});
```

صحيح إن الـ `globalHandlerInterceptor` هيعرض toast، بس الزرار هيفضل enabled والمستخدم مش هيفهم إيه اللي حصل لأن مفيش أي feedback في الـ UI (مثلاً disable الزرار أو إخفاء spinner خاص).

### الأولوية: 🟠 High

---

## المشكلة #4 — الـ OTP Validation معلّقة (Commented Out) (High)

### الملفات
- `doctor-otp-confirm.component.ts` — سطر 97-100
- `patient-otp-confirm.component.ts` — سطر 96-99

### الوصف
الـ OTP validation (التحقق من إن المستخدم كتب 6 أرقام) معلّقة:
```typescript
// if (code.length < 6) {
//   this.showError = true;
//   return;
// }
```

ده معناه إن المستخدم يقدر يبعت OTP فاضي أو ناقص للسيرفر — اللي هيرد بـ error. ده بيضيع API call مالهاش لازمة وبيدي تجربة سيئة.

### الحل المقترح
إرجاع الـ validation دي:
```typescript
if (code.length < 6) {
    this.showError = true;
    return;
}
```

### الأولوية: 🟠 High

---

## المشكلة #5 — الـ Patient Basic Info بدون Form Validation قبل الإرسال (High)

### الملف
`src/app/features/patient/auth/basic-info/basic-info.component.ts` — سطر 70-73

### الوصف
الـ validation check معلّقة:
```typescript
// if (this.basicInfoForm.invalid) {
//   this.basicInfoForm.markAllAsTouched();
//   return;
// }
```

ده معناه إن المريض يقدر يبعت Form فاضي بدون Name أو BirthDate.

### الأولوية: 🟠 High

---

## المشكلة #6 — SignalR Service بـ URL مكتوبة يدوياً (Hardcoded) (Medium)

### الملف
`src/app/shared/services/signalr.service.ts` — سطر 23

### الوصف
```typescript
.withUrl('https://yourbackend.com/hub', { withCredentials: true })
```

الـ URL دي placeholder مش حقيقية — ده معناه إن الـ SignalR مش شغال أصلاً. في نفس الوقت الـ `Environment` config فيها URLs حقيقية للـ SignalR:
```typescript
// environment.development.ts
patientnotificationHubUrl = 'https://localhost:7298/hubs/patient_notification';
doctornotificationHubUrl = 'https://localhost:7298/hubs/doctor_notification';
chatHubUrl = 'https://localhost:7298/hubs/chat';
```

يبدو إن الـ `NotificationService` هي اللي بتستخدم الـ URLs الصح، والـ `SignalRService` ده service قديم مش مستخدم.

### الحل المقترح
تأكيد إن `SignalRService` مش مستخدم في أي مكان تاني ومسحها، أو لو مستخدمة → تحديث الـ URL لتستخدم `Environment`.

### الأولوية: 🟡 Medium

---

## المشكلة #7 — استخدام `localStorage` مباشرة بدل الـ Service (Medium)

### الملفات
- `auth.interceptor.ts` — سطر 58: `localStorage.clear()`
- `auth.interceptor.ts` — سطر 67: `localStorage.clear()`
- `doctor-register-step3.component.ts` — سطر 238, 247: `localStorage.clear()`
- `doctor-password.component.ts` — سطر 384: `localStorage.clear()`

### الوصف
الكود بيستخدم `localStorage.clear()` مباشرة بدل ما يستخدم `localStorageService.clearUserData()`. ده بيسبب:
1. الـ `BehaviorSubject` values في الـ service (مثل `patientName$`, `doctorName$`) ما بتتحدثش → الـ UI مش هيعكس التغيير
2. الـ Signals (`role`, `userId`) ما بتتغيرش → Guards هتفضل شايفة إن المستخدم logged in
3. Inconsistency — بعض الأماكن بتستخدم الـ service وبعضها بتستخدم native API

### الحل المقترح
استبدال كل `localStorage.clear()` بـ `localStorageService.clearUserData()` + مسح الـ items الإضافية اللي محتاجة:
```typescript
this.localStorageService.clearUserData();
this.localStorageService.remove('refreshToken');
this.localStorageService.remove('nextStepEnum');
this.localStorageService.remove('mobile');
// etc.
```

### الأولوية: 🟡 Medium

---

## المشكلة #8 — الـ Loading Interceptor مش بيعمل Reference Counting (Medium)

### الملف
`src/app/core/interceptor/loading.interceptor.ts` — سطر 32-36

### الوصف
```typescript
spinner.show();
return next(req).pipe(finalize(() => spinner.hide()));
```

لو فيه 3 API calls شغالين في نفس الوقت:
- الأول `show()` → 1
- التاني `show()` → 2
- الأول يخلص → `hide()` ← **الـ Spinner اختفى** وباقي request لسه شغال!

### الحل المقترح
```typescript
let activeRequests = 0;

spinner.show();
activeRequests++;

return next(req).pipe(
    finalize(() => {
        activeRequests--;
        if (activeRequests === 0) {
            spinner.hide();
        }
    })
);
```

### الأولوية: 🟡 Medium

---

## المشكلة #9 — Console.log statements في الـ Production Code (Low)

### الملفات المتأثرة
**كل** الـ auth components تقريباً:

| الملف | عدد الـ console.log |
|---|---|
| `localstorage.service.ts` | 1 (سطر 43 — بيطبع الـ token!) |
| `doctor-login.component.ts` | 2 (سطر 112-113) |
| `doctor-otp-confirm.component.ts` | 2 (سطر 103-104) |
| `doctor-password.component.ts` | 5+ |
| `doctor-register-step1.component.ts` | 5+ |
| `doctor-register-step2.component.ts` | 3+ |
| `app.component.ts` | 1 (سطر 25 — بيطبع الـ JWT details!) |
| `basic-info.component.ts` | 1 |

### الوصف
**خطر أمني:** الـ `localstorage.service.ts:43` بيطبع الـ Access Token في الـ Console، والـ `app.component.ts:25` بيطبع الـ JWT decoded payload. أي حد يفتح DevTools يقدر يشوفهم.

### الحل المقترح
مسح كل الـ `console.log` statements — أو على الأقل اللي بتطبع بيانات حساسة (tokens, user data).

### الأولوية: 🟢 Low (لكن الـ security aspect يخليه Medium)

---

## المشكلة #10 — الـ `RefreshTokenService` Return Type غلط (Medium)

### الملف
`src/app/shared/services/refresh-token.service.ts` — سطر 12-16

### الوصف
```typescript
refreshLogin(refreshToken: string) {
    return this.http.post<{ accessToken: string }>(...);
}
```

الـ Return Type معرفة كـ `{ accessToken: string }` بس في الـ `auth.interceptor.ts:40`:
```typescript
const newAccessToken = res.data.accessToken;  // res.data ← مش res مباشرة
const newRefreshToken = res.data.refreshToken; // refreshToken مش في الـ type
```

الـ Interceptor بيستخدم `res.data.accessToken` و `res.data.refreshToken` — ده يعني الـ API بترجع `ResponseDto<{accessToken, refreshToken}>` envelope. لكن الـ Service Type بيقول إن الـ response هو `{ accessToken: string }` مباشرة.

### الحل المقترح
تعديل الـ Type ليتوافق مع الـ API:
```typescript
refreshLogin(refreshToken: string): Observable<ResponseDto<{ accessToken: string, refreshToken: string }>> {
    ...
}
```

### الأولوية: 🟡 Medium

---

## ملخص الأولويات

| الأولوية | العدد | الوصف |
|---|---|---|
| 🔴 Critical | 1 | Duplicate error toasts pattern |
| 🟠 High | 4 | Memory leaks, missing error handlers, disabled validations |
| 🟡 Medium | 4 | localStorage misuse, spinner counting, SignalR URL, type mismatch |
| 🟢 Low | 1 | Console.log statements (مع جانب أمني) |
