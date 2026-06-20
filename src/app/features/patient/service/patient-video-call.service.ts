import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class PatientVideoCallService {
  constructor(readonly http: HttpClient) {}

  ratingSession(data: any): Observable<any> {
    return this.http.post<any>(`${Environment.apiUrl}/api/rating-review`, data);
  }

  meetingReports(mettingId: number): Observable<any> {
    return this.http.get<any>(
      `${Environment.apiUrl}/api/meeting/reports/${mettingId}`,
    );
  }

  getMeetingDetails(mettingId: number): Observable<any> {
    return this.http.get<any>(
      `${Environment.apiUrl}/api/meeting/initial-data/${mettingId}`,
    );
  }
  getMeetingReports(mettingId: number): Observable<any> {
    return this.http.get<any>(
      `${Environment.apiUrl}/api/meeting/reports/${mettingId}`,
    );
  }

}
