# Task 4: إدارة الـ Subscriptions + إرجاع الـ Validations المعطلة

## الهدف
1. إضافة `takeUntilDestroyed()` لمنع Memory Leaks
2. إرجاع الـ OTP validation اللي معلّقة
3. إرجاع الـ Form validation اللي معلّقة
4. مسح الـ `console.log` statements الحساسة

## لا يعتمد على تاسكات تانية — ممكن يتنفذ بشكل مستقل.

---

## الخطوات

### الخطوة 1: إضافة `takeUntilDestroyed()` في الـ Components اللي فيها `valueChanges`

**⚠️ أهم ملف:** `src/app/features/doctor/auth/doctor-register-step2/doctor-register-step2.component.ts`

الملف ده فيه **memory leak حقيقي** بسبب الـ `valueChanges` subscriptions اللي ما بتخلصش.

**التعديل:**

1. **أضف الـ imports في أعلى الملف:**
```typescript
import { DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
```

2. **أضف الـ `destroyRef` في الـ class:**
```typescript
export class DoctorRegisterStep2Component implements OnInit {
    private destroyRef = inject(DestroyRef);
    // ... باقي الـ properties
```

3. **ابحث عن كل `valueChanges.subscribe`** وأضف `.pipe(takeUntilDestroyed(this.destroyRef))` قبل `.subscribe()`:

```typescript
// القديم (حوالي سطر 153):
this.basicInfoForm.get('Country')?.valueChanges.subscribe((country: any) => {
    // ... existing code
});

// الجديد:
this.basicInfoForm.get('Country')?.valueChanges
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe((country: any) => {
        // ... existing code (لا تغيّره)
    });

// القديم (حوالي سطر 166):
this.basicInfoForm.get('State')?.valueChanges.subscribe((state: any) => {
    // ... existing code
});

// الجديد:
this.basicInfoForm.get('State')?.valueChanges
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe((state: any) => {
        // ... existing code (لا تغيّره)
    });
```

---

### الخطوة 2: إضافة `takeUntilDestroyed()` في `header.component.ts`

**الملف:** `src/app/layouts/header/header.component.ts`

**التعديل:**

1. **أضف الـ imports:**
```typescript
import { DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
```

2. **أضف `destroyRef`:**
```typescript
export class HeaderComponent {
    private destroyRef = inject(DestroyRef);
    // ...
```

3. **عدّل الـ subscription في الـ constructor (سطر 41-44):**
```typescript
// القديم:
constructor(readonly translateService: TranslateServiceService) {
    this.translateService.lang$.subscribe(() => {
        this.menuOpen = false;
        this.dropdownOpen = false;
    });
}

// الجديد:
constructor(readonly translateService: TranslateServiceService) {
    this.translateService.lang$
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
            this.menuOpen = false;
            this.dropdownOpen = false;
        });
}
```

**⚠️ ملحوظة مهمة:** `takeUntilDestroyed()` لازم يتنادى في الـ constructor أو في injection context. لو بتستخدمه في `ngOnInit()` لازم تمرر الـ `destroyRef`:
```typescript
.pipe(takeUntilDestroyed(this.destroyRef))
```

---

### الخطوة 3: إرجاع الـ OTP Validation

**الملف 1:** `src/app/features/doctor/auth/doctor-otp-confirm/doctor-otp-confirm.component.ts`

ابحث عن الـ commented-out validation في `submitOtp()` (حوالي سطر 97-100):
```typescript
// القديم:
// if (code.length < 6) {
//   this.showError = true;
//   return;
// }

// الجديد — شيل الـ comments:
if (code.length < 6) {
    this.showError = true;
    return;
}
```

**الملف 2:** `src/app/features/patient/auth/patient-otp-confirm/patient-otp-confirm.component.ts`

نفس التعديل بالظبط (حوالي سطر 96-99):
```typescript
// شيل الـ comments:
if (code.length < 6) {
    this.showError = true;
    return;
}
```

---

### الخطوة 4: إرجاع الـ Form Validation في `basic-info.component.ts`

**الملف:** `src/app/features/patient/auth/basic-info/basic-info.component.ts`

ابحث عن الـ commented-out validation في `save()` (حوالي سطر 70-73):
```typescript
// القديم:
// if (this.basicInfoForm.invalid) {
//   this.basicInfoForm.markAllAsTouched();
//   return;
// }

// الجديد — شيل الـ comments:
if (this.basicInfoForm.invalid) {
    this.basicInfoForm.markAllAsTouched();
    return;
}
```

---

### الخطوة 5: مسح الـ `console.log` الحساسة

**⚠️ تحذير أمني:** بعض الـ console.log بتطبع tokens و user data في الـ DevTools.

**الملفات والأسطر:**

#### ملف 1: `src/app/core/services/localstorage.service.ts`
```typescript
// ابحث عن console.log اللي بتطبع الـ token — امسحها
// مثال (سطر 43 تقريباً):
console.log('token', token);  // ← امسح السطر ده
```

#### ملف 2: `src/app/app.component.ts`
```typescript
// سطر 25:
console.log(details);  // ← امسح — بيطبع JWT details
```

#### ملف 3: `src/app/features/doctor/auth/doctor-login/doctor-login.component.ts`
```typescript
// أسطر 112-113:
console.log('res', res);              // ← امسح
console.log('resssssssssssssssss', formatted);  // ← امسح
```

#### ملف 4: `src/app/features/doctor/auth/doctor-otp-confirm/doctor-otp-confirm.component.ts`
```typescript
// ابحث عن كل console.log — امسحهم
```

#### ملف 5: `src/app/features/doctor/auth/doctor-password/doctor-password.component.ts`
```typescript
// ابحث عن كل console.log — امسحهم (فيه 5+)
```

#### ملف 6: `src/app/features/doctor/auth/doctor-register-step1/doctor-register-step1.component.ts`
```typescript
// ابحث عن كل console.log — امسحهم (فيه 5+)
```

#### ملف 7: `src/app/features/doctor/auth/doctor-register-step2/doctor-register-step2.component.ts`
```typescript
// ابحث عن كل console.log — امسحهم (فيه 3+)
```

#### ملف 8: `src/app/features/patient/auth/basic-info/basic-info.component.ts`
```typescript
// سطر 65:
console.log(this.basicInfoForm.value);  // ← امسح
```

#### ملف 9: `src/app/features/doctor/auth/forget-password/forget-password.component.ts`
```typescript
// سطر 50:
console.log(this.mobileForm.value);  // ← امسح
```

#### ملف 10: `src/app/features/patient/service/notification.service.ts`
```typescript
// سطر 32-33:
console.log('Notifications');  // ← امسح
console.log(res);              // ← امسح

// سطر 143:
console.log(res);  // ← امسح

// سطر 159:
console.log(res);  // ← امسح

// سطر 226-227:
console.log('here');          // ← امسح
console.log(notification);    // ← امسح
```

**⚠️ القاعدة:** امسح **كل** `console.log()` statement في الـ production code. لو محتاج debug logging، استخدم `environment.production` check:
```typescript
if (!Environment.production) {
    console.log('debug:', data);
}
```

---

### الخطوة 6: التحقق

1. **شغّل `ng build`** — لازم يعدي بدون errors
2. **ابحث في كل الملفات عن `console.log`:**
   ```bash
   grep -r "console.log" src/app/ --include="*.ts" | grep -v node_modules | grep -v ".spec.ts"
   ```
   المفروض النتيجة تكون **صفر** (أو فقط في environment check)
3. **ابحث عن الـ commented validations:**
   ```bash
   grep -rn "// if (code.length" src/app/
   grep -rn "// if (this.basicInfoForm.invalid" src/app/
   ```
   المفروض النتيجة تكون **صفر**
