import { Injectable, signal } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { DoctorAuthService } from '../../../features/doctor/service/doctor-auth.service';
import { DoctorsService } from '../../../shared/services/doctors.service';
import { PatientAuthService } from '../../../features/patient/service/patient-auth.service';
import { SpecialtiesService } from '../../../shared/services/specialties.service';
import { ISpecialties } from '../../../shared/interface/specialties.interface';

@Injectable()
export class DoctorRegistrationListsStateService {
  private _specialties = signal<ISpecialties[]>([]);
  readonly specialties = this._specialties.asReadonly();

  private _scientificDegrees = signal<any[]>([]);
  readonly scientificDegrees = this._scientificDegrees.asReadonly();

  private _jobTitles = signal<any[]>([]);
  readonly jobTitles = this._jobTitles.asReadonly();

  private _countries = signal<any[]>([]);
  readonly countries = this._countries.asReadonly();

  private _universities = signal<any[]>([]);
  readonly universities = this._universities.asReadonly();

  constructor(
    private doctorAuthService: DoctorAuthService,
    private doctorService: DoctorsService,
    private patientAuthService: PatientAuthService,
    private specialtiesService: SpecialtiesService
  ) {}

  loadLists(): Observable<any> {
    return forkJoin({
      specialties: this.specialtiesService.getSpecialties().pipe(catchError(() => of({ data: [] }))),
      degrees: this.doctorService.getEnum().pipe(catchError(() => of({}))),
      jobs: this.doctorAuthService.getDoctorJopTitle().pipe(catchError(() => of([]))),
      infoLists: this.patientAuthService.getInfoLists().pipe(catchError(() => of({}))),
      doctorDataList: this.doctorAuthService.getDoctorDataList().pipe(catchError(() => of([]))),
    }).pipe(
      tap((results: any) => {
        // Specialties
        this._specialties.set(results.specialties?.data || results.specialties || []);

        // Scientific Degrees
        const mapping: { [key: string]: string } = {
          'Bachelor': 'Bachelor, BS, B.Sc., MBBCH',
          'Master': 'Master, MS, M.Sc., MPH',
          'Doctorate': 'Doctorate, PhD, MD'
        };
        const resDegrees = results.degrees;
        let mappedDegrees: any[] = [];
        if (resDegrees && Array.isArray(resDegrees.ScientificDegree)) {
          mappedDegrees = resDegrees.ScientificDegree.map((val: string) => ({
            value: val,
            label: mapping[val] || val
          }));
        } else if (resDegrees && resDegrees.ScientificDegree) {
          mappedDegrees = Object.keys(resDegrees.ScientificDegree).map((key: string) => ({
            value: key,
            label: mapping[key] || key
          }));
        } else {
          mappedDegrees = [
            { value: 'Bachelor', label: 'Bachelor, BS, B.Sc., MBBCH' },
            { value: 'Master', label: 'Master, MS, M.Sc., MPH' },
            { value: 'Doctorate', label: 'Doctorate, PhD, MD' }
          ];
        }
        this._scientificDegrees.set(mappedDegrees);

        // Job Titles
        const jobs = (results.jobs || []).map((item: any) => ({
          ...item,
          titleAr: item.titleEn,
          titleEn: item.titleAr
        }));
        this._jobTitles.set(jobs);

        // Countries
        this._countries.set(results.infoLists?.countries || []);

        // Universities
        this._universities.set(results.doctorDataList || []);
      })
    );
  }
}
