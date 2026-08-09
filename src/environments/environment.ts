export class Environment {
  public static readonly production = false;

  public static readonly apiUrl = 'https://teleseha5-001-site1.ftempurl.com/v1';

  // public static readonly apiUrl = 'http://localhost:5159';

  // public static readonly agoraApiGenerateUrl = 'https://agora-generate-token.vercel.app';

  public static readonly agoraAppId = '228103341f494da7ba7fcc336963a004';

  // NOTE: The Agora app certificate is a SECRET and must never be shipped to the client.
  // RTC tokens are issued by the backend at GET /api/meeting/rtc-token/{checkUpId}.

  /** نفس قاعدة environment.development: الـ hubs بتتولد من apiUrl عشان ماتفترقش عنه. */
  private static readonly hubsOrigin = Environment.apiUrl
    .replace(/\/+$/, '')
    .replace(/\/v\d+$/i, '');

  public static readonly patientnotificationHubUrl = `${Environment.hubsOrigin}/hubs/patient_notification`;

  public static readonly doctornotificationHubUrl = `${Environment.hubsOrigin}/hubs/doctor_notification`;

  public static readonly chatHubUrl = `${Environment.hubsOrigin}/hubs/chat`;
}
