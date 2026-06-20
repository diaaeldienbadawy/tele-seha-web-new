# 🧭 تقرير مشاكل الـ Navigation — TeleSeha Web

> **تاريخ المراجعة:** 2026-05-22
> **النطاق:** كل ملفات الـ Guards, Routes, و Auth Components لكل من Doctor و Patient

---

## المشكلة #1 — إجبار المستخدم على مغادرة الـ Landing Page (Critical)

### الملف
`src/app/core/guards/redirect-guard.guard.ts` — سطر 18-26

### الوصف
الـ `redirectGuardGuard` مُفعَّل على الـ Landing Page routes في `app.routes.ts:21`. أول ما يفتح المستخدم الصفحة الرئيسية، الـ Guard بيشيك على الـ `role` في الـ `LocalStorageService`، ولو لقى Role (سواء `Doctor` أو `Patient`) بيوديه **إجبارياً** على صفحة الـ Home بتاعته.

**المشكلة:** المستخدم ممكن يكون عايز يتصفح الـ Landing Page، يشوف التخصصات، يدور على دكتور، أو يقرأ الـ About Us — حتى لو هو مسجل دخول. السلوك الحالي بيمنعه من ده تماماً.

### الكود المسبب
```typescript
// redirect-guard.guard.ts:18-26
if (localStorageService.role()) {
    if (localStorageService.role() === 'Doctor') {
      return router.navigate(['/doctor/home']);  // ← إجبار
    }
    if (localStorageService.role() === 'Patient') {
      return router.navigate(['/patient/home']); // ← إجبار
    }
}
```

### الحل المقترح
**إزالة الـ Guard من الـ Landing Page routes تماماً**، أو تحويله ليكون اختياري (مثلاً يعرض Banner أو زرار "Go to Dashboard" بدل الإجبار). الـ Guard ده مفروض يتشال من `app.routes.ts:21`:
```typescript
// app.routes.ts — قبل
{ path: '', canActivate: [redirectGuardGuard], loadChildren: ... }

// app.routes.ts — بعد
{ path: '', loadChildren: ... }  // ← لا حاجة لـ Guard هنا
```

### الأولوية: 🔴 Critical

---

## المشكلة #2 — زر الرجوع (Back) بيرجع لصفحات مفروض ما يرجعلهاش (Critical)

### الملفات المتأثرة
| الملف | الأسطر | المشكلة |
|---|---|---|
| `doctor-login.component.ts` | 120, 123, 132, 139, 143 | كل `route.navigate()` بدون `replaceUrl` |
| `doctor-otp-confirm.component.ts` | 116 | navigate لصفحة Password بدون replace |
| `doctor-password.component.ts` | 211-231, 283-293 | كل navigate في login و createPassword |
| `patient-login.component.ts` | 116, 119, 128, 135, 139, 142, 146 | نفس المشكلة |
| `patient-otp-confirm.component.ts` | 112 | navigate لصفحة Password بدون replace |
| `patient-password.component.ts` | 207, 210, 213, 216, 219, 261-262 | نفس المشكلة |
| `select-profile.component.ts` | 29 | navigate لـ home بدون replace |

### الوصف
في كل الـ Auth flow (Login → OTP → Password → Registration Steps → Home)، كل عمليات الـ `router.navigate()` بتتم **بدون** `{ replaceUrl: true }`. ده معناه إن كل صفحة بتتخزن في الـ Browser History.

**السيناريو:** المستخدم دخل رقمه → راح OTP → كتب الـ Password → وصل الـ Home. لو داس Back 3 مرات هيرجع لصفحة الـ OTP وبعدين الـ Login — ودي صفحات مفروض ما يرجعلهاش أبداً بعد ما خلص.

### الحل المقترح
إضافة `{ replaceUrl: true }` لكل `router.navigate()` في الـ Auth Flow بالكامل. مثال:
```typescript
// قبل
this.route.navigate(['doctor/auth/verify-otp']);

// بعد
this.route.navigate(['doctor/auth/verify-otp'], { replaceUrl: true });
```

**ملحوظة مهمة:** ده لازم يتعمل في **كل** الملفات المذكورة أعلاه بدون استثناء.

### الأولوية: 🔴 Critical

---

## المشكلة #3 — الـ Auth Redirect Guards بتتجاهل حالات مهمة (High)

### الملفات
- `src/app/core/guards/doctor-auth-redirect.guard.ts`
- `src/app/core/guards/patient-auth-redirect.guard.ts`

### الوصف
الـ `doctorAuthRedirectGuard` و `patientAuthRedirectGuard` بيعتمدوا على `nextStepEnum` المحفوظ في الـ LocalStorage عشان يحددوا الصفحة اللي المستخدم المفروض يكون فيها. المشكلة إن:

1. **الاعتماد على الـ LocalStorage فقط:** الـ `nextStepEnum` ممكن يكون قديم أو غير متزامن مع السيرفر. لو المستخدم فتح tab تاني وكمل خطوة هناك، الـ tab الأول لسه شايل الـ `nextStepEnum` القديم.

2. **الـ Guard بيمسح كل حاجة لو الـ nextStep مش valid (سطر 79-90):** لو لأي سبب الـ `nextStepEnum` اتمسح أو اتغير لقيمة غير متوقعة، الـ Guard بيعمل `clearUserData()` ويمسح كل حاجة ويوديه Login — حتى لو الـ Access Token صالح والمستخدم logged in فعلاً. ده سلوك مُحبط جداً.

3. **حالة `INextStepEnum.Login`:** في السطر 46-47 في الـ doctor guard، لما الـ `nextStep === Login` بيوديه لصفحة `/doctor/auth/password`. ده منطقي بس الاسم misleading — المستخدم عنده Password بالفعل فالاسم Login مناسب، بس التوجيه لصفحة password صحيح.

### الحل المقترح
- في حالة `nextStep` فاضي أو غير valid، بدل ما نمسح كل حاجة → نتحقق الأول من صلاحية الـ Access Token عبر API call (أو على الأقل نشيك على الـ JWT expiry locally).
- لو الـ Token صالح بس الـ `nextStep` مش موجود → نعتبر إن المستخدم مسجل دخول ونوديه Home.

### الأولوية: 🟠 High

---

## المشكلة #4 — الـ Doctor Register Step 3 بتمسح الـ LocalStorage بالكامل (Critical)

### الملف
`src/app/features/doctor/auth/doctor-register-step3/doctor-register-step3.component.ts` — سطر 238, 247

### الوصف
بعد رفع الشهادات (سواء create أو update)، الكود بيعمل `localStorage.clear()` وبعدين يوديه لصفحة `watingForAcctivation`. المشكلة إن `localStorage.clear()` بيمسح **كل حاجة** بما فيها:
- الـ `accessToken` و `refreshToken`
- الـ `role`
- الـ `doctorId`

ده معناه إن لو الدكتور عمل refresh للصفحة أو حاول يرجع — هيلاقي نفسه logged out تماماً ومش هيقدر يعمل أي حاجة.

### الكود المسبب
```typescript
// doctor-register-step3.component.ts:247
localStorage.clear();  // ← بيمسح كل حاجة!
this.route.navigate(['doctor/auth/watingForAcctivation']);
```

### الحل المقترح
بدل `localStorage.clear()`، نمسح بس الحاجات المتعلقة بالتسجيل:
```typescript
this.localStorageService.remove('createPasswordToken');
this.localStorageService.remove('mobile');
// الخطوة الجاية هي الانتظار
this.localStorageService.set('nextStepEnum', INextStepEnum.WaitForAcctivation);
this.route.navigate(['doctor/auth/watingForAcctivation'], { replaceUrl: true });
```

### الأولوية: 🔴 Critical

---

## المشكلة #5 — `clearUserData()` لا تمسح الـ `refreshToken` (Medium)

### الملف
`src/app/core/services/localstorage.service.ts` — سطر 117-131

### الوصف
الدالة `clearUserData()` بتمسح `accessToken`, `role`, `patientName`, `doctorImage`, `doctorName` — لكنها **ما بتمسحش** الـ `refreshToken`. ده معناه إن بعد عملية Logout (أو لما الـ Guard يمسح البيانات)، الـ `refreshToken` بيفضل موجود في الـ LocalStorage.

**التأثير:** لو الـ Auth Interceptor شاف 401 وحاول يعمل Refresh، هيلاقي `refreshToken` قديم ويحاول يستخدمه — ممكن ينجح ويرجع tokens جديدة للمستخدم اللي المفروض عمل logout!

### الحل المقترح
إضافة `localStorage.removeItem('refreshToken')` داخل `clearUserData()`:
```typescript
clearUserData() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');  // ← إضافة
      localStorage.removeItem('role');
      // ... باقي الحذف
    }
}
```

### الأولوية: 🟡 Medium

---

## المشكلة #6 — Auth Interceptor ما بيعملش Lock على عملية الـ Refresh (High)

### الملف
`src/app/core/interceptor/auth.interceptor.ts` — سطر 37-63

### الوصف
لو فيه 5 API calls بتحصل في نفس الوقت وكلهم رجعوا 401، كل واحد فيهم هيعمل Refresh Token request **مستقل**. ده ممكن يسبب:
1. **Race condition:** أول request بينجح ويجيب token جديد، لكن الباقي بيبعتوا الـ refresh token القديم (اللي اتغير) وبيفشلوا → المستخدم بيتعمله Logout إجباري.
2. **Brute force trigger:** الـ Backend عنده حماية ضد الـ Brute Force (5 محاولات فاشلة → suspend). الـ Multiple refresh requests دي ممكن تتعامل كمحاولات فاشلة.

### الحل المقترح
إضافة Lock pattern بحيث أول 401 بس هو اللي يعمل refresh، والباقي يستنوا:
```typescript
private isRefreshing = false;
private refreshSubject = new BehaviorSubject<string | null>(null);
// أول request يعمل refresh، الباقي يستنوا الـ Subject
```

### الأولوية: 🟠 High

---

## المشكلة #7 — الـ `doctorGuard` بيستخدم `router.navigate()` بدل `UrlTree` (Low)

### الملف
`src/app/core/guards/doctor.guard.ts` — سطر 15, 20

### الوصف
الـ `doctorGuard` بيستخدم `router.navigate()` (Imperative Navigation) بدل ما يرجع `router.createUrlTree()` (Declarative). الـ Angular Best Practice هي استخدام `UrlTree` في الـ Guards — زي ما هو متعمل بالفعل في `patient.guard.ts:20`.

**ملحوظة:** `patientGuard` متعمل صح — بيرجع `router.createUrlTree()`. الـ `doctorGuard` محتاج يتعدل ليتوافق.

### الحل المقترح
```typescript
// قبل
router.navigate(['/doctor/auth/login']);
return false;

// بعد
return router.createUrlTree(['/doctor/auth/login']);
```

### الأولوية: 🟢 Low

---

## المشكلة #8 — عدم وجود `OnInit` interface في كتير من الـ Components (Low)

### الملفات المتأثرة
- `doctor-otp-confirm.component.ts` — عنده `ngOnInit()` بدون `implements OnInit`
- `doctor-password.component.ts` — نفس المشكلة
- `doctor-register-step3.component.ts` — نفس المشكلة
- `patient-password.component.ts` — نفس المشكلة
- `patient-otp-confirm.component.ts` — نفس المشكلة
- `select-profile.component.ts` — نفس المشكلة

### الوصف
الـ Components دي بتعرّف `ngOnInit()` بدون ما تعمل `implements OnInit` في الـ class declaration. ده مش هيسبب Runtime Error بس مخالف للـ Angular conventions وبيضيع الـ Type Safety.

### الأولوية: 🟢 Low

---

## ملخص الأولويات

| الأولوية | العدد | الوصف |
|---|---|---|
| 🔴 Critical | 3 | Redirect إجباري، Back button، localStorage.clear() |
| 🟠 High | 2 | Auth redirect guard، Token refresh race condition |
| 🟡 Medium | 1 | refreshToken لا يتمسح |
| 🟢 Low | 2 | UrlTree pattern، OnInit interface |
