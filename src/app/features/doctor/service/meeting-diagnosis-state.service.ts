import { Injectable, computed, signal } from '@angular/core';

/**
 * حالة "هل اتسجّل تشخيص للميتينج ده؟" مشتركة بين أجزاء شاشة المكالمة.
 *
 * ليه سيرفس مش @Input: أزرار الروشتة/التحاليل/الأشعة عايشة في `popup-doctor`،
 * وزرار إنهاء الكشف عايش في `doctor-meeting-video-call` — كومبوننتس أشقاء،
 * والـ popup نفسه مرسوم مرتين في نفس الصفحة (الجانب + overlay الموبايل).
 * كلهم بيقروا نفس الـ signal فبيتحدثوا مع بعض لحظة حفظ التشخيص.
 *
 * القاعدة نفسها متطبّقة على السيرفر كمان (`Doctor/MeetingController.CloseMeeting`
 * بيرفض الإنهاء من غير تشخيص) — دا مجرد منع مبكر + توضيح للطبيب.
 */
@Injectable({ providedIn: 'root' })
export class MeetingDiagnosisStateService {
  /** الميتينج اللي الحالة دي بتخصه — عشان بيانات ميتينج قديم ماتسربش لميتينج جديد. */
  private readonly _meetingId = signal<number | null>(null);
  private readonly _hasDiagnosis = signal<boolean>(false);

  readonly hasDiagnosis = this._hasDiagnosis.asReadonly();
  readonly meetingId = this._meetingId.asReadonly();

  /** الرسالة اللي بتظهر في الـ tooltip على الأزرار المقفولة. */
  readonly blockedReason = computed(() =>
    this._hasDiagnosis() ? '' : 'اكتب التشخيص أولًا لتفعيل هذا الإجراء',
  );

  /** بتتنادى من صفحة المكالمة بعد تحميل بيانات الميتينج من السيرفر. */
  setFromMeetingReport(meetingId: number | null | undefined, diagnoses: unknown): void {
    this._meetingId.set(meetingId ?? null);
    this._hasDiagnosis.set(Array.isArray(diagnoses) && diagnoses.length > 0);
  }

  /** بعد حفظ تشخيص بنجاح. */
  markDiagnosisRecorded(): void {
    this._hasDiagnosis.set(true);
  }

  reset(): void {
    this._meetingId.set(null);
    this._hasDiagnosis.set(false);
  }
}
