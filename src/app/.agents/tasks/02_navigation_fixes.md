# Task 2: إصلاح مشاكل الـ Navigation

## الهدف
إصلاح 3 مشاكل Critical في الـ Navigation:
1. إزالة الـ Redirect Guard من الـ Landing Page
2. إضافة `replaceUrl: true` لكل Auth navigations
3. إصلاح الـ `clearLocalStorage()` في كل component

## يعتمد على
Task 1 (Auth State Refactor) — لازم يخلص الأول عشان الـ Guards تشتغل مع الـ Signals.

---

## الخطوات

### الخطوة 1: إزالة الـ Redirect Guard من الـ Landing Page

**الملف:** `src/app/app.routes.ts`

**التعديل:** في سطر 21، امسح `canActivate: [redirectGuardGuard]` من الـ Landing Page route:

```typescript
// قبل:
{
    path: '',
    canActivate: [redirectGuardGuard],
    loadChildren: () =>
        import('./features/landing-page/landing-page.routes').then(
            (m) => m.landing,
        ),
},

// بعد:
{
    path: '',
    loadChildren: () =>
        import('./features/landing-page/landing-page.routes').then(
            (m) => m.landing,
        ),
},
```

**وبعدين:** لو الـ import `redirectGuardGuard` مش مستخدم في أي route تاني (وهو مش مستخدم — الأسطر 7 و 14 فيهم الـ guard معلّق)، امسح الـ import في سطر 2:
```typescript
// امسح السطر ده:
import { redirectGuardGuard } from './core/guards/redirect-guard.guard';
```

**ملحوظة:** ما تمسحش ملف `redirect-guard.guard.ts` نفسه — ممكن يحتاجوه بعدين.

---

### الخطوة 2: إضافة `replaceUrl: true` لكل Auth navigations

**القاعدة:** أي `router.navigate()` في Auth flow (login, OTP, password, registration, forget-password) لازم يكون فيه `{ replaceUrl: true }`.

**الملفات والأسطر:**

#### ملف 1: `src/app/features/doctor/auth/doctor-login/doctor-login.component.ts`
```typescript
// سطر 120 — بعد OTP:
this.route.navigate(['doctor/auth/verify-otp']);
// غيّره لـ:
this.route.navigate(['doctor/auth/verify-otp'], { replaceUrl: true });

// سطر 123 — بعد Login:
this.route.navigate(['doctor/auth/password']);
// غيّره لـ:
this.route.navigate(['doctor/auth/password'], { replaceUrl: true });

// سطر 132 — بعد OTP Resend:
this.route.navigate(['doctor/auth/verify-otp']);
// غيّره لـ:
this.route.navigate(['doctor/auth/verify-otp'], { replaceUrl: true });

// سطر 139 — بعد CreatePassword:
this.route.navigate(['doctor/auth/password']);
// غيّره لـ:
this.route.navigate(['doctor/auth/password'], { replaceUrl: true });

// سطر 143 — بعد OpenHome:
this.route.navigate(['doctor/home']);
// غيّره لـ:
this.route.navigate(['doctor/home'], { replaceUrl: true });
```

#### ملف 2: `src/app/features/doctor/auth/doctor-otp-confirm/doctor-otp-confirm.component.ts`
```typescript
// سطر 116 — بعد OTP Confirm:
this.route.navigate(['doctor/auth/password']);
// غيّره لـ:
this.route.navigate(['doctor/auth/password'], { replaceUrl: true });
```

#### ملف 3: `src/app/features/doctor/auth/doctor-password/doctor-password.component.ts`
```typescript
// ابحث عن كل this.route.navigate([...]) في الملف — فيه حوالي 10 أماكن
// كلهم لازم يبقى فيهم { replaceUrl: true }

// أمثلة:
this.route.navigate(['doctor/auth/register/basicInfo']);
// → this.route.navigate(['doctor/auth/register/basicInfo'], { replaceUrl: true });

this.route.navigate(['doctor/auth/register/createProfile']);
// → this.route.navigate(['doctor/auth/register/createProfile'], { replaceUrl: true });

this.route.navigate(['doctor/auth/register/createCertificates']);
// → this.route.navigate(['doctor/auth/register/createCertificates'], { replaceUrl: true });

this.route.navigate(['doctor/auth/register/appointment']);
// → this.route.navigate(['doctor/auth/register/appointment'], { replaceUrl: true });

this.route.navigate(['doctor/auth/watingForAcctivation']);
// → this.route.navigate(['doctor/auth/watingForAcctivation'], { replaceUrl: true });

this.route.navigate(['doctor/home']);
// → this.route.navigate(['doctor/home'], { replaceUrl: true });
```

#### ملف 4: `src/app/features/doctor/auth/doctor-register-step1/doctor-register-step1.component.ts`
```typescript
// ابحث عن كل this.route.navigate — غيّرهم كلهم
// مثال:
this.route.navigate(['doctor/auth/register/createProfile']);
// → this.route.navigate(['doctor/auth/register/createProfile'], { replaceUrl: true });
```

#### ملف 5: `src/app/features/doctor/auth/doctor-register-step2/doctor-register-step2.component.ts`
```typescript
// نفس الـ pattern — غيّر كل navigate
this.route.navigate(['doctor/auth/register/createCertificates']);
// → this.route.navigate(['doctor/auth/register/createCertificates'], { replaceUrl: true });
```

#### ملف 6: `src/app/features/doctor/auth/doctor-register-step3/doctor-register-step3.component.ts`
```typescript
// غيّر كل navigate
this.route.navigate(['doctor/auth/watingForAcctivation']);
// → this.route.navigate(['doctor/auth/watingForAcctivation'], { replaceUrl: true });
```

#### ملف 7: `src/app/features/doctor/auth/forget-password/forget-password.component.ts`
```typescript
// غيّر كل navigate في submit() (أسطر 66, 69, 72, 75)
this.route.navigate(['doctor/auth/verify-otp']);
// → this.route.navigate(['doctor/auth/verify-otp'], { replaceUrl: true });

this.route.navigate(['doctor/auth/password']);
// → this.route.navigate(['doctor/auth/password'], { replaceUrl: true });

this.route.navigate(['doctor/home']);
// → this.route.navigate(['doctor/home'], { replaceUrl: true });
```

#### ملف 8: `src/app/features/patient/auth/patient-login/patient-login.component.ts`
```typescript
// غيّر كل navigate في submit() — نفس الـ pattern بالظبط
// كل navigate يبقى فيه { replaceUrl: true }
```

#### ملف 9: `src/app/features/patient/auth/patient-otp-confirm/patient-otp-confirm.component.ts`
```typescript
// سطر 112:
this.route.navigate(['patient/auth/password']);
// → this.route.navigate(['patient/auth/password'], { replaceUrl: true });
```

#### ملف 10: `src/app/features/patient/auth/patient-password/patient-password.component.ts`
```typescript
// غيّر كل navigate في login() و createPassword()
// كلهم يبقى فيهم { replaceUrl: true }
```

#### ملف 11: `src/app/features/patient/auth/basic-info/basic-info.component.ts`
```typescript
// سطر 79:
this.route.navigate(['patient/auth/medical-history']);
// → this.route.navigate(['patient/auth/medical-history'], { replaceUrl: true });
```

#### ملف 12: `src/app/features/patient/auth/select-profile/select-profile.component.ts`
```typescript
// سطر 29:
this.route.navigate(['patient/home']);
// → this.route.navigate(['patient/home'], { replaceUrl: true });
```

---

### الخطوة 3: إصلاح كل `clearLocalStorage()` methods

**القاعدة:** استبدال `localStorage.clear()` بـ `this.localStorageService.clearUserData()`.

**كل الملفات اللي فيها `clearLocalStorage()` method:**

```typescript
// Pattern القديم الموجود في كل auth component:
clearLocalStorage() {
    this.localStorageService.clearUserData();
    localStorage.clear();              // ← امسح السطر ده
    this.route.navigate(['/']);
}

// الـ Pattern الجديد:
clearLocalStorage() {
    this.localStorageService.clearUserData();
    this.route.navigate(['/'], { replaceUrl: true });
}
```

**الملفات:**
1. `doctor-login.component.ts` — أسطر 181-184
2. `doctor-otp-confirm.component.ts` — عند `clearLocalStorage()`
3. `doctor-password.component.ts` — عند `clearLocalStorage()`
4. `doctor-register-step1.component.ts` — عند `clearLocalStorage()`
5. `doctor-register-step2.component.ts` — عند `clearLocalStorage()`
6. `doctor-register-step3.component.ts` — عند `clearLocalStorage()` + أسطر 238, 247
7. `wating-for-acctivation.component.ts` — أسطر 19-23
8. `forget-password.component.ts` — أسطر 85-89
9. `patient-login.component.ts` — عند `clearLocalStorage()`
10. `patient-otp-confirm.component.ts` — أسطر 145-152
11. `patient-password.component.ts` — عند `clearLocalStorage()`
12. `basic-info.component.ts` — أسطر 102-106
13. `select-profile.component.ts` — أسطر 34-38

**⚠️ حالة خاصة — `doctor-register-step3.component.ts`:**
في أسطر 238 و 247، بعد رفع الشهادات بنجاح:
```typescript
// القديم:
localStorage.clear();
this.route.navigate(['doctor/auth/watingForAcctivation']);

// الجديد:
this.localStorageService.setNextStepEnum('WaitForAcctivation');
this.route.navigate(['doctor/auth/watingForAcctivation'], { replaceUrl: true });
```
**لا تمسح الـ user data هنا!** الدكتور لسه logged in، بس مستني activation.

---

### الخطوة 4: إصلاح `doctorGuard` ليستخدم `createUrlTree`

**الملف:** `src/app/core/guards/doctor.guard.ts`

**التعديل:**
```typescript
// القديم:
if (!localStorageService.role() || localStorageService.role() !== 'Doctor') {
    router.navigate(['/doctor/auth/login']);
    return false;
}

// الجديد:
if (!localStorageService.role() || localStorageService.role() !== 'Doctor') {
    return router.createUrlTree(['/doctor/auth/login']);
}
```

---

### الخطوة 5: التحقق

1. **شغّل `ng build`** — لازم يعدي بدون errors
2. **جرب الـ Login flow:**
   - ادخل رقمك → OTP → Password → Home
   - داس Back في المتصفح → **المفروض ما يرجعكش لصفحة الـ OTP أو الـ Password**
3. **جرب الـ Landing Page وأنت logged in:**
   - افتح `/` مباشرة → **المفروض يوديك الـ Landing Page مش Home**
4. **جرب Logout:**
   - اضغط Logout → تأكد إن localStorage فاضي تماماً (حتى الـ refreshToken اتمسح)
   - داس Back → **المفروض ما يرجعكش لأي صفحة authenticated**
