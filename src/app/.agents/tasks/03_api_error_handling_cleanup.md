# Task 3: تنظيف الـ Error Handling — إزالة الـ Duplicate Toasts

## الهدف
الـ `globalHandlerInterceptor` بالفعل بيعرض toast لكل API error. الـ Components لازم تبطّل تعرض toasts خاصة بيها عشان المستخدم ما يشوفش رسالتين. بدل كده، الـ Components هتعمل بس logic (مثل disable button أو reset form) — مش toast.

## لا يعتمد على تاسكات تانية — ممكن يتنفذ بشكل مستقل.

---

## الخطوات

### الخطوة 1: فهم الـ `globalHandlerInterceptor` الحالي

**الملف:** `src/app/core/interceptor/global-handler.interceptor.ts`

**ازاي بيشتغل دلوقتي:**
- لو الـ error 401 → بيعمل skip (الـ auth interceptor بيتعامل معاها)
- لو الـ error فيه `error.message` (string) → بيعمل `toastr.error(error.message)`
- لو الـ error فيه `error.errors` (object) → بيعمل loop وبيعرض كل error
- بعد كده بيعمل `throwError()` بنسخة من الـ error مع `error: null`

**المشكلة:** الـ Components لسه بتعمل check على `err?.error` — صحيح الـ interceptor حطها `null` فـ الـ check مش هينجح في أغلب الحالات، لكن الـ Pattern لسه مكرر في 15+ ملف ومبيعملش حاجة مفيدة.

---

### الخطوة 2: تنظيف الـ Error Handlers من كل الـ Components

**القاعدة:** في كل component، الـ error callback يبقى واحد من اتنين:
1. **فاضي تماماً** (لو مش محتاج يعمل أي حاجة بعد الـ error)
2. **بيعمل logic بس** (مثل `this.isLoading = false`) — **بدون** `toastr.error()`

**الملفات والتعديلات:**

#### ملف 1: `src/app/features/doctor/auth/doctor-login/doctor-login.component.ts`

ابحث عن الـ error handler في `submit()` (حوالي سطر 150-168):
```typescript
// القديم:
error: (err) => {
    const apiError = err?.error;
    if (apiError?.message) {
        this.toaster.error(apiError.message);
        return;
    }
    if (apiError?.errors) {
        Object.entries(apiError.errors).forEach(
            ([key, messages]: [string, any]) => {
                messages.forEach((msg: string) => {
                    this.toaster.error(`${key} : ${msg}`);
                });
            },
        );
    }
},

// الجديد:
error: () => {
    // الـ globalHandlerInterceptor بيعرض الـ error toast تلقائياً
},
```

#### ملف 2: `src/app/features/doctor/auth/doctor-otp-confirm/doctor-otp-confirm.component.ts`

ابحث عن الـ error handler في `submitOtp()`:
```typescript
// القديم (حوالي سطر 119-136):
error: (err) => {
    const apiError = err?.error;
    if (apiError?.message) { ... }
    if (apiError?.errors) { ... }
},

// الجديد:
error: () => {},
```

#### ملف 3: `src/app/features/doctor/auth/doctor-password/doctor-password.component.ts`

فيه **2** error handlers — واحد في `loginWithPattern()` وواحد في `createPassword()`:
```typescript
// في loginWithPattern() — حوالي سطر 240-258:
// القديم:
error: (err) => { ... toastr.error ... }
// الجديد:
error: () => {},

// في createPassword() — حوالي سطر 298-316:
// القديم:
error: (err) => { ... toastr.error ... }
// الجديد:
error: () => {},
```

#### ملف 4: `src/app/features/doctor/auth/doctor-register-step1/doctor-register-step1.component.ts`

```typescript
// في save() — حوالي سطر 264-278:
// القديم:
error: (err) => { ... toastr.error ... }
// الجديد:
error: () => {},
```

#### ملف 5: `src/app/features/doctor/auth/doctor-register-step2/doctor-register-step2.component.ts`

```typescript
// في save() — حوالي سطر 270-285:
// القديم:
error: (err) => { ... toastr.error ... }
// الجديد:
error: () => {},
```

#### ملف 6: `src/app/features/doctor/auth/doctor-register-step3/doctor-register-step3.component.ts`

```typescript
// في submit/save — حوالي سطر 255-269:
// القديم:
error: (err) => { ... toastr.error ... }
// الجديد:
error: () => {},
```

#### ملف 7: `src/app/features/patient/auth/patient-login/patient-login.component.ts`

```typescript
// في submit() error handler:
// القديم:
error: (err) => { ... toastr.error ... }
// الجديد:
error: () => {},
```

#### ملف 8: `src/app/features/patient/auth/patient-otp-confirm/patient-otp-confirm.component.ts`

```typescript
// في submitOtp() — حوالي سطر 115-132:
// القديم:
error: (err) => { ... toastr.error ... }
// الجديد:
error: () => {},
```

#### ملف 9: `src/app/features/patient/auth/patient-password/patient-password.component.ts`

فيه **2** error handlers:
```typescript
// في login() و createPassword():
// القديم:
error: (err) => { ... toastr.error ... }
// الجديد:
error: () => {},
```

#### ملف 10: `src/app/features/patient/auth/basic-info/basic-info.component.ts`

```typescript
// في save() — حوالي سطر 81-98:
// القديم:
error: (err) => {
    const apiError = err?.error;
    if (apiError?.message) {
        this.toastr.error(apiError.message);
        return;
    }
    if (apiError?.errors) {
        Object.entries(apiError.errors).forEach(
            ([key, messages]: [string, any]) => {
                messages.forEach((msg: string) => {
                    this.toastr.error(`${key} : ${msg}`);
                });
            },
        );
    }
},

// الجديد:
error: () => {},
```

---

### الخطوة 3: إضافة Error Handler للـ `forget-password.component.ts`

**الملف:** `src/app/features/doctor/auth/forget-password/forget-password.component.ts`

الـ `submit()` method مفيش فيها error handler أصلاً! أضف واحد فاضي:
```typescript
// القديم (سطر 57-82):
this.doctorAuthService.loginMobile(this.mobileForm.value.mobile).subscribe({
    next: (res: any) => {
        // ... existing code
    },
});

// الجديد:
this.doctorAuthService.loginMobile(this.mobileForm.value.mobile).subscribe({
    next: (res: any) => {
        // ... existing code (لا تغيّره)
    },
    error: () => {
        // الـ globalHandlerInterceptor بيعرض الـ error toast تلقائياً
    },
});
```

---

### الخطوة 4: تنظيف الـ `ToastrService` imports غير المستخدمة

بعد ما تمسح كل الـ `toastr.error()` calls من الـ error handlers، شوف لو فيه components لسه بتستخدم `ToastrService` في مكان تاني (مثلاً `toastr.success()` في الـ next handler). **لو مفيش** — امسح الـ import والـ injection:

**⚠️ تحذير:** بعض الـ Components لسه بتستخدم `toastr.success()` في الـ next handler (مثل "OTP Sent Successfully"). **ما تمسحش** `ToastrService` من الـ Components دي.

**الـ Components اللي ممكن تشيل منهم ToastrService (لو مش مستخدم في success cases):**
- `basic-info.component.ts` — شوف لو فيه `toastr.success` → لو مفيش، امسح
- `select-profile.component.ts` — مفيش toastr أصلاً
- `wating-for-acctivation.component.ts` — مفيش toastr أصلاً

---

### الخطوة 5: التحقق

1. **شغّل `ng build`** — لازم يعدي بدون errors
2. **جرب أي API error** (مثلاً ادخل رقم موبايل غلط):
   - لازم تشوف **toast واحد بس** (من الـ Interceptor)
   - لو شفت **2 toasts** معناه إن فيه component لسه بيعمل duplicate
3. **ابحث في كل الملفات اللي عدّلتها** عن `toastr.error` — لازم يكون **صفر** في الـ error handlers
