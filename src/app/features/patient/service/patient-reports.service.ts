import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class PatientReportsService {
  constructor(readonly http: HttpClient) {}

  // get all prescription for patient
  getAllprescription(patientId: any): Observable<any> {
    return this.http.get<any>(
      `${Environment.apiUrl}/api/prescription/all/${patientId}`,
    );
  }

  getPrescriptionById(prescriptionId: any): Observable<any> {
    return this.http.get<any>(
      `${Environment.apiUrl}/api/prescription/${prescriptionId}`,
    );
  }

  // get all radiology for patient
  getAllRadiology(patientId: any): Observable<any> {
    return this.http.get<any>(
      `${Environment.apiUrl}/api/radiological-examination-request/all/${patientId}`,
    );
  }

  getRadiologyById(radiologyId: any): Observable<any> {
    return this.http.get<any>(
      `${Environment.apiUrl}/api/radiological-examination-request/${radiologyId}`,
    );
  }

  sendRadiologyForDoctor(data: any): Observable<any> {
    return this.http.post<any>(
      `${Environment.apiUrl}/api/radiological-examination-result`,
      data,
    );
  }

  // get all lab test for patient
  getAllLabTest(patientId: any): Observable<any> {
    return this.http.get<any>(
      `${Environment.apiUrl}/api/lab-analysis-request/all/${patientId}`,
    );
  }

  getLabTestById(labTestId: any): Observable<any> {
    return this.http.get<any>(
      `${Environment.apiUrl}/api/lab-analysis-request/${labTestId}`,
    );
  }

  sendLabTestForDoctor(data: any): Observable<any> {
    return this.http.post<any>(
      `${Environment.apiUrl}/api/lab-analysis-result`,
      data,
    );
  }


}
