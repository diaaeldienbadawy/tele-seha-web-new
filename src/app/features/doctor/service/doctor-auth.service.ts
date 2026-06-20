import { HttpClient, HttpParams, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SKIP_GLOBAL_ERROR_HANDLING } from '../../../core/interceptor/global-handler.interceptor';
import { Observable } from 'rxjs';
import { Environment } from '../../../../environments/environment.development';
import { INextStep } from '../../../core/models/nextStepEnum';
import { DeviceKeyService } from '../../../shared/services/device-key.service';

@Injectable({
  providedIn: 'root',
})
export class DoctorAuthService {
  constructor(
    readonly http: HttpClient,
    readonly deviceKeyService: DeviceKeyService,
  ) {}

  login(data: any): Observable<any> {
    const deviceKey = this.deviceKeyService.getDeviceKey();
    const payload = { ...data, deviceKey };
    return this.http.post<any>(
      `${Environment.apiUrl}/api/authentication/doctor/login`,
      payload,
    );
  }

  loginMobile(mobile: any): Observable<INextStep> {
    return this.http.post<INextStep>(
      `${Environment.apiUrl}/api/authentication/doctor/is-mobile-registered`,
      { mobile },
    );
  }

  resendOtp(mobile: string): Observable<INextStep> {
    return this.http.post<INextStep>(
      `${Environment.apiUrl}/api/authentication/doctor/resend-otp`,
      { mobile },
    );
  }

  forgorPassword(mobile: any): Observable<any> {
    return this.http.post<any>(
      `${Environment.apiUrl}/api/authentication/doctor/forgot-password`,
      { mobile },
    );
  }

  otpConfirm(data: any): Observable<any> {
    const deviceKey = this.deviceKeyService.getDeviceKey();
    const payload = { ...data, deviceKey };
    return this.http.post<any>(
      `${Environment.apiUrl}/api/authentication/doctor/otp-confirm`,
      payload,
    );
  }

  createPassword(data: any): Observable<any> {
    const deviceKey = this.deviceKeyService.getDeviceKey();
    const payload = { ...data, deviceKey };
    return this.http.post<any>(
      `${Environment.apiUrl}/api/authentication/doctor/create-password`,
      payload,
    );
  }

  basicInfo(data: FormData): Observable<any> {
    const deviceKey = this.deviceKeyService.getDeviceKey();

    data.append('deviceKey', deviceKey);

    return this.http.post<any>(
      `${Environment.apiUrl}/api/doctor-app/doctor`,
      data,
    );
  }

  getDoctorBasicInfo(doctorId: any): Observable<any> {
    return this.http.get<any>(
      `${Environment.apiUrl}/api/doctor-app/doctor/${doctorId}`,
      { context: new HttpContext().set(SKIP_GLOBAL_ERROR_HANDLING, true) }
    );
  }

  updateProfiel(doctorId: any, data: any): Observable<any> {
    return this.http.put<any>(
      `${Environment.apiUrl}/api/doctor-app/doctor/${doctorId}`,
      data,
    );
  }

  doctorProfile(data: FormData): Observable<any> {
    const deviceKey = this.deviceKeyService.getDeviceKey();

    data.append('deviceKey', deviceKey);

    return this.http.post<any>(
      `${Environment.apiUrl}/api/doctor-app/doctor-profile`,
      data,
    );
  }

  getDoctorProfileById(doctorId: any): Observable<any> {
    return this.http.get<any>(
      `${Environment.apiUrl}/api/doctor-app/doctor-profile/${doctorId}`,
      { context: new HttpContext().set(SKIP_GLOBAL_ERROR_HANDLING, true) }
    );
  }

  updateDoctorProfile(doctorId: any, data: FormData): Observable<any> {
     const deviceKey = this.deviceKeyService.getDeviceKey();
     if (!data.has('deviceKey')) data.append('deviceKey', deviceKey);
    return this.http.put<any>(
      `${Environment.apiUrl}/api/doctor-app/doctor-profile/${doctorId}`,
      data,
    );
  }

  doctorCertificate(data: FormData): Observable<any> {
    const deviceKey = this.deviceKeyService.getDeviceKey();

    data.append('deviceKey', deviceKey);
    return this.http.post<any>(
      `${Environment.apiUrl}/api/doctor-app/doctor-certificate`,
      data,
      { context: new HttpContext().set(SKIP_GLOBAL_ERROR_HANDLING, true) }
    );
  }

  getDoctorCertificateById(doctorId: any): Observable<any> {
    return this.http.get<any>(
      `${Environment.apiUrl}/api/doctor-app/doctor-certificate/${doctorId}`,
      { context: new HttpContext().set(SKIP_GLOBAL_ERROR_HANDLING, true) }
    );
  }

  updateDoctorCertificate(doctorId: any, data: FormData): Observable<any> {
      const deviceKey = this.deviceKeyService.getDeviceKey();
     if (!data.has('deviceKey')) data.append('deviceKey', deviceKey);
    return this.http.put<any>(
      `${Environment.apiUrl}/api/doctor-app/doctor-certificate/${doctorId}`,
      data,
      { context: new HttpContext().set(SKIP_GLOBAL_ERROR_HANDLING, true) }
    );
  }

  getDoctorDataList(): Observable<any> {
    return this.http.get<any>(
      `${Environment.apiUrl}/api/shared-data-lists/universities`,
    );
  }
  getDoctorJopTitle(): Observable<any> {
    return this.http.get<any>(
      `${Environment.apiUrl}/api/shared-data-lists/doctor-job-titles`,
    );
  }

  // Recurring Appointment
  getDoctorSchedule(doctorId: any): Observable<any> {
    return this.http.get<any>(
      `${Environment.apiUrl}/api/doctor-app/doctor-schedule/${doctorId}`,
      { context: new HttpContext().set(SKIP_GLOBAL_ERROR_HANDLING, true) }
    );
  }

  createDoctorSchedule(data: any): Observable<any> {
    return this.http.post<any>(
      `${Environment.apiUrl}/api/doctor-app/doctor-schedule`,
      data,
    );
  }

  updateDoctorSchedule(data: any, id: number): Observable<any> {
    return this.http.put<any>(
      `${Environment.apiUrl}/api/doctor-app/doctor-schedule/${id}`,
      data,
    );
  }

  deleteDoctorSchedule(id: any): Observable<any> {
    return this.http.delete<any>(
      `${Environment.apiUrl}/api/doctor-app/doctor-schedule/${id}`,
    );
  }

  // Non Recurring Appointment
  getDoctorSession(doctorId: any): Observable<any> {
    return this.http.get<any>(
      `${Environment.apiUrl}/api/doctor-app/session/editable/${doctorId}`,
      { context: new HttpContext().set(SKIP_GLOBAL_ERROR_HANDLING, true) }
    );
  }

  createDoctorSession(data: any) {
    return this.http.post<any>(
      `${Environment.apiUrl}/api/doctor-app/session`,
      data,
    );
  }

  updateDoctorSession(data: any, id: number): Observable<any> {
    return this.http.put<any>(
      `${Environment.apiUrl}/api/doctor-app/session/${id}`,
      data,
    );
  }

  deleteDoctorSession(id: any): Observable<any> {
    return this.http.delete<any>(
      `${Environment.apiUrl}/api/doctor-app/session/${id}`,
    );
  }

  // Get Deugs List
  getDrugs(search?: string): Observable<any> {
    let params = new HttpParams();

    if (search && search.trim() !== '') {
      params = params.set('search', search);
    }

    return this.http.get<any>(`${Environment.apiUrl}/api/doctor-app/drug`, {
      params,
    });
  }

  // Send Prescription
  sendPrescription(data: any): Observable<any> {
    return this.http.post<any>(
      `${Environment.apiUrl}/api/doctor-app/prescription`,
      data,
    );
  }

  getPrescriptionById(prescriptionId: any): Observable<any> {
    return this.http.get<any>(
      `${Environment.apiUrl}/api/prescription/${prescriptionId}`,
    );
  }

  updatePrescription(data: any, id: number): Observable<any> {
    return this.http.put<any>(
      `${Environment.apiUrl}/api/doctor-app/prescription/${id}`,
      data,
    );
  }

  // Get Radiology List
  getRadiology(search: string): Observable<any> {
    let params = new HttpParams();

    if (search && search.trim() !== '') {
      params = params.set('search', search ?? '');
    }

    return this.http.get<any>(
      `${Environment.apiUrl}/api/doctor-app/radiological-examination`,
      { params },
    );
  }

  sendRadiology(data: any): Observable<any> {
    return this.http.post<any>(
      `${Environment.apiUrl}/api/doctor-app/radiological-examination-request`,
      data,
    );
  }

  getRadiologyById(radiologyId: any): Observable<any> {
    return this.http.get<any>(
      `${Environment.apiUrl}/api/radiological-examination-request/${radiologyId}`,
    );
  }

  updateRadiology(data: any, id: number): Observable<any> {
    return this.http.put<any>(
      `${Environment.apiUrl}/api/doctor-app/radiological-examination-request/${id}`,
      data,
    );
  }

  // Get Lab List
  getLabTest(search: string): Observable<any> {
    let params = new HttpParams();

    if (search && search.trim() !== '') {
      params = params.set('search', search ?? '');
    }

    return this.http.get<any>(
      `${Environment.apiUrl}/api/doctor-app/lab-analysis`,
      { params },
    );
  }

  sendLab(data: any): Observable<any> {
    return this.http.post<any>(
      `${Environment.apiUrl}/api/doctor-app/lab-analysis-request`,
      data,
    );
  }

  getLabById(labId: any): Observable<any> {
    return this.http.get<any>(
      `${Environment.apiUrl}/api/lab-analysis-request/${labId}`,
    );
  }

  updateLab(data: any, id: number): Observable<any> {
    return this.http.put<any>(
      `${Environment.apiUrl}/api/doctor-app/lab-analysis-request/${id}`,
      data,
    );
  }

  // Get Assistants
  getAssistants(): Observable<any> {
    return this.http.get<any>(
      `${Environment.apiUrl}/api/doctor-app/doctor/assistant`,
    );
  }

  // Create Assistant
  createAssistant(data: any): Observable<any> {
    return this.http.post<any>(
      `${Environment.apiUrl}/api/doctor-app/doctor/assistant`,
      data,
    );
  }

  // update Assistant
  updateAssistant(data: any, id: number): Observable<any> {
    return this.http.put<any>(
      `${Environment.apiUrl}/api/doctor-app/doctor/assistant/${id}`,
      data,
    );
  }

  // delete Assistant
  deleteAssistant(id: any): Observable<any> {
    return this.http.put<any>(
      `${Environment.apiUrl}/api/doctor-app/doctor/remove-assistant/${id}`,
      { isDeleted: true },
    );
  }

  bookingFollowup(data: any, id: number): Observable<any> {
    return this.http.post<any>(
      `${Environment.apiUrl}/api/doctor-app/appointment/book-follow-up/${id}`,
      data,
    );
  }
}
