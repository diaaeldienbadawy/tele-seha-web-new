import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type ReportPdfKind = 'prescription' | 'lab' | 'radiology';

export interface ReportPdfItem {
  /** اسم الدوا / التحليل / الأشعة — بيتكتب بلون المنصة. */
  name: string;
  /** التعليمات أو الملاحظات — بلون تاني أهدى. */
  details?: string | null;
}

export interface ReportPdfData {
  kind: ReportPdfKind;
  /** الرقم المرجعي (id الروشتة/الطلب) — بيظهر في الهيدر وفي اسم الملف. */
  reference?: string | number | null;
  patientName?: string | null;
  doctorName?: string | null;
  doctorSpecialty?: string | null;
  doctorLicense?: string | null;
  issuedAt?: string | Date | null;
  items: ReportPdfItem[];
  /** لينك الـ QR. لو مفيش، بيتولّد لينك صفحة تقارير المريض. */
  linkUrl?: string | null;
}

interface KindMeta {
  title: string;
  subtitle: string;
  fileSlug: string;
  refPrefix: string;
  accent: string;
  emptyText: string;
}

const BRAND_AR = 'تيلي صحة';
const BRAND_EN = 'TeleSeha';
const BRAND_TAGLINE = 'منصة الاستشارات الطبية عن بُعد';
const LOGO_URL = 'assets/images/Group 76373.svg';

/** ألوان الموقع نفسها (مصدرها styles.css) — الـ PDF لازم يبان جزء من المنتج. */
const COLOR = {
  primary: '#007BBD',
  primaryDark: '#005E91',
  ink: '#1E293B',
  body: '#475569',
  muted: '#94A3B8',
  surface: '#F8FAFC',
  border: '#EEF2F7',
  white: '#FFFFFF',
};

const KIND_META: Record<ReportPdfKind, KindMeta> = {
  prescription: {
    title: 'الروشتة الطبية',
    subtitle: 'الأدوية الموصوفة وتعليمات الاستخدام',
    fileSlug: 'Prescription',
    refPrefix: 'RX',
    accent: COLOR.primary,
    emptyText: 'لم يصف الطبيب أدوية في هذا الكشف',
  },
  lab: {
    title: 'طلب التحاليل الطبية',
    subtitle: 'التحاليل المطلوبة وملاحظات الطبيب',
    fileSlug: 'LabTests',
    refPrefix: 'LAB',
    accent: '#0EA5A4',
    emptyText: 'لم يطلب الطبيب تحاليل في هذا الكشف',
  },
  radiology: {
    title: 'طلب الأشعة',
    subtitle: 'الفحوصات الإشعاعية المطلوبة وملاحظات الطبيب',
    fileSlug: 'Radiology',
    refPrefix: 'RAD',
    accent: '#7C3AED',
    emptyText: 'لم يطلب الطبيب أشعة في هذا الكشف',
  },
};

/**
 * تنزيل تقارير المريض كـ PDF منسّق.
 *
 * الزرار القديم في شاشة نهاية الكشف كان بينزّل **ملف نصي** (`Blob text/plain`)
 * فيه كل الأقسام مع بعض؛ وأزرار صفحة التقارير كانت بتصوّر الـ modal بالـ
 * html2canvas على ماركب Tailwind v4 — وألوان Tailwind v4 بتتحسب `oklch()`،
 * وهي دالة لون html2canvas 1.4 مش عارفها فبيترمي exception والتنزيل ميحصلش أصلًا.
 *
 * فبنبني هنا مستند مستقل بستايلات inline بألوان hex بس (نفس ألوان الموقع)،
 * بهيدر فيه اسم المنصة واللوجو و QR بيفتح لينك المستند، وبنحوّله لصورة ثم PDF
 * بصفحات متعددة. رسم HTML (مش نص jsPDF) هو كمان اللي بيخلي العربي يطلع مضبوط
 * بشكله واتجاهه — jsPDF لوحده مفيهوش خط عربي ولا تشكيل حروف.
 */
@Injectable({ providedIn: 'root' })
export class ReportPdfService {
  private platformId = inject(PLATFORM_ID);
  private logoDataUrl: string | null = null;

  async download(data: ReportPdfData): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    const meta = KIND_META[data.kind];
    const [{ default: html2canvas }, { default: JsPDF }] = await Promise.all([
      import('html2canvas'),
      import('jspdf'),
    ]);

    const host = await this.buildDocumentElement(data, meta);
    document.body.appendChild(host);

    try {
      // من غير الانتظار ده الـ canvas ممكن يترسم بخط fallback والعربي يطلع بشكل تاني.
      if ((document as any).fonts?.ready) {
        try {
          await (document as any).fonts.ready;
        } catch {
          /* الخطوط مش شرط — بنكمل */
        }
      }

      // الصور (اللوجو + الـ QR) بتتحط كـ data URL جوه innerHTML، وفك ترميزها async.
      // من غير الانتظار ده الـ canvas ممكن يترسم والصورة لسه مش جاهزة فتطلع الخانة
      // فاضية — وده اللي كان بيحصل للـ QR بالظبط.
      await this.waitForImages(host);

      const scale = 2;
      const canvas = await html2canvas(host, {
        scale,
        backgroundColor: COLOR.white,
        useCORS: true,
        logging: false,
        windowWidth: host.offsetWidth,
      });

      // html2canvas بيسيب صورة الـ QR فاضية (جرّبناها كـ <img> وكـ background
      // وكانت بتطلع بيضا في الحالتين)، فبنرسمها بنفسنا على الـ canvas الناتج في
      // نفس مكان الخانة المحجوزة لها. الـ layout بيفضل مسؤولية الـ HTML.
      this.paintQrOnCanvas(canvas, host, scale);

      const pdf = new JsPDF('p', 'mm', 'a4');
      const pageWidthMm = 210;
      const pageHeightMm = 297;
      const imageHeightMm = (canvas.height * pageWidthMm) / canvas.width;
      // JPEG بجودة عالية بدل PNG: نفس الوضوح تقريبًا لمستند بخلفية بيضاء، لكن حجم
      // الملف بيبقى مئات الكيلوبايتس بدل ~7 ميجا — فرق محسوس على موبايل المريض.
      const imageData = canvas.toDataURL('image/jpeg', 0.95);

      pdf.addImage(imageData, 'JPEG', 0, 0, pageWidthMm, imageHeightMm);

      // المستند ممكن يعدّي صفحة (روشتة بأدوية كتير) — بنقص الصورة على صفحات.
      let remaining = imageHeightMm - pageHeightMm;
      while (remaining > 0) {
        pdf.addPage();
        pdf.addImage(
          imageData,
          'JPEG',
          0,
          -(imageHeightMm - remaining),
          pageWidthMm,
          imageHeightMm,
        );
        remaining -= pageHeightMm;
      }

      pdf.save(this.fileName(data, meta));
    } finally {
      host.remove();
    }
  }

  /**
   * نفس الـ QR اللي بيتطبع في الـ PDF، عشان الـ popup على الشاشة يعرض كود حقيقي
   * بدل صورة الـ placeholder اللي كانت متحطّة (`2048px-QR_Code_Model_1_Example`).
   */
  async qrForReport(
    data: Pick<ReportPdfData, 'kind' | 'reference' | 'linkUrl'>,
  ): Promise<string | null> {
    if (!isPlatformBrowser(this.platformId)) return null;
    return this.buildQr(this.resolveLink(data as ReportPdfData));
  }

  /**
   * بيرسم صورة الـ QR يدويًا على الـ canvas في مكان العنصر `[data-qr-slot]`.
   * الصورة نفسها متخزّنة في `data-qr-src` على نفس العنصر.
   */
  private paintQrOnCanvas(canvas: HTMLCanvasElement, host: HTMLElement, scale: number): void {
    const slot = host.querySelector<HTMLElement>('[data-qr-slot]');
    const img = (slot as unknown as { __qrImage?: HTMLImageElement } | null)?.__qrImage;
    if (!slot || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const hostRect = host.getBoundingClientRect();
    const rect = slot.getBoundingClientRect();

    // html2canvas بيسيب الـ context بحالة رسم خاصة بيه (globalAlpha/composite
    // مضبوطين لآخر عنصر رسمه)، فأي رسم بعده كان بيختفي تمامًا — لازم نرجّع
    // الحالة الافتراضية الأول.
    ctx.save();
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.filter = 'none';
    ctx.drawImage(
      img,
      (rect.left - hostRect.left) * scale,
      (rect.top - hostRect.top) * scale,
      rect.width * scale,
      rect.height * scale,
    );
    ctx.restore();
  }

  /** بيستنى كل الصور جوه العنصر تخلص تحميل/فك ترميز (فشل صورة مش سبب لإلغاء الملف). */
  private async waitForImages(host: HTMLElement): Promise<void> {
    const images = Array.from(host.querySelectorAll('img'));
    await Promise.all(
      images.map(
        (img) =>
          new Promise<void>((resolve) => {
            const done = () => resolve();
            if (img.complete && img.naturalWidth > 0) {
              if (typeof img.decode === 'function') {
                img.decode().then(done, done);
              } else {
                done();
              }
              return;
            }
            img.addEventListener('load', done, { once: true });
            img.addEventListener('error', done, { once: true });
            // شبكة صامتة: مننتظرش للأبد على صورة مش بتحمّل.
            setTimeout(done, 4000);
          }),
      ),
    );
  }

  private fileName(data: ReportPdfData, meta: KindMeta): string {
    const ref = data.reference != null && String(data.reference).trim() !== ''
      ? `-${meta.refPrefix}-${data.reference}`
      : '';
    return `TeleSeha-${meta.fileSlug}${ref}.pdf`;
  }

  private formatDate(value: string | Date | null | undefined): string {
    const d = value ? new Date(value) : new Date();
    if (Number.isNaN(d.getTime())) return '—';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  }

  /** اللينك اللي الـ QR بيفتحه: صفحة تقارير المريض مع تحديد المستند. */
  private resolveLink(data: ReportPdfData): string {
    if (data.linkUrl) return data.linkUrl;
    const origin = typeof location !== 'undefined' ? location.origin : '';
    const params = new URLSearchParams({ type: data.kind });
    if (data.reference != null && String(data.reference) !== '') {
      params.set('id', String(data.reference));
    }
    return `${origin}/patient/reports?${params.toString()}`;
  }

  /** بنحوّل اللوجو لـ data URL: أضمن حاجة داخل الـ canvas (مفيش تحميل ولا CORS). */
  private async loadLogo(): Promise<string | null> {
    if (this.logoDataUrl !== null) return this.logoDataUrl || null;
    try {
      const res = await fetch(LOGO_URL);
      if (!res.ok) throw new Error(String(res.status));
      const blob = await res.blob();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
      });
      this.logoDataUrl = dataUrl;
      return dataUrl;
    } catch {
      // اللوجو مش شرط لنجاح التنزيل — بنكمل بالاسم النصي بس.
      this.logoDataUrl = '';
      return null;
    }
  }

  private async buildQr(url: string): Promise<string | null> {
    const options = {
      margin: 1,
      width: 240,
      errorCorrectionLevel: 'M' as const,
      color: { dark: '#0F172A', light: '#FFFFFF' },
    };

    // مسارين: الحزمة بتوجّه `qrcode` للنسخة الـ node في بعض إعدادات الـ bundling
    // (الـ SSR شغّال هنا) وساعتها بتفشل في المتصفح — فبنجرب نقطة الدخول الخاصة
    // بالمتصفح كـ fallback بدل ما الكود يرجع من غير QR في صمت.
    const loaders: Array<() => Promise<any>> = [
      () => import('qrcode'),
      () => import('qrcode/lib/browser.js'),
    ];

    for (const load of loaders) {
      try {
        const mod: any = await load();
        const toDataURL = mod?.toDataURL ?? mod?.default?.toDataURL;
        if (typeof toDataURL !== 'function') continue;
        return await toDataURL(url, options);
      } catch (err) {
        console.warn('[ReportPdf] QR generation attempt failed:', err);
      }
    }
    return null;
  }

  private esc(value: unknown): string {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  private async buildDocumentElement(
    data: ReportPdfData,
    meta: KindMeta,
  ): Promise<HTMLElement> {
    const link = this.resolveLink(data);
    const [logo, qr] = await Promise.all([this.loadLogo(), this.buildQr(link)]);

    const host = document.createElement('div');
    // برّه الشاشة، بعرض A4 عند 96dpi. مش display:none — html2canvas محتاج layout حقيقي.
    host.setAttribute('aria-hidden', 'true');
    host.style.cssText = [
      'position:fixed',
      'top:0',
      'left:-20000px',
      'width:794px',
      'background:#FFFFFF',
      'z-index:-1',
      'pointer-events:none',
      // كل الخصائص الموروثة متحطّة صراحة: عشان مايتسربش لون/خط من الصفحة
      // بقيمة oklch (Tailwind v4) للـ canvas ويكسر التحويل.
      `color:${COLOR.ink}`,
      "font-family:'Tajawal','Cairo','Nunito Sans',Arial,sans-serif",
      'font-size:14px',
      'line-height:1.6',
      'direction:rtl',
      'text-align:right',
    ].join(';');

    const items = data.items?.filter((i) => i && i.name) ?? [];

    const itemsHtml = items.length
      ? items
          .map(
            (item, index) => `
        <div style="background:${COLOR.surface};border:1px solid ${COLOR.border};border-radius:14px;padding:14px 16px;margin-bottom:10px;box-shadow:0 1px 2px rgba(15,23,42,0.04);">
          <div style="display:flex;align-items:flex-start;gap:10px;">
            <div style="flex:0 0 26px;width:26px;height:26px;border-radius:8px;background:${meta.accent};color:#FFFFFF;font-size:12px;font-weight:700;line-height:26px;text-align:center;">${index + 1}</div>
            <div style="flex:1 1 auto;">
              <!-- dir=auto: أسماء الأدوية لاتينية جوه مستند RTL، من غيرها الأقواس بتتقلب -->
              <div dir="auto" style="color:${meta.accent};font-size:16px;font-weight:800;margin-bottom:4px;unicode-bidi:isolate;">${this.esc(item.name)}</div>
              <div dir="auto" style="color:${COLOR.body};font-size:13px;font-weight:500;unicode-bidi:isolate;">${this.esc(item.details || 'بدون ملاحظات')}</div>
            </div>
          </div>
        </div>`,
          )
          .join('')
      : `<div style="background:${COLOR.surface};border:1px dashed ${COLOR.border};border-radius:14px;padding:22px;text-align:center;color:${COLOR.muted};font-size:13px;font-weight:600;">${this.esc(meta.emptyText)}</div>`;

    // ملحوظة: من غير letter-spacing. html2canvas بيرسم النص حرف حرف لما يكون فيه
    // تباعد حروف، والعربي وقتها بيتفكّك ويتقلب ("اسم المريض" كانت بتطلع "ﺿﻴﻤﻟﺎ ﺱ").
    const metaCell = (label: string, value: string) => `
      <div style="flex:1 1 0;background:${COLOR.surface};border:1px solid ${COLOR.border};border-radius:14px;padding:12px 14px;">
        <div style="color:${COLOR.muted};font-size:11px;font-weight:700;margin-bottom:4px;">${this.esc(label)}</div>
        <div dir="auto" style="color:${COLOR.ink};font-size:14px;font-weight:800;unicode-bidi:isolate;">${this.esc(value || '—')}</div>
      </div>`;

    host.innerHTML = `
      <div style="padding:0 0 28px;background:#FFFFFF;">

        <!-- Header -->
        <div style="background:linear-gradient(135deg, ${COLOR.primary} 0%, ${COLOR.primaryDark} 100%);padding:26px 32px;color:#FFFFFF;">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:20px;">
            <div style="flex:1 1 auto;">
              <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;">
                ${
                  logo
                    ? `<div style="background:#FFFFFF;border-radius:12px;padding:8px 10px;display:inline-block;">
                         <img src="${logo}" width="120" height="38" style="display:block;width:120px;height:38px;object-fit:contain;" alt="${BRAND_EN}" />
                       </div>`
                    : ''
                }
                <div>
                  <div style="font-size:20px;font-weight:800;color:#FFFFFF;line-height:1.2;">${BRAND_AR}</div>
                  <div style="font-size:12px;font-weight:600;color:#D8EEF9;letter-spacing:0.08em;">${BRAND_EN}</div>
                </div>
              </div>
              <div style="font-size:26px;font-weight:800;color:#FFFFFF;margin-bottom:4px;">${this.esc(meta.title)}</div>
              <div style="font-size:13px;font-weight:600;color:#D8EEF9;">${this.esc(meta.subtitle)} — ${BRAND_TAGLINE}</div>
            </div>

            <div style="flex:0 0 auto;text-align:center;">
              <div style="background:#FFFFFF;border-radius:14px;padding:8px;display:inline-block;box-shadow:0 8px 18px rgba(0,0,0,0.18);">
                ${
                  // خانة محجوزة بس — الصورة نفسها بترسم على الـ canvas بعد
                  // html2canvas (شوف paintQrOnCanvas).
                  qr
                    ? `<div data-qr-slot style="width:104px;height:104px;"></div>`
                    : `<div style="width:104px;height:104px;line-height:104px;color:${COLOR.muted};font-size:11px;">QR</div>`
                }
              </div>
              <div style="font-size:10px;font-weight:700;color:#D8EEF9;margin-top:6px;">امسح لفتح المستند</div>
            </div>
          </div>
        </div>

        <!-- Reference strip -->
        <div style="background:${COLOR.ink};color:#FFFFFF;padding:9px 32px;font-size:12px;font-weight:700;display:flex;justify-content:space-between;">
          <span>رقم المستند: ${this.esc(
            data.reference != null && String(data.reference) !== ''
              ? `${meta.refPrefix}-${data.reference}`
              : 'غير متاح',
          )}</span>
          <span>تاريخ الإصدار: ${this.esc(this.formatDate(data.issuedAt))}</span>
        </div>

        <div style="padding:24px 32px 0;">

          <!-- Parties -->
          <div style="display:flex;gap:12px;margin-bottom:12px;">
            ${metaCell('اسم المريض', data.patientName || '')}
            ${metaCell('الطبيب المعالج', data.doctorName || '')}
          </div>
          <div style="display:flex;gap:12px;margin-bottom:24px;">
            ${metaCell('التخصص', data.doctorSpecialty || '')}
            ${metaCell('رقم ترخيص المزاولة', data.doctorLicense || '')}
          </div>

          <!-- Items -->
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
            <span style="display:inline-block;width:5px;height:22px;border-radius:999px;background:${meta.accent};"></span>
            <span style="color:${COLOR.ink};font-size:18px;font-weight:800;">${this.esc(meta.title)}</span>
            <span style="color:${COLOR.muted};font-size:12px;font-weight:700;">(${items.length})</span>
          </div>

          ${itemsHtml}

          <!-- Footer -->
          <div style="margin-top:26px;padding-top:16px;border-top:1px solid ${COLOR.border};display:flex;justify-content:space-between;align-items:center;gap:16px;">
            <div style="color:${COLOR.muted};font-size:11px;font-weight:600;line-height:1.7;">
              هذا المستند صادر إلكترونيًا من منصة ${BRAND_AR} ولا يحتاج توقيعًا.<br />
              للتحقق أو لعرض المستند أونلاين امسح كود الـ QR بالأعلى.
            </div>
            <div style="color:${COLOR.primary};font-size:11px;font-weight:800;white-space:nowrap;">${BRAND_EN} • ${this.esc(this.formatDate(null))}</div>
          </div>

        </div>
      </div>`;

    if (qr) await this.attachQrImage(host, qr);

    return host;
  }

  /**
   * بيحمّل صورة الـ QR ويعلّقها على الخانة المحجوزة. مش عنصر `<img>` في الـ DOM
   * لأن html2canvas بيتجاهلها — بترسم يدوي بعد كده في `paintQrOnCanvas`.
   */
  private async attachQrImage(host: HTMLElement, qr: string): Promise<void> {
    const slot = host.querySelector<HTMLElement>('[data-qr-slot]');
    if (!slot) return;

    const img = new Image();
    const loaded = await new Promise<boolean>((resolve) => {
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = qr;
      setTimeout(() => resolve(img.complete && img.naturalWidth > 0), 4000);
    });

    if (!loaded) return;
    slot.dataset['qrSrc'] = 'inline';
    (slot as unknown as { __qrImage?: HTMLImageElement }).__qrImage = img;
  }
}
