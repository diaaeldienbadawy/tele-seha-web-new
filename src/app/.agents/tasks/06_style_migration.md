# Task 6: خطة توحيد الأنماط (Style Migration)

## الهدف
تحويل كل الصفحات القديمة لتتبع نفس الـ Design System الجديد المستخدم في صفحات الـ Auth والـ Header.

## يعتمد على: Task 5 (الأحسن يخلص الأول)

---

## الخطوات

### الخطوة 1: إضافة الـ Design Tokens في `styles.css`

**الملف:** `src/styles.css`

**أضف في أعلى الملف (بعد الـ Tailwind imports):**

```css
/* ======================= TeleSeha Design Tokens ======================= */
:root {
    /* Colors */
    --ts-primary: #007BBD;
    --ts-primary-hover: #006AA3;
    --ts-primary-light: rgba(0, 123, 189, 0.08);
    --ts-bg-page: #F7F9FE;
    --ts-bg-card: #FFFFFF;
    --ts-text-primary: #1F1F1F;
    --ts-text-secondary: #555555;
    --ts-text-muted: #9CA3AF;
    --ts-border-light: #E5E7EB;
    --ts-border-focus: #007BBD;
    --ts-success: #22C55E;
    --ts-warning: #F59E0B;
    --ts-danger: #EF4444;

    /* Shadows */
    --ts-shadow-card: 0px 10px 40px rgba(0, 0, 0, 0.04);
    --ts-shadow-card-hover: 0px 20px 40px rgba(0, 0, 0, 0.08);
    --ts-shadow-button: 0px 4px 12px rgba(0, 123, 189, 0.35);
    --ts-shadow-button-hover: 0px 8px 24px rgba(0, 123, 189, 0.45);

    /* Radii */
    --ts-radius-card: 24px;
    --ts-radius-input: 9999px;
    --ts-radius-button: 9999px;
    --ts-radius-modal: 2rem;
    --ts-radius-badge: 12px;

    /* Spacing */
    --ts-spacing-card: 2rem;
    --ts-spacing-section: 3rem;
}

/* ======================= Shared Components ======================= */

/* Card */
.ts-card {
    background: var(--ts-bg-card);
    border-radius: var(--ts-radius-card);
    box-shadow: var(--ts-shadow-card);
    padding: var(--ts-spacing-card);
    transition: box-shadow 0.3s ease, transform 0.3s ease;
}

.ts-card:hover {
    box-shadow: var(--ts-shadow-card-hover);
}

.ts-card-interactive:hover {
    box-shadow: var(--ts-shadow-card-hover);
    transform: translateY(-2px);
}

/* Input — Pill Shape */
.ts-input {
    border: 1px solid var(--ts-border-light);
    border-radius: var(--ts-radius-input);
    padding: 14px 20px;
    font-size: 14px;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
    background: white;
    width: 100%;
    outline: none;
}

.ts-input:focus {
    border-color: var(--ts-border-focus);
    box-shadow: 0 0 0 3px var(--ts-primary-light);
}

.ts-input::placeholder {
    color: var(--ts-text-muted);
}

/* Select — Pill Shape */
.ts-select {
    border: 1px solid var(--ts-border-light);
    border-radius: var(--ts-radius-input);
    padding: 14px 20px;
    font-size: 14px;
    background: white;
    width: 100%;
    outline: none;
    appearance: none;
    cursor: pointer;
    transition: border-color 0.2s ease;
}

.ts-select:focus {
    border-color: var(--ts-border-focus);
    box-shadow: 0 0 0 3px var(--ts-primary-light);
}

/* Button — Primary */
.ts-btn-primary {
    background: var(--ts-primary);
    color: white;
    border-radius: var(--ts-radius-button);
    padding: 14px 32px;
    font-weight: 700;
    font-size: 16px;
    border: none;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: var(--ts-shadow-button);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.ts-btn-primary:hover {
    background: var(--ts-primary-hover);
    box-shadow: var(--ts-shadow-button-hover);
    transform: translateY(-2px);
}

.ts-btn-primary:active {
    transform: translateY(0);
}

.ts-btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}

/* Button — Secondary (Outline) */
.ts-btn-secondary {
    background: transparent;
    color: var(--ts-primary);
    border-radius: var(--ts-radius-button);
    padding: 14px 32px;
    font-weight: 600;
    font-size: 16px;
    border: 2px solid var(--ts-primary);
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.ts-btn-secondary:hover {
    background: var(--ts-primary-light);
    transform: translateY(-2px);
}

.ts-btn-secondary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
}

/* Badge */
.ts-badge {
    display: inline-flex;
    align-items: center;
    padding: 4px 12px;
    border-radius: var(--ts-radius-badge);
    font-size: 12px;
    font-weight: 600;
}

.ts-badge-success {
    background: rgba(34, 197, 94, 0.1);
    color: #16A34A;
}

.ts-badge-warning {
    background: rgba(245, 158, 11, 0.1);
    color: #D97706;
}

.ts-badge-danger {
    background: rgba(239, 68, 68, 0.1);
    color: #DC2626;
}

.ts-badge-info {
    background: rgba(0, 123, 189, 0.1);
    color: #007BBD;
}

/* Section Title */
.ts-section-title {
    font-size: 24px;
    font-weight: 700;
    color: var(--ts-text-primary);
    margin-bottom: 1.5rem;
}

@media (min-width: 768px) {
    .ts-section-title {
        font-size: 28px;
    }
}

/* Page Background */
.ts-page-bg {
    background-color: var(--ts-bg-page);
    min-height: 100vh;
}
```

**وعدّل الـ `.container` الموجود:**
```css
/* القديم: */
.container {
    width: 90%;
    margin: 0 auto;
}

/* الجديد: */
.container {
    width: 90%;
    max-width: 1400px;
    margin: 0 auto;
}
```

---

### الخطوة 2: تطبيق الـ Classes الجديدة على صفحات المريض

**القاعدة العامة لكل صفحة:**
1. الـ page wrapper يبقى فيه `ts-page-bg` لو الـ background ابيض فلات
2. كل card يبقى فيه `ts-card` بدل الـ inline shadow styles
3. كل button يبقى فيه `ts-btn-primary` بدل الـ inline styles
4. كل input يبقى فيه `ts-input` بدل الـ inline styles

**الصفحات بالترتيب:**

#### صفحة 1: Patient Home — Hero Section
**الملف:** `src/app/features/patient/homePage/patient-hero-section/patient-hero-section.component.html`

```html
<!-- القديم (سطر 1): -->
<section class="min-h-screen relative overflow-hidden lg:border-b-[0.5px] border-b-[#BCBCBC]">

<!-- الجديد: -->
<section class="min-h-[60vh] lg:min-h-screen relative overflow-hidden">
```

```html
<!-- القديم — الـ CTA button (سطر 33-36): -->
<button routerLink="/patient/allDoctors"
    class="btn-header w-full lg:w-[70%] bg-[#007BBD] text-[#F7F9FE] px-[25px] py-[15px] lg:py-[20px] rounded-full text-[20px] lg:text-[24px] font-bold leading-[24px] md:leading-[30px]">

<!-- الجديد: -->
<button routerLink="/patient/allDoctors"
    class="ts-btn-primary w-full lg:w-[70%] text-[20px] lg:text-[24px] py-[15px] lg:py-[20px]">
```

**الملف:** `patient-hero-section.component.css` — ممكن تحذف الـ `.btn-header` class لأنها بقت في الـ `ts-btn-primary`.

#### صفحة 2-6: Patient Sections
**لكل section (specialties, recent appointments, doctors list, etc.):**
- أي `div` فيه `shadow` أو `border-radius: 16px/24px` → أضف class `ts-card`
- أي button أساسي → غيّره لـ `ts-btn-primary`
- أي section title → غيّره لـ `ts-section-title`

**⚠️ مهم:** ما تمسحش الـ classes القديمة لو مش متأكد. أضف الـ classes الجديدة بجانب القديمة الأول، وبعد ما تتأكد إن الشكل صح، امسح القديمة.

---

### الخطوة 3: تطبيق الـ Classes الجديدة على صفحات الدكتور

**نفس القاعدة:** cards → `ts-card`, buttons → `ts-btn-primary`, inputs → `ts-input`.

**الصفحات:**
1. `doctor-hero-section-home-page.component.html` — Hero section cleanup
2. `doctor-today-appointments-section` — Appointment cards
3. `doctor-weekly-appointments-section` — Week view cards
4. Doctor Settings pages — Forms والـ inputs

---

### الخطوة 4: تطبيق الـ Classes على الـ Landing Page

**Landing Page Home:**
- Hero section → نفس تعديلات الـ Patient Hero
- Feature cards → `ts-card ts-card-interactive`
- CTA buttons → `ts-btn-primary`

**Landing Page Sub-pages (About, Support, Privacy, Terms):**
- Content containers → `ts-card`
- Page background → `ts-page-bg`

---

### الخطوة 5: التحقق

1. **شغّل `ng build`** — لازم يعدي بدون errors
2. **افتح كل صفحة عدّلتها** على 3 أحجام:
   - **Mobile:** 375px عرض
   - **Tablet:** 768px عرض
   - **Desktop:** 1440px عرض
3. **تأكد إن مفيش أي حاجة اتكسرت** — لو شكل صفحة اتغير بشكل غير متوقع، ارجع شوف إيه الـ class اللي سببت المشكلة
4. **قارن الصفحات المعدّلة** مع صفحات الـ Auth الجديدة — لازم يكون فيه consistency في:
   - الـ Card shadows
   - الـ Button shapes (pill)
   - الـ Input shapes (pill)
   - الـ Spacing
   - الـ Colors
