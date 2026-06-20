import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class RefreshTokenService {

  constructor(readonly http: HttpClient) { }

  refreshLogin(refreshToken: string) {
    return this.http.post<{ accessToken: string }>(
      `${Environment.apiUrl}/api/authentication/refresh-login`,
      { refreshToken } 
    );
  }
}
