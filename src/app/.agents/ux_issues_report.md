# 🎨 تقرير مشاكل الـ UX — TeleSeha Web

> **تاريخ المراجعة:** 2026-05-22
> **النطاق:** تجربة المستخدم في كل الـ Features (Auth, Doctor, Patient, Landing Page)

---

## المشكلة #1 — غياب Loading States داخل الـ Components (High)

### الوصف العام
المشروع بيعتمد على `NgxSpinner` كـ Global Full-Screen Spinner (عبر `loadingInterceptor`). ده بيغطي الشاشة كلها بـ overlay أسود (`rgba(0, 0, 0, 0.8)`) مع "Loading..." text — لكل API call.

**المشكلة:**
1. **Full-screen overlay لكل request:** حتى لو request صغير (مثلاً جلب قائمة التخصصات)، الشاشة كلها بتتغطى. ده مزعج جداً خصوصاً في الصفحات اللي فيها كذا API call في نفس الوقت.
2. **لا يوجد Inline Loading:** مفيش أي component بيعرض spinner/skeleton/loading state خاص بيه. الـ sections الفردية (مثل قائمة الدكاترة، المواعيد) مفيش فيها أي indication إنها بتحمل.
3. **الزرار ما بيتعطّلش أثناء الإرسال:** في كل الـ Forms (Login, OTP, Register steps)، الزرار بيفضل clickable أثناء ما الـ API call شغال. ده بيسمح بـ double-submit.

### الملفات المتأثرة
كل الـ Components اللي فيها forms:
- `doctor-login.component.ts` — زرار Submit
- `doctor-register-step1/2/3` — زرار Save
- `patient-login.component.ts` — زرار Submit
- `basic-info.component.ts` — زرار Save
- كل الـ Home sections (doctor + patient)

### الحل المقترح
1. إضافة `isLoading = false` property في كل component فيه form
2. Set `isLoading = true` قبل الـ API call، و `false` في الـ `next` و `error`
3. استخدام `[disabled]="isLoading"` على الزرار
4. عرض spinner صغير (inline) بدل الـ full-screen overlay
5. **اختيارياً:** استخدام `SKIP_URLS` في الـ `loadingInterceptor` لاستثناء requests معينة من الـ full-screen spinner

### الأولوية: 🟠 High

---

## المشكلة #2 — غياب Empty States (Medium)

### الوصف
الصفحات اللي بتعرض بيانات (مواعيد الدكتور، قائمة الدكاترة، التقارير) مفيش فيها أي "Empty State" لما ما يكونش فيه بيانات. المستخدم بيشوف صفحة فاضية تماماً بدون أي توضيح.

### الملفات المتأثرة
- `doctor-today-appointments-section` — لو مفيش مواعيد النهاردة
- `doctor-weekly-appointments-section` — لو مفيش مواعيد الأسبوع
- `patient-recent-appointments-section` — لو مفيش حجوزات سابقة
- `patient-all-doctors-section` — لو مفيش نتائج بحث

### الحل المقترح
إضافة Empty State component مع:
- Icon مناسب (📋 أو illustration)
- رسالة واضحة (مثلاً "لا توجد مواعيد اليوم")
- CTA button (مثلاً "احجز موعد جديد")

### الأولوية: 🟡 Medium

---

## المشكلة #3 — غياب Confirmation Dialogs للعمليات الحرجة (High)

### الوصف
العمليات الحرجة بتحصل بدون أي تأكيد من المستخدم:

| العملية | الملف |
|---|---|
| إلغاء موعد | `doctors.service.ts:cancelAppointment()` — بيتنفذ مباشرة بدون confirm |
| إغلاق موعد | `doctors.service.ts:closeAppointment()` — بدون confirm |
| حذف مساعد | `doctor-auth.service.ts:deleteAssistant()` — بدون confirm |
| حذف جدول | `doctor-auth.service.ts:deleteDoctorSchedule()` — بدون confirm |
| حذف جلسة | `doctor-auth.service.ts:deleteDoctorSession()` — بدون confirm |
| إغلاق اجتماع | `doctors.service.ts:closeMeeting()` — بدون confirm |
| Logout (clearLocalStorage) | كل الـ auth components — بدون confirm |

### الحل المقترح
إنشاء Shared Confirmation Dialog Component:
```html
<app-confirm-dialog
    [title]="'هل أنت متأكد؟'"
    [message]="'هل تريد إلغاء هذا الموعد؟'"
    (confirm)="onConfirm()"
    (cancel)="onCancel()">
</app-confirm-dialog>
```

### الأولوية: 🟠 High

---

## المشكلة #4 — عدم وجود Progress Indicator في الـ Multi-Step Registration (Medium)

### الوصف
عملية تسجيل الدكتور عبارة عن **7 خطوات**:
1. Login (رقم الموبايل)
2. OTP Confirm
3. Create Password
4. Basic Info (الاسم، التخصص، السعر)
5. Create Profile (الوصف، البلد، الجامعة)
6. Create Certificates (رفع الشهادات)
7. Appointment Setup (إعداد المواعيد)

المستخدم مفيش أي indication عن:
- **هو في أي خطوة من الـ 7** — مفيش progress bar أو step indicator
- **باقي كام خطوة** — المستخدم مش عارف لو هيخلص قريب أو لسه بعيد
- **إمكانية الرجوع لخطوة سابقة لتعديلها** — مفيش back navigation واضح بين الخطوات

### الحل المقترح
إنشاء Step Indicator Component مشترك يتعرض في أعلى كل صفحة تسجيل:
```
Step 1 ● ─── Step 2 ● ─── Step 3 ○ ─── Step 4 ○
```

### الأولوية: 🟡 Medium

---

## المشكلة #5 — الـ Account Type Modal مش مترجم (Medium)

### الملف
`src/app/layouts/header/header.component.html` — سطر 39-92

### الوصف
الـ Modal اللي بيظهر لاختيار نوع الحساب (Patient/Doctor) مكتوب بالإنجليزي فقط بدون أي ترجمة:
```html
<h2>Join Our Platform</h2>
<p>Please select your account type to continue</p>
<p>Patient</p>
<p>Doctor</p>
```

باقي المشروع بيستخدم `@ngx-translate` للترجمة — لكن الـ Modal ده مفيش فيه أي `translate` pipe.

### الحل المقترح
استخدام الـ `translate` pipe:
```html
<h2>{{ 'ACCOUNT_MODAL.TITLE' | translate }}</h2>
<p>{{ 'ACCOUNT_MODAL.SUBTITLE' | translate }}</p>
```

### الأولوية: 🟡 Medium

---

## المشكلة #6 — الـ Scroll-to-Top Button ظاهر فوق كل حاجة (Low)

### الملف
`src/app/app.component.html` — سطر 8-13

### الوصف
```html
<button class="fixed bottom-16 right-12 z-[9999999999] bg-[#0078C7] animate-bounce ..."
```

الـ `z-index: 9999999999` ده قيمة مبالغ فيها. الزرار هيظهر فوق:
- الـ Modals (z-index: 999999999)
- الـ Dropdowns
- الـ Video Call overlay (لو موجود)

كمان `animate-bounce` بيخلي الزرار يتحرك طول الوقت — ده مشتت.

### الحل المقترح
```html
<button class="fixed bottom-16 right-12 z-[50] bg-[#0078C7] hover:scale-110 transition-transform ..."
```

### الأولوية: 🟢 Low

---

## المشكلة #7 — الـ Cookie Usage بدل Secure Storage (Medium)

### الملفات
- `doctor-otp-confirm.component.ts` — `setCookie('createPasswordToken',...)`
- `patient-otp-confirm.component.ts` — `setCookie('createPasswordToken',...)`
- `doctor-password.component.ts` — `getCookie('createPasswordToken')`
- `patient-password.component.ts` — `getCookie('createPasswordToken')`
- `doctor-login.component.ts` — `getCookie('createPasswordToken')`
- `patient-login.component.ts` — `getCookie('createPasswordToken')`

### الوصف
الـ `createPasswordToken` بيتحفظ في Cookie **و** في localStorage في نفس الوقت (سطر 108-109 و 112-113 في OTP components). ده redundancy مالهاش لازمة. والـ Cookie بيتحفظ بدون `Secure` flag ولا `SameSite` attribute.

### الحل المقترح
الاعتماد على localStorage فقط (اللي الكود بيعمله بالفعل عبر الـ Service) وإزالة كل الـ Cookie logic.

### الأولوية: 🟡 Medium

---

## المشكلة #8 — غياب Feedback بعد العمليات الناجحة (Medium)

### الوصف
بعض العمليات بتخلص بنجاح بدون أي feedback للمستخدم:

| العملية | الملف | المشكلة |
|---|---|---|
| إنشاء Basic Info للمريض | `basic-info.component.ts:76-79` | بتوديه لصفحة تانية بدون Success toast |
| إنشاء Doctor Profile Step 2 | `doctor-register-step2.component.ts:253-266` | بدون Success toast (بس في update بيظهر) |
| Doctor Register Step 3 (Create) | `doctor-register-step3.component.ts:244-249` | بدون Success toast |
| Select Profile | `select-profile.component.ts:24-31` | بتوديه Home بدون أي feedback |

### الحل المقترح
إضافة `toastr.success()` قبل كل navigation بعد عملية ناجحة.

### الأولوية: 🟡 Medium

---

## المشكلة #9 — الـ Login Pages مش بتعمل Focus على أول Input (Low)

### الملفات
- `doctor-login.component.ts`
- `patient-login.component.ts`

### الوصف
لما المستخدم يفتح صفحة Login، الـ cursor مش بيروح تلقائياً على حقل رقم الموبايل. المستخدم لازم يدوس بنفسه على الحقل.

### الحل المقترح
إضافة `autofocus` على حقل الموبايل، أو برمجياً:
```typescript
ngAfterViewInit() {
    // ... existing intlTelInput setup
    this.phoneInput.nativeElement.focus();
}
```

### الأولوية: 🟢 Low

---

## المشكلة #10 — الـ Spinner Design مش متوافق مع الـ Design System (Low)

### الملف
`src/app/app.component.html` — سطر 2-4

### الوصف
```html
<ngx-spinner bdColor="rgba(0, 0, 0, 0.8)" size="medium" color="#fff" type="square-jelly-box" [fullScreen]="true">
    <p style="color: white"> Loading... </p>
</ngx-spinner>
```

الـ Spinner بيستخدم:
- **Background أسود 80%** — ده كثير أوي وبيحسس المستخدم إن الصفحة وقفت
- **"Loading..." text** — مش مترجم
- **`square-jelly-box` animation** — مش متوافق مع الـ Medical/Professional theme

### الحل المقترح
- تغيير الـ Background لـ `rgba(255,255,255,0.85)` (light overlay)
- تغيير الـ Color للـ Brand Color `#007BBD`
- استبدال الـ "Loading..." بـ spinner بسيط بدون text
- أو عمل custom spinner component متوافق مع الـ Design Guidelines

### الأولوية: 🟢 Low

---

## ملخص الأولويات

| الأولوية | العدد | الوصف |
|---|---|---|
| 🟠 High | 2 | غياب loading states، غياب confirmation dialogs |
| 🟡 Medium | 5 | Empty states، progress indicator، ترجمة، cookies، success feedback |
| 🟢 Low | 3 | Scroll button، auto-focus، spinner design |
