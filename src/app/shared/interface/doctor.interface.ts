export interface IDoctorResponse {
  doctorId: number;
  doctorProfileId: number | null;
  name: string;
  imageUrl: string;
  specialty: string;
  specialtyId: number;
  scientificDegree: string;
  price: number;
  followUpPrice: number;
  status: string;
  rating: number | null;
  ratingValue: number;
  ratingCount: number;
  readmissionRate: number;
  noShowRate: number;
  consultationCompletionRate: number;
  consultationCancelationRate: number;
  firstAdvantageCount: number;
  firstAdvantageValue: number;
  secondAdvantageCount: number;
  secondAdvantageValue: number;
  thirdAdvantageVount: number;
  thirdAdvantageValue: number;
  followUpCount: number;
  successfuls: number;
  sessions: any | null;
  reviews: any | null;
}
