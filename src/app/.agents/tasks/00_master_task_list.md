# 📋 قائمة التاسكات الرئيسية — TeleSeha Web Fix Plan

> **الترتيب:** حسب الأولوية والاعتمادية (التاسك اللي بعده يعتمد عليه)
> **كل تاسك في ملف منفصل** فيه تعليمات تفصيلية خطوة بخطوة

---

## الترتيب

| # | الملف | الوصف | الأولوية | الاعتماد على |
|---|---|---|---|---|
| 1 | `01_auth_state_refactor.md` | **إعادة هيكلة الـ Auth State:** تحويل localStorage → in-memory state مع الإبقاء على refreshToken فقط | 🔴 Critical | لا شيء |
| 2 | `02_navigation_fixes.md` | **إصلاح مشاكل الـ Navigation:** replaceUrl، إزالة redirect guard، back button | 🔴 Critical | Task 1 |
| 3 | `03_api_error_handling_cleanup.md` | **تنظيف الـ Error Handling:** إزالة الـ duplicate toasts من الـ Components | 🔴 Critical | لا شيء |
| 4 | `04_subscription_management.md` | **إدارة الـ Subscriptions:** إضافة takeUntilDestroyed + إرجاع الـ validations المعطلة | 🟠 High | لا شيء |
| 5 | `05_ux_improvements.md` | **تحسينات الـ UX:** Loading states، Confirmation dialogs، Empty states | 🟡 Medium | Tasks 1-4 |
| 6 | `06_style_migration.md` | **توحيد الأنماط:** تطبيق الـ Design System الجديد على كل الصفحات | 🟡 Medium | Task 5 |

---

## ملاحظات مهمة

> ⚠️ **قاعدة ذهبية:** التزم بهيكلية المشروع وطريقة كتابة الكود الموجودة فيه. مش عايز حد يشوف كودك يعرف إنه مش المطور الأصلي اللي عمله.

> ⚠️ **قبل ما تبدأ أي تاسك:** اقرأ الملف كامل الأول، افهم كل خطوة، وبعدين نفذ بالترتيب.

> ⚠️ **بعد كل تاسك:** شغّل `ng build` وتأكد إن مفيش أي errors.
