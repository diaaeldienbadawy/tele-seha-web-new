import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Environment } from '../../../environments/environment.development';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PatientChatAiForEnterSessionService {
  constructor(readonly http: HttpClient) {}

  // Get Patient Complaint
  getPatientComplaint(): Observable<any> {
    return this.http.get(`${Environment.apiUrl}/api/patient-complaint`);
  }

  // START complaint
  startPatientComplaint(text: string, appointmentId: number): Observable<any> {
    return this.http.post(
      `${Environment.apiUrl}/api/patient-complaint/start/${appointmentId}`,
      JSON.stringify(text), // 👈 مهم جدًا
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  }

  // CONTINUE complaint
  // CONTINUE complaint
  patientComplaint(text: string, complaintId: string): Observable<any> {
    return this.http.post(
      `${Environment.apiUrl}/api/patient-complaint/${complaintId}`,
      JSON.stringify(text),
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  }


}
