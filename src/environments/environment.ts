export class Environment {
  public static readonly production = false;

  public static readonly apiUrl = 'https://teleseha5-001-site1.ftempurl.com/v1';
  // public static readonly apiUrl = 'http://localhost:5159';

  // public static readonly agoraApiGenerateUrl = 'https://agora-generate-token.vercel.app';

  public static readonly agoraAppId = '228103341f494da7ba7fcc336963a004';

  public static readonly agoraCertificateId = '4a3bba9e01f345828796240237b03a37';

  public static readonly patientnotificationHubUrl =
    'https://teleseha5-001-site1.ftempurl.com/hubs/patient_notification';
  // 'http://localhost:5159/hubs/patient_notification';

  public static readonly doctornotificationHubUrl =
    'https://teleseha5-001-site1.ftempurl.com/hubs/doctor_notification';
  // 'http://localhost:5159/hubs/doctor_notification';

  public static readonly chatHubUrl =
    'https://teleseha5-001-site1.ftempurl.com/hubs/chat';
  // 'http://localhost:5159/hubs/chat';
}
