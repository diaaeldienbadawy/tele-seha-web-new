export class Environment {
  public static readonly production = false;

  public static readonly apiUrl = 'https://teleseha5-001-site1.ftempurl.com';
  //public static readonly apiUrl = 'http://localhost:5159';

  // public static readonly agoraApiGenerateUrl = 'https://agora-generate-token.vercel.app';

  public static readonly agoraAppId = '228103341f494da7ba7fcc336963a004';

  // NOTE: The Agora app certificate is a SECRET and must never be shipped to the client.
  // RTC tokens are issued by the backend at GET /api/meeting/rtc-token/{checkUpId}.

  /**
   * أصل الـ SignalR hubs. بيتحسب من apiUrl عشان مايحصلش اللي حصل قبل كده:
   * الـ apiUrl كان على السيرفر المنشور والـ hubs متسيبة على localhost:5159 —
   * فالشات والـ realtime كانوا بيحاولوا يوصلوا لسيرفر مش شغال أصلًا: الرسايل
   * ماكانتش بتتبعت (ولا حتى بتتخزن، لأن الحفظ بيحصل جوه الـ hub) وكل تحديثات
   * حالة الحجز اللحظية كانت ميتة. الـ hubs متسجّلة على الروت (`/hubs/...`)
   * مش تحت الـ API version، فبنشيل أي `/v{n}` من آخر الـ apiUrl.
   */
  private static readonly hubsOrigin = Environment.apiUrl
    .replace(/\/+$/, '')
    .replace(/\/v\d+$/i, '');

  public static readonly patientnotificationHubUrl = `${Environment.hubsOrigin}/hubs/patient_notification`;

  public static readonly doctornotificationHubUrl = `${Environment.hubsOrigin}/hubs/doctor_notification`;

  public static readonly chatHubUrl = `${Environment.hubsOrigin}/hubs/chat`;
}
