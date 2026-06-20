import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Environment } from '../../../environments/environment.development';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SpecialtiesService {
  constructor(readonly http: HttpClient) {}

  // Get All Specialties
  getSpecialties(): Observable<any> {
    return this.http.get<any>(`${Environment.apiUrl}/api/speciality`);
  }
}
