export class Environment {
  public static readonly production = false;

  public static readonly apiUrl = 'https://teleseha5-001-site1.ftempurl.com/v1';

  // public static readonly apiUrl = 'http://localhost:5159';

  // public static readonly agoraApiGenerateUrl = 'https://agora-generate-token.vercel.app';

  public static readonly agoraAppId = '228103341f494da7ba7fcc336963a004';

  // NOTE: The Agora app certificate is a SECRET and must never be shipped to the client.
  // RTC tokens are issued by the backend at GET /api/meeting/rtc-token/{checkUpId}.

  // public static readonly patientnotificationHubUrl =
  //   'https://teleseha5-001-site1.ftempurl.com/hubs/patient_notification';
  public static readonly patientnotificationHubUrl = 'http://localhost:5159/hubs/patient_notification';

  // public static readonly doctornotificationHubUrl =
  //   'https://teleseha5-001-site1.ftempurl.com/hubs/doctor_notification';
  public static readonly doctornotificationHubUrl = 'http://localhost:5159/hubs/doctor_notification';

  // public static readonly chatHubUrl =
  //   'https://teleseha5-001-site1.ftempurl.com/hubs/chat';
  public static readonly chatHubUrl = 'http://localhost:5159/hubs/chat';
}
