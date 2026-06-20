import { HttpClient, HttpParams, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Environment } from '../../../environments/environment.development';
import { IDoctorResponse } from '../interface/doctor.interface';
import { SKIP_GLOBAL_ERROR_HANDLING } from '../../core/interceptor/global-handler.interceptor';

@Injectable({
  providedIn: 'root',
})
export class DoctorsService {
  constructor(readonly http: HttpClient) {}

  getDoctors(
    Search?: string | null,
    SpecialityId?: number | null,
    ScientificDegree?: string | null,
    MaxPrice?: number | null,
    AvailableDate?: string | null,
    ReadmissionRate?: number | null,
    From?: number | null,
    // Limit?: number | null,
    LastId?: number | null,
    SortBy?: string | null,
  ): Observable<IDoctorResponse> {
    let params = new HttpParams();

    if (Search) params = params.set('Search', Search);
    if (SpecialityId !== null && SpecialityId !== undefined)
      params = params.set('SpecialityId', SpecialityId);

    if (ScientificDegree)
      params = params.set('ScientificDegree', ScientificDegree);

    if (MaxPrice !== null && MaxPrice !== undefined)
      params = params.set('MaxPrice', MaxPrice);

    if (AvailableDate) params = params.set('AvailableDate', AvailableDate);

    if (ReadmissionRate !== null && ReadmissionRate !== undefined)
      params = params.set('ReadmissionRate', ReadmissionRate);

    if (From !== null && From !== undefined) params = params.set('From', From);

    if (LastId !== null && LastId !== undefined)
      params = params.set('LastId', LastId);

    if (SortBy !== null && SortBy !== undefined)
      params = params.set('SortBy', SortBy);

    // if (Limit !== null && Limit !== undefined)
    //   params = params.set('Limit', Limit);

    return this.http.get<IDoctorResponse>(`${Environment.apiUrl}/api/doctor`, {
      params,
    });
  }

  getDoctorProfile(doctorId: number): Observable<any> {
    return this.http.get<any>(
      `${Environment.apiUrl}/api/doctor-profile/${doctorId}`,
    );
  }

  // Update General Information Doctor Profile
  updateDoctorProfile(doctorId: number, data: any): Observable<any> {
    return this.http.put<any>(
      `${Environment.apiUrl}/api/doctor-app/doctor-profile/${doctorId}`,
      data,
    );
  }

  // Update Specialty Information Doctor Profile
  updateDoctorProfileSpecialty(doctorId: number, data: any): Observable<any> {
    return this.http.put<any>(
      `${Environment.apiUrl}/api/doctor-app/doctor/${doctorId}`,
      data,
    );
  }

  // Get Sessions
  getSessions(doctorId: number): Observable<any> {
    return this.http.get<any>(
      `${Environment.apiUrl}/api/doctor/${doctorId}/sessions`,
      { context: new HttpContext().set(SKIP_GLOBAL_ERROR_HANDLING, true) }
    );
  }

  // Get  Appointments
  gethomeAppointments(doctorId: number): Observable<any> {
    return this.http.get<any>(`${Environment.apiUrl}/api/home/${doctorId}`);
  }
  // Get All Appointments
  // getAppointments(doctorId: number): Observable<any> {
  //   return this.http.get<any>(
  //     `${Environment.apiUrl}/api/doctor-app/appointment/all-appointments/${doctorId}`,
  //   );
  // }

  // Get Appointment Today
  getAppointmentsToday(doctorId: number): Observable<any> {
    return this.http.get<any>(
      `${Environment.apiUrl}/api/doctor-app/appointment/today/${doctorId}`,
    );
  }

  // Get Appointment Day
  getAppointmentsDay(date: string, doctorId: number): Observable<any> {
    return this.http.get<any>(
      `${Environment.apiUrl}/api/doctor-app/appointment/day/${date}/${doctorId}`,
    );
  }

  // Get Appointment This Week
  getAppointmentsWeek(doctorId: number): Observable<any> {
    return this.http.get<any>(
      `${Environment.apiUrl}/api/doctor-app/appointment/this-week/${doctorId}`,
    );
  }

  // Get Appointment week Number
  getAppointmentsWeekNumber(
    weekNumber: number,
    doctorId: number,
  ): Observable<any> {
    return this.http.get<any>(
      `${Environment.apiUrl}/api/doctor-app/appointment/week/${weekNumber}/${doctorId}`,
    );
  }

  // Get Follow Up Appointments
  getFollowUpAppointments(doctorId: number): Observable<any> {
    return this.http.get<any>(
      `${Environment.apiUrl}/api/doctor-app/appointment/follow-up-appointments/${doctorId}`,
    );
  }

  // Get All Appointments
  getAllAppointments(doctorId: number): Observable<any> {
    return this.http.get<any>(
      `${Environment.apiUrl}/api/doctor-app/appointment/all/${doctorId}`,
    );
  }

  // Confirm Appointment
  confirmAppointment(appointmentId: number): Observable<any> {
    return this.http.post<any>(
      `${Environment.apiUrl}/api/doctor-app/appointment/confirm/${appointmentId}`,
      {},
    );
  }

  // Open Appointment
  openAppointment(appointmentId: number): Observable<any> {
    return this.http.post<any>(
      `${Environment.apiUrl}/api/doctor-app/appointment/open/${appointmentId}`,
      {},
    );
  }

  // Cancel Appointment
  cancelAppointment(appointmentId: number): Observable<any> {
    return this.http.post<any>(
      `${Environment.apiUrl}/api/doctor-app/appointment/cancel/${appointmentId}`,
      {},
    );
  }

  // close Appointment
  closeAppointment(appointmentId: number): Observable<any> {
    return this.http.post<any>(
      `${Environment.apiUrl}/api/doctor-app/appointment/close/${appointmentId}`,
      {},
    );
  }

  // Update Appointment
  updateAppointment(
    appointmentId: number,
    newSessionId: number,
  ): Observable<any> {
    return this.http.put<any>(
      `${Environment.apiUrl}/api/doctor-app/appointment/${appointmentId}/${newSessionId}`,
      {},
    );
  }

  getMeetingDetails(meetingId: number): Observable<any> {
    return this.http.get<any>(
      `${Environment.apiUrl}/api/meeting/initial-data/${meetingId}`,
    );
  }

  // Get Reports
  getReports(id: number): Observable<any> {
    return this.http.get<any>(
      `${Environment.apiUrl}/api/doctor-app/meeting/reports/${id}`,
    );
  }


  closeMeeting(meetingId: number): Observable<any> {
    return this.http.post<any>(
      `${Environment.apiUrl}/api/doctor-app/meeting/close/${meetingId}`,
      {},
    );
  }

  getEnum(): Observable<any> {
    return this.http.get<any>(`${Environment.apiUrl}/api/enum`);
  }

}
