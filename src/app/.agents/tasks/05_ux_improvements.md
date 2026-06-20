# Task 5: تحسينات الـ UX — Loading States + Confirmation Dialogs

## الهدف
1. إضافة inline loading state لكل Form submit button
2. إنشاء Shared Confirmation Dialog Component
3. تحسين الـ Spinner الرئيسي
4. إضافة ترجمة للـ Account Type Modal

## يعتمد على: Tasks 1-4 (الأحسن يخلصوا الأول)

---

## الخطوات

### الخطوة 1: إضافة `isLoading` لكل Auth Component

**القاعدة:** كل component فيه form submit، أضف:
1. Property: `isLoading = false;`
2. في بداية الـ submit method: `this.isLoading = true;`
3. في الـ `next` callback: `this.isLoading = false;`
4. في الـ `error` callback: `this.isLoading = false;`
5. في الـ HTML: `[disabled]="isLoading"` على الـ submit button

**الملفات اللي محتاجة التعديل:**

#### ملف 1: `src/app/features/doctor/auth/doctor-login/doctor-login.component.ts`

**في الـ TS:**
```typescript
export class DoctorLoginComponent implements AfterViewInit {
    isLoading = false;  // ← أضف ده
    // ...

    submit() {
        // ... existing validation ...

        this.isLoading = true;  // ← أضف ده

        this.doctorAuthService.loginMobile(formatted).subscribe({
            next: (res: any) => {
                this.isLoading = false;  // ← أضف ده
                // ... existing code (لا تغيّره)
            },
            error: () => {
                this.isLoading = false;  // ← أضف ده
            },
        });
    }
}
```

**في الـ HTML (`doctor-login.component.html`):**
ابحث عن الـ submit button وأضف `[disabled]="isLoading"`:
```html
<!-- ابحث عن الزرار اللي بينادي submit() وأضف [disabled] -->
<button (click)="submit()" [disabled]="isLoading"
    class="...existing classes...">
    @if (isLoading) {
        <i class="fa-solid fa-spinner fa-spin mr-2"></i>
    }
    <!-- existing button text -->
</button>
```

#### كرّر نفس الـ Pattern في كل الملفات دي:

| # | الـ TS File | الـ HTML File | الـ method |
|---|---|---|---|
| 2 | `doctor-otp-confirm.component.ts` | `doctor-otp-confirm.component.html` | `submitOtp()` |
| 3 | `doctor-password.component.ts` | `doctor-password.component.html` | `loginWithPattern()` + `createPassword()` |
| 4 | `doctor-register-step1.component.ts` | `doctor-register-step1.component.html` | `save()` |
| 5 | `doctor-register-step2.component.ts` | `doctor-register-step2.component.html` | `save()` |
| 6 | `doctor-register-step3.component.ts` | `doctor-register-step3.component.html` | submit method |
| 7 | `forget-password.component.ts` | `forget-password.component.html` | `submit()` |
| 8 | `patient-login.component.ts` | `patient-login.component.html` | `submit()` |
| 9 | `patient-otp-confirm.component.ts` | `patient-otp-confirm.component.html` | `submitOtp()` |
| 10 | `patient-password.component.ts` | `patient-password.component.html` | `login()` + `createPassword()` |
| 11 | `basic-info.component.ts` | `basic-info.component.html` | `save()` |

---

### الخطوة 2: إنشاء Shared Confirmation Dialog Component

**إنشاء الملفات:**
```
src/app/shared/components/confirm-dialog/
├── confirm-dialog.component.ts
├── confirm-dialog.component.html
└── confirm-dialog.component.css
```

**الملف 1: `confirm-dialog.component.ts`**
```typescript
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-confirm-dialog',
    templateUrl: './confirm-dialog.component.html',
    styleUrl: './confirm-dialog.component.css',
})
export class ConfirmDialogComponent {
    @Input() isOpen = false;
    @Input() title = 'هل أنت متأكد؟';
    @Input() message = '';
    @Input() confirmText = 'تأكيد';
    @Input() cancelText = 'إلغاء';
    @Input() confirmClass = 'bg-red-500 hover:bg-red-600'; // أحمر للعمليات الخطرة

    @Output() confirm = new EventEmitter<void>();
    @Output() cancel = new EventEmitter<void>();

    onConfirm() {
        this.confirm.emit();
    }

    onCancel() {
        this.cancel.emit();
    }
}
```

**الملف 2: `confirm-dialog.component.html`**
```html
@if (isOpen) {
<div class="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[99999] flex items-center justify-center p-4">
    <div class="bg-white rounded-[2rem] p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] w-full max-w-md relative animate-fadeIn">

        <!-- Close button -->
        <button (click)="onCancel()"
            class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all duration-300">
            <i class="fa-solid fa-xmark"></i>
        </button>

        <!-- Icon -->
        <div class="flex justify-center mb-4">
            <div class="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                <i class="fa-solid fa-triangle-exclamation text-2xl text-red-500"></i>
            </div>
        </div>

        <!-- Title -->
        <h3 class="text-center text-xl font-bold text-gray-800 mb-2">{{ title }}</h3>

        <!-- Message -->
        <p class="text-center text-gray-500 mb-8 text-sm">{{ message }}</p>

        <!-- Buttons -->
        <div class="flex gap-3 justify-center">
            <button (click)="onCancel()"
                class="px-6 py-3 rounded-full border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-all">
                {{ cancelText }}
            </button>
            <button (click)="onConfirm()"
                class="px-6 py-3 rounded-full text-white font-semibold transition-all"
                [class]="confirmClass">
                {{ confirmText }}
            </button>
        </div>
    </div>
</div>
}
```

**الملف 3: `confirm-dialog.component.css`**
```css
/* فاضي — كل الـ styles بـ Tailwind */
```

**طريقة الاستخدام في أي Component:**
```html
<!-- في الـ HTML -->
<app-confirm-dialog
    [isOpen]="showConfirmDialog"
    [title]="'إلغاء الموعد'"
    [message]="'هل أنت متأكد من إلغاء هذا الموعد؟ لا يمكن التراجع عن هذا الإجراء.'"
    [confirmText]="'نعم، إلغاء'"
    [cancelText]="'لا، تراجع'"
    (confirm)="onConfirmCancel()"
    (cancel)="showConfirmDialog = false">
</app-confirm-dialog>
```

```typescript
// في الـ TS
showConfirmDialog = false;

cancelAppointment(id: number) {
    this.pendingCancelId = id;
    this.showConfirmDialog = true;
}

onConfirmCancel() {
    this.showConfirmDialog = false;
    this.doctorsService.cancelAppointment(this.pendingCancelId).subscribe({
        next: () => { /* ... */ },
    });
}
```

---

### الخطوة 3: ترجمة الـ Account Type Modal

**الملف:** `src/app/layouts/header/header.component.html`

**التعديل:** استبدل النصوص الثابتة بـ translate pipe:

```html
<!-- قبل (سطر 49-52): -->
<h2 class="...">Join Our Platform</h2>
<p class="...">Please select your account type to continue</p>
...
<p class="...">Patient</p>
...
<p class="...">Doctor</p>

<!-- بعد: -->
<h2 class="...">{{ 'ACCOUNT_MODAL.TITLE' | translate }}</h2>
<p class="...">{{ 'ACCOUNT_MODAL.SUBTITLE' | translate }}</p>
...
<p class="...">{{ 'ACCOUNT_MODAL.PATIENT' | translate }}</p>
...
<p class="...">{{ 'ACCOUNT_MODAL.DOCTOR' | translate }}</p>
```

**أضف الـ import في `header.component.ts`:**
```typescript
import { TranslateModule } from '@ngx-translate/core';

@Component({
    // ...
    imports: [
        // ... existing imports
        TranslateModule,  // ← أضف ده
    ],
})
```

**أضف الترجمات في ملفات الـ i18n:**

**`src/assets/i18n/ar.json`** — أضف:
```json
{
    "ACCOUNT_MODAL": {
        "TITLE": "انضم لمنصتنا",
        "SUBTITLE": "اختر نوع حسابك للمتابعة",
        "PATIENT": "مريض",
        "DOCTOR": "طبيب"
    }
}
```

**`src/assets/i18n/en.json`** — أضف:
```json
{
    "ACCOUNT_MODAL": {
        "TITLE": "Join Our Platform",
        "SUBTITLE": "Please select your account type to continue",
        "PATIENT": "Patient",
        "DOCTOR": "Doctor"
    }
}
```

---

### الخطوة 4: تحسين الـ Scroll-to-Top Button

**الملف:** `src/app/app.component.html`

```html
<!-- القديم (سطر 8-13): -->
<button id="scrollToTopButton"
    class="animate-bounce fixed bottom-16 right-12 z-[9999999999] bg-[#0078C7] font-bold w-[40px] h-[40px] rounded-full"
    (click)="scrollToTop()">
    <i class="fas fa-arrow-up text-[#FFFFFF]"></i>
</button>

<!-- الجديد: -->
<button id="scrollToTopButton"
    class="fixed bottom-8 right-8 z-[50] bg-[#007BBD] font-bold w-[44px] h-[44px] rounded-full shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-300"
    (click)="scrollToTop()">
    <i class="fas fa-arrow-up text-white"></i>
</button>
```

**التغييرات:**
- `z-[9999999999]` → `z-[50]` (قيمة معقولة)
- `animate-bounce` → **اتشال** (كان مشتت)
- أضفنا `hover:scale-110 active:scale-95 transition-all` بدل الـ bounce
- `bottom-16 right-12` → `bottom-8 right-8` (أقرب للزاوية)
- `shadow-lg hover:shadow-xl` — يحسس إنه button حقيقي

---

### الخطوة 5: التحقق

1. **شغّل `ng build`** — لازم يعدي بدون errors
2. **جرب Submit أي form** — الزرار لازم يتعطّل (disabled) أثناء الـ loading ويظهر spinner
3. **جرب الـ Account Modal** — النصوص لازم تتغير حسب اللغة (عربي/إنجليزي)
4. **جرب الـ Scroll button** — لازم يظهر بشكل أنيق بدون bounce مزعج
