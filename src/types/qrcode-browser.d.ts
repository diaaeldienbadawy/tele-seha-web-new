/**
 * الحزمة `qrcode` بتعلن نقطة دخول للمتصفح عن طريق حقل `browser` في package.json،
 * لكن مفيش تعريف types للمسار ده — و`report-pdf.service` بيستخدمه كـ fallback لو
 * الـ bundler وجّه `qrcode` للنسخة الـ node (اللي بتـ require('fs') وبتفشل في
 * المتصفح). التعريف ده بيخلي الـ import ده يعدّي على TypeScript.
 */
declare module 'qrcode/lib/browser.js' {
  export interface QrCodeToDataUrlOptions {
    margin?: number;
    width?: number;
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
    color?: { dark?: string; light?: string };
  }

  export function toDataURL(
    text: string,
    options?: QrCodeToDataUrlOptions,
  ): Promise<string>;

  const qrcodeBrowser: { toDataURL: typeof toDataURL };
  export default qrcodeBrowser;
}
