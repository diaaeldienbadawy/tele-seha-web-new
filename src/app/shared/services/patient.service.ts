import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class PatientService {
  constructor(readonly http: HttpClient) {}

  getPatientProfile(patientId: number): Observable<any> {
    return this.http.get<any>(
      `${Environment.apiUrl}/api/admin/patient/${patientId}`,
    );
  }

  updatePatientProfile(patientId: number, data: any): Observable<any> {
    return this.http.put<any>(
      `${Environment.apiUrl}/api/patient/${patientId}`,
      data,
    );
  }

  getPrivacyAndTermsAndPolicy(page: any): Observable<any> {
    return this.http.get(`${Environment.apiUrl}/api/info-page/${page}`);
  }

  receiption(patientId: number, text: string): Observable<any> {
    return this.http.post<any>(
      `${Environment.apiUrl}/api/receiption/${patientId}`,
      JSON.stringify(text),
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  }

  // chage mobile number
  changeMobileNumber(data: any): Observable<any> {
    return this.http.post<any>(
      `${Environment.apiUrl}/api/authentication/change-mobile-number`,
      data,
    );
  }

  // verify otp
  verifyOtp(data: any): Observable<any> {
    return this.http.post<any>(
      `${Environment.apiUrl}/api/authentication/change-mobile-number/otp-confirm`,
      data,
    );
  }

  // Rating Review Doctor
  ratingReviewDoctor(data: any): Observable<any> {
    return this.http.post<any>(`${Environment.apiUrl}/api/rating-review`, data);
  }
}
