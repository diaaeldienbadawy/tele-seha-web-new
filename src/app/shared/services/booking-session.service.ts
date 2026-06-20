import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class BookingSessionService {
  constructor(readonly http: HttpClient) {}

  bookingSession(patientId : number , sessionId : number): Observable<any> {

    return this.http.post<any>(`${Environment.apiUrl}/api/appointment`, {
      PatientId: patientId,
      SessionId: sessionId
    });
  }
}
