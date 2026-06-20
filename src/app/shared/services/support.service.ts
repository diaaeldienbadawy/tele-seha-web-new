import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Environment } from '../../../environments/environment.development';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SupportService {
  constructor(readonly http: HttpClient) {}

  support( data: any): Observable<any> {
    return this.http.post<any>(
      `${Environment.apiUrl}/api/support`,
      data,
    );
  }
}
