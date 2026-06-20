import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class PatientProfileService {
  constructor(readonly http: HttpClient) {}

  // // get Profile
  // getProfile(patientId: any): Observable<any> {
  //   return this.http.get<any>(
  //     `${Environment.apiUrl}/api/patient/${patientId}`,
  //   );
  // }

  // // update Profile
  // updateProfile(patientId: any, data: any): Observable<any> {
  //   return this.http.put<any>(
  //     `${Environment.apiUrl}/api/patient/${patientId}`,
  //     data,
  //   );
  // }

}
