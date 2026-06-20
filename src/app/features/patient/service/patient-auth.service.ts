import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SKIP_GLOBAL_ERROR_HANDLING } from '../../../core/interceptor/global-handler.interceptor';
import { Observable } from 'rxjs';
import { Environment } from '../../../../environments/environment.development';
import { INextStep } from '../../../core/models/nextStepEnum';
import {
  IBasicInfoRequest,
  IcreatePasswordRequest,
  IpatientLoginRequest,
  IpatientLoginResponse,
  IpatientMobileRequest,
  IpatientOtpConfirmRequest,
} from '../../../shared/interface/patient-login';
import { DeviceKeyService } from '../../../shared/services/device-key.service';

@Injectable({
  providedIn: 'root',
})
export class PatientAuthService {
  constructor(readonly http: HttpClient, readonly deviceKeyService: DeviceKeyService) {}

  login(data: IpatientLoginRequest): Observable<IpatientLoginResponse> {
    const deviceKey = this.deviceKeyService.getDeviceKey();
    const payload = { ...data, deviceKey };
    return this.http.post<IpatientLoginResponse>(
      `${Environment.apiUrl}/api/authentication/login`,
      payload
    );
  }

  loginMobile(mobile: any): Observable<INextStep> {
    return this.http.post<INextStep>(
      `${Environment.apiUrl}/api/authentication/is-mobile-registered`,
      { mobile }
    );
  }

  resendOtp(mobile: string): Observable<INextStep> {
    return this.http.post<INextStep>(
      `${Environment.apiUrl}/api/authentication/resend-otp`,
      { mobile }
    );
  }

  otpConfirm(data: IpatientOtpConfirmRequest): Observable<any> {
    const deviceKey = this.deviceKeyService.getDeviceKey();
    const payload = { ...data, deviceKey };
    return this.http.post<any>(
      `${Environment.apiUrl}/api/authentication/otp-confirm`,
      payload
    );
  }

  createPassword(data: IcreatePasswordRequest): Observable<any> {
    const deviceKey = this.deviceKeyService.getDeviceKey();
    const payload = { ...data, deviceKey };
    return this.http.post<any>(
      `${Environment.apiUrl}/api/authentication/create-password`,
      payload
    );
  }

  basicInfo(data: IBasicInfoRequest): Observable<any> {
    const formData = new FormData();

    formData.append('Name', data.Name);
    formData.append('IsMale', String(data.IsMale));
    formData.append('BirthDate', data.BirthDate);

    return this.http.post<any>(`${Environment.apiUrl}/api/patient`, formData);
  }

  medicalProfileSection(): Observable<any> {
    return this.http.get<any>(
      `${Environment.apiUrl}/api/medical-profile-section`
    );
  }

  medicalProfileSectionByPatientId(patientId: number , sectionId : number ): Observable<any> {
    return this.http.get<any>(
      `${Environment.apiUrl}/api/patient-medical-profile-section/${patientId}/${sectionId}`,
      { context: new HttpContext().set(SKIP_GLOBAL_ERROR_HANDLING, true) }
    );
  }

  savePatientMedicalProfileSection(data: any): Observable<any> {
    return this.http.post<any>(
      `${Environment.apiUrl}/api/patient-medical-profile-section`,
      data
    );
  }

  getInfoLists(): Observable<any> {
    return this.http.get<any>(`${Environment.apiUrl}/api/general/info-lists`);
  }

  completeProfilePatient(data: any , patientId : number ): Observable<any> {
    return this.http.put<any>(
      `${Environment.apiUrl}/api/patient/complete/${patientId}`,
      data
    );
  }

  // Waiting Session

  waitingSession( sessionId : number ): Observable<any> {
    return this.http.get<any>(`${Environment.apiUrl}/api/session/wating-data/${sessionId}`);
  }

  changeMobileNumber(data: any): Observable<any> {
    return this.http.post<any>(
      `${Environment.apiUrl}/api/authentication/change-mobile-number`,
      data
    );
  }

  otpConfirmeChangeMobileNumber(data: any): Observable<any> {
    return this.http.post<any>(
      `${Environment.apiUrl}/api/authentication/change-mobile-number/otp-confirm`,
      data
    );
  }

}
