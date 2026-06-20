import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class RecentAppointmentsService {
  constructor(readonly http: HttpClient) {}

  appointmentComming(patientId: number): Observable<any> {
    return this.http.get<any>(
      `${Environment.apiUrl}/api/appointment/comming/${patientId}`,
    );
  }
  appointmentCheckComming(patientId: number): Observable<any> {
    return this.http.get<any>(
      `${Environment.apiUrl}/api/appointment/check-comming/${patientId}`,
    );
  }

  getMeetingSatisfactionRatio(checkupId: number, data: any): Observable<any> {
    return this.http.put(
      `${Environment.apiUrl}/api/meeting/satisfaction-ratio/${checkupId}`,
      data,
    );
  }

  paying(appointmentId: number): Observable<any> {
    return this.http.post<any>(
      `${Environment.apiUrl}/api/appointment/pay/${appointmentId}`,
      {},
    );
  }
}
